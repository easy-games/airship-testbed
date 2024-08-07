import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { InputAction } from "@Easy/Core/Shared/Input/InputAction";
import { InputUtil } from "@Easy/Core/Shared/Input/InputUtil";
import { FormatUtil } from "@Easy/Core/Shared/Util/FormatUtil";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { Keyboard, Mouse } from "../../../UserInput";
import { Bin } from "../../../Util/Bin";
import { CanvasAPI, HoverState, PointerButton, PointerDirection } from "../../../Util/CanvasAPI";
import { InputUtils } from "../../../Util/InputUtils";
import { SignalPriority } from "../../../Util/Signal";
import { Theme } from "../../../Util/Theme";

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
			Keyboard.OnKeyDown(
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
	}

	private OpenRightClick(): void {
		Dependency<RightClickMenuController>().OpenRightClickMenu(
			Dependency<MainMenuController>().mainContentCanvas,
			Mouse.position,
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

		Airship.Input.onActionUnbound.Connect((unbound) => {
			if (unbound !== action) return;
			this.UpdateBindingTextFromBinding(unbound.binding);
			this.HighlightValueImage();
		});

		Airship.Input.onActionBound.Connect((bound) => {
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
		NativeTween.GraphicColor(this.valueImageBG, new Color(1, 1, 1, 0.5), 0.25)
			.SetPingPong()
			.SetUseUnscaledTime(true);
	}

	private StartKeyListener(): void {
		SetInterval(InputPollRate, () => {
			if (!this.isListening) return;

			if (this.downModifierKey !== Key.None && !Keyboard.IsKeyDown(this.downModifierKey)) {
				this.UpdateBinding(Binding.Key(this.downModifierKey));
				this.SetListening(false);
			}

			if (Mouse.isLeftDown) {
				this.UpdateBinding(Binding.MouseButton(MouseButton.LeftButton));
				this.SetListening(false);
			}

			if (Mouse.isRightDown) {
				this.UpdateBinding(Binding.MouseButton(MouseButton.RightButton));
				this.SetListening(false);
			}

			for (let key of ObjectUtils.keys(InputUtils.keyCodeMap) as Key[]) {
				if (key === Key.None) continue;
				if (Keyboard.IsKeyDown(key) && this.isListening) {
					const modifierKey = InputUtil.GetModifierFromKey(key);
					if (modifierKey) {
						this.downModifierKey = key;
						const keyCodeText =
							InputUtils.GetStringForKeyCode(this.downModifierKey) ?? `Unknown(${this.downModifierKey})`;
						const complexKeyCodeText = `${keyCodeText} + `;
						if (complexKeyCodeText !== this.valueText.text) {
							this.UpdateKeybindText(complexKeyCodeText);
						}
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
			EventSystem.current.SetSelectedGameObject(this.gameObject);
			this.UpdateKeybindText("PRESS A KEY");
			this.valueImageBG.color = Theme.primary;
			this.overlay.SetActive(true);
		} else {
			EventSystem.current.SetSelectedGameObject(undefined);
			this.downModifierKey = Key.None;
			this.downPrimaryKeyCode = Key.None;
			this.overlay.SetActive(false);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
