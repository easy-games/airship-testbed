import ObjectUtils from "@easy-games/unity-object-utils";
import { Mouse } from "../../UserInput";
import { AppManager } from "../../Util/AppManager";
import { Bin } from "../../Util/Bin";
import { CanvasAPI, HoverState } from "../../Util/CanvasAPI";
import { InputUtils } from "../../Util/InputUtils";
import { SignalPriority } from "../../Util/Signal";
import { Theme } from "../../Util/Theme";

export default class SettingsKeybind extends AirshipBehaviour {
	public title!: TMP_Text;
	public valueWrapper!: GameObject;
	public valueText!: TMP_Text;
	public valueImageBG!: Image;
	public overlay!: GameObject;

	@NonSerialized()
	public keyCode: KeyCode | undefined;

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
						this.SetKeyCode(undefined);
					}
				},
				SignalPriority.HIGHEST,
			),
		);

		const mouse = new Mouse();
		this.bin.Add(mouse);
	}

	public Update(dt: number): void {
		if (this.isListening) {
			for (let keycode of ObjectUtils.keys(InputUtils.keyCodeMap) as KeyCode[]) {
				if (Input.GetKey(keycode)) {
					this.SetKeyCode(keycode);
				}
			}
		}
	}

	private SetKeyCode(keyCode: KeyCode | undefined): void {
		this.keyCode = keyCode;
		this.SetListening(false);
	}

	private SetListening(listening: boolean): void {
		this.isListening = listening;
		if (listening) {
			this.valueText.text = "PRESS A KEY";
			this.valueImageBG.color = Theme.primary;
			this.overlay.SetActive(true);
		} else {
			let str = "";
			if (this.keyCode) {
				str = InputUtils.GetStringForKeyCode(this.keyCode) ?? "unknown (" + this.keyCode + ")";
			}
			this.valueText.text = str;
			this.valueImageBG.color = new Color(1, 1, 1, 0.02);
			this.overlay.SetActive(false);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
