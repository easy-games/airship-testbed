import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { InputAction } from "@Easy/Core/Shared/Input/InputAction";
import { Keybind } from "@Easy/Core/Shared/Input/Keybind";
import ObjectUtils from "@easy-games/unity-object-utils";
import { Mouse } from "../../../UserInput";
import { AppManager } from "../../../Util/AppManager";
import { Bin } from "../../../Util/Bin";
import { CanvasAPI, HoverState, PointerButton, PointerDirection } from "../../../Util/CanvasAPI";
import { InputUtils } from "../../../Util/InputUtils";
import { SignalPriority } from "../../../Util/Signal";
import { Theme } from "../../../Util/Theme";

export default class SettingsKeybind extends AirshipBehaviour {
	public title!: TMP_Text;
	public valueWrapper!: GameObject;
	public valueText!: TMP_Text;
	public valueImageBG!: Image;
	public overlay!: GameObject;

	private inputAction: InputAction | undefined;

	private isListening = false;

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
		this.title.text = action.name;
		this.UpdateKeybindTextFromKeyCode(action.keybind.primaryKey);

		Airship.input.onActionUnbound.Connect((unbound) => {
			if (unbound !== action) return;
			this.UpdateKeybindTextFromKeyCode(unbound.keybind.primaryKey);
		});

		Airship.input.onActionBound.Connect((bound) => {
			if (bound !== action) return;
			this.UpdateKeybindTextFromKeyCode(bound.keybind.primaryKey);
		});

		this.SetListening(false);
	}

	public Update(_dt: number): void {
		if (this.isListening) {
			for (let keycode of ObjectUtils.keys(InputUtils.keyCodeMap) as KeyCode[]) {
				if (Input.GetKey(keycode)) {
					this.UpdateKeybind(new Keybind(keycode));
					this.SetListening(false);
				}
			}
		}
	}

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
	private UpdateKeybindTextFromKeyCode(keyCode: KeyCode): void {
		const keyCodeText = InputUtils.GetStringForKeyCode(keyCode);
		this.UpdateKeybindText(keyCodeText ?? `Unknown(${keyCode})`);
	}

	private SetListening(listening: boolean): void {
		if (!this.inputAction) return;
		this.isListening = listening;
		if (listening) {
			this.UpdateKeybindText("PRESS A KEY");
			this.valueImageBG.color = Theme.primary;
			this.overlay.SetActive(true);
		} else {
			this.overlay.SetActive(false);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
