import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { InputAction } from "@Easy/Core/Shared/Input/InputAction";
import { InputUtil } from "@Easy/Core/Shared/Input/InputUtil";
import { FormatUtil } from "@Easy/Core/Shared/Util/FormatUtil";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import ObjectUtils from "@easy-games/unity-object-utils";
import { Keyboard, Mouse } from "../../../UserInput";
import { AppManager } from "../../../Util/AppManager";
import { Bin } from "../../../Util/Bin";
import { CanvasAPI, HoverState, PointerButton, PointerDirection } from "../../../Util/CanvasAPI";
import { InputUtils } from "../../../Util/InputUtils";
import { SignalPriority } from "../../../Util/Signal";
import { Theme } from "../../../Util/Theme";
import { Binding } from "@Easy/Core/Shared/Input/Binding";

/**
 *
 */
const InputPollRate = 0.025;

export default class SettingsKeybind extends AirshipBehaviour {
	public title!: TMP_Text;
	public valueWrapper!: GameObject;
	public valueText!: TMP_Text;
	public valueImageBG!: Image;
	public overlay!: GameObject;

	private inputDevice = new Keyboard();

	private inputAction: InputAction | undefined;

	private isListening = false;

	private downPrimaryKeyCode = Key.None;
	private downModifierKey = Key.None;

	private bin = new Bin();

	override OnEnable(): void {
		this.overlay.SetActive(false);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(this.valueWrapper, () => {
				if (this.isListening) return;
				this.SetListening(true);
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.valueWrapper, (dir, btn) => {
				if (btn === PointerButton.RIGHT && dir === PointerDirection.DOWN) {
					this.OpenRightClick();
				}
			}),
		);
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.title.gameObject, (dir, btn) => {
				if (btn === PointerButton.RIGHT && dir === PointerDirection.DOWN) {
					this.OpenRightClick();
				}
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.valueWrapper, (hoverState) => {
				if (this.isListening) return;
				if (hoverState === HoverState.ENTER) {
					this.valueImageBG.color = new Color(1, 1, 1, 0.06);
				} else {
					this.valueImageBG.color = new Color(1, 1, 1, 0.02);
				}
			}),
		);

		this.bin.Add(
			AppManager.keyboard.OnKeyDown(
				Key.Escape,
				(event) => {
					if (this.isListening) {
						event.SetCancelled(true);
						//this.SetKeyCode(KeyCode.None);
					}
				},
				SignalPriority.HIGHEST,
			),
		);

		const mouse = new Mouse();
		this.bin.Add(mouse);
	}

	private OpenRightClick(): void {
		const mouse = new Mouse();
		Dependency<RightClickMenuController>().OpenRightClickMenu(
			Dependency<MainMenuController>().mainContentCanvas,
			mouse.GetPosition(),
			[
				{
					text: "Reset",
					onClick: () => {
						this.ResetToDefault();
					},
				},
				{
					text: "Clear",
					onClick: () => {
						//this.SetToNone(true);
						this.UnsetBinding();
					},
				},
			],
		);
	}

	public ResetToDefault(): void {
		this.inputAction?.ResetBinding();
	}

	/**
	 *
	 * @param newBinding
	 */
	private UpdateBinding(newBinding: Binding): void {
		this.inputAction?.UpdateBinding(newBinding);
	}

	/**
	 *
	 */
	private UnsetBinding(): void {
		this.inputAction?.UnsetBinding();
	}

	/**
	 *
	 * @param action
	 */
	public Init(action: InputAction) {
		this.inputAction = action;
		this.title.text = FormatUtil.ToDisplayFormat(action.name);
		this.UpdateBindingTextFromBinding(action.binding);

		Airship.input.onActionUnbound.Connect((unbound) => {
			if (unbound !== action) return;
			this.UpdateBindingTextFromBinding(unbound.binding);
			this.HighlightValueImage();
		});

		Airship.input.onActionBound.Connect((bound) => {
			if (bound !== action) return;
			this.UpdateBindingTextFromBinding(bound.binding);
		});

		this.SetListening(false);
		this.StartKeyListener();
	}

	/**
	 *
	 */
	private HighlightValueImage(): void {
		this.valueImageBG.TweenGraphicColor(new Color(1, 1, 1, 0.5), 0.25).SetPingPong();
	}

	private StartKeyListener(): void {
		SetInterval(InputPollRate, () => {
			if (this.isListening) {
				if (this.downModifierKey !== Key.None && !Keyboard.global.IsKeyDown(this.downModifierKey)) {
					this.UpdateBinding(Binding.Key(this.downModifierKey));
					this.SetListening(false);
				}
				for (let key of ObjectUtils.keys(InputUtils.keyCodeMap) as Key[]) {
					if (Keyboard.global.IsKeyDown(key)) {
						const modifierKey = InputUtil.GetModifierFromKey(key);
						if (modifierKey) {
							this.downModifierKey = key;
							const keyCodeText =
								InputUtils.GetStringForKeyCode(this.downModifierKey) ??
								`Unknown(${this.downModifierKey})`;
							const complexKeyCodeText = `${keyCodeText} + `;
							this.UpdateKeybindText(complexKeyCodeText);
						} else {
							if (key !== this.downModifierKey && this.downModifierKey !== Key.None) {
								const modifierKey = InputUtil.GetModifierFromKey(this.downModifierKey);
								this.UpdateBinding(Binding.Key(key, modifierKey!));
								this.SetListening(false);
							} else {
								this.UpdateBinding(Binding.Key(key));
								this.SetListening(false);
							}
						}
					}
				}
			}
		});
	}

	public Update(dt: number): void {}

	/**
	 *
	 * @param text
	 */
	private UpdateKeybindText(text: string): void {
		this.valueText.text = text;
	}

	/**
	 *
	 * @param keyCode
	 */
	private UpdateBindingTextFromBinding(binding: Binding): void {
		if (binding.config.isKeyBinding) {
			if (!binding.IsComplexBinding()) {
				const bindingText =
					InputUtils.GetStringForKeyCode(binding.config.key) ?? `Unknown(${binding.config.key})`;
				this.UpdateKeybindText(bindingText);
			} else {
				const primaryKeyCodeText =
					InputUtils.GetStringForKeyCode(binding.config.key) ?? `Unknown(${binding.config.key})`;
				const modifierAsKeyCode = InputUtil.GetKeyFromModifier(binding.config.modifierKey);
				const modifierKeyCodeText =
					InputUtils.GetStringForKeyCode(modifierAsKeyCode) ?? `Unknown(${modifierAsKeyCode})`;
				const bindingText = `${modifierKeyCodeText} + ${primaryKeyCodeText}`;
				this.UpdateKeybindText(bindingText);
			}
		} else {
			if (!binding.IsComplexBinding()) {
				const bindingText =
					InputUtils.GetStringForMouseButton(binding.config.mouseButton) ??
					`Unknown(${binding.config.mouseButton})`;
				this.UpdateKeybindText(bindingText);
			} else {
				const primaryKeyCodeText =
					InputUtils.GetStringForMouseButton(binding.config.mouseButton) ??
					`Unknown(${binding.config.mouseButton})`;
				const modifierAsKeyCode = InputUtil.GetKeyFromModifier(binding.config.modifierKey);
				const modifierKeyCodeText =
					InputUtils.GetStringForKeyCode(modifierAsKeyCode) ?? `Unknown(${modifierAsKeyCode})`;
				const bindingText = `${modifierKeyCodeText} + ${primaryKeyCodeText}`;
				this.UpdateKeybindText(bindingText);
			}
		}
	}

	private SetListening(listening: boolean): void {
		if (!this.inputAction) return;
		this.isListening = listening;
		if (listening) {
			this.UpdateKeybindText("PRESS A KEY");
			this.valueImageBG.color = Theme.primary;
			this.overlay.SetActive(true);
		} else {
			this.downModifierKey = Key.None;
			this.downPrimaryKeyCode = Key.None;
			this.overlay.SetActive(false);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
