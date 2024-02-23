import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { InputAction } from "@Easy/Core/Shared/Input/InputAction";
import { InputUtil } from "@Easy/Core/Shared/Input/InputUtil";
import { Keybind } from "@Easy/Core/Shared/Input/Keybind";
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

	private downPrimaryKeyCode = KeyCode.None;
	private downModifierKey = KeyCode.None;

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
				KeyCode.Escape,
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
			mouse.GetLocation(),
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
						this.UnsetKeybind();
					},
				},
			],
		);
	}

	public ResetToDefault(): void {
		this.inputAction?.ResetKeybind();
	}

	/**
	 *
	 * @param newKeybind
	 */
	private UpdateKeybind(newKeybind: Keybind): void {
		this.inputAction?.UpdateKeybind(newKeybind);
	}

	/**
	 *
	 */
	private UnsetKeybind(): void {
		this.inputAction?.UnsetKeybind();
	}

	/**
	 *
	 * @param action
	 */
	public Init(action: InputAction) {
		this.inputAction = action;
		this.title.text = FormatUtil.ToDisplayFormat(action.name);
		this.UpdateKeybindTextFromKeybind(action.keybind);

		Airship.input.onActionUnbound.Connect((unbound) => {
			if (unbound !== action) return;
			this.UpdateKeybindTextFromKeybind(unbound.keybind);
		});

		Airship.input.onActionBound.Connect((bound) => {
			if (bound !== action) return;
			this.UpdateKeybindTextFromKeybind(bound.keybind);
		});

		this.SetListening(false);
		this.StartKeyListener();
	}

	private StartKeyListener(): void {
		SetInterval(InputPollRate, () => {
			if (this.isListening) {
				if (this.downModifierKey !== KeyCode.None && !Input.GetKey(this.downModifierKey)) {
					this.UpdateKeybind(new Keybind(this.downModifierKey));
					this.SetListening(false);
				}
				for (let keyCode of ObjectUtils.keys(InputUtils.keyCodeMap) as KeyCode[]) {
					if (Input.GetKey(keyCode)) {
						const modifierKey = InputUtil.GetModifierFromKeyCode(keyCode);
						if (modifierKey) {
							this.downModifierKey = keyCode;
							const keyCodeText =
								InputUtils.GetStringForKeyCode(this.downModifierKey) ??
								`Unknown(${this.downModifierKey})`;
							const complexKeyCodeText = `${keyCodeText} + `;
							this.UpdateKeybindText(complexKeyCodeText);
						} else {
							if (keyCode !== this.downModifierKey && this.downModifierKey !== KeyCode.None) {
								const modifierKey = InputUtil.GetModifierFromKeyCode(this.downModifierKey);
								this.UpdateKeybind(new Keybind(keyCode, modifierKey!));
								this.SetListening(false);
							} else {
								this.UpdateKeybind(new Keybind(keyCode));
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
	private UpdateKeybindTextFromKeybind(keybind: Keybind): void {
		if (!keybind.IsComplexKeybind()) {
			const bindingText = InputUtils.GetStringForKeyCode(keybind.primaryKey) ?? `Unknown(${keybind.primaryKey})`;
			this.UpdateKeybindText(bindingText);
		} else {
			const primaryKeyCodeText =
				InputUtils.GetStringForKeyCode(keybind.primaryKey) ?? `Unknown(${keybind.primaryKey})`;
			const modifierAsKeyCode = InputUtil.GetKeyCodeFromModifier(keybind.modifierKey);
			const modifierKeyCodeText =
				InputUtils.GetStringForKeyCode(modifierAsKeyCode) ?? `Unknown(${modifierAsKeyCode})`;
			const bindingText = `${modifierKeyCodeText} + ${primaryKeyCodeText}`;
			this.UpdateKeybindText(bindingText);
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
			this.downModifierKey = KeyCode.None;
			this.downPrimaryKeyCode = KeyCode.None;
			this.overlay.SetActive(false);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
