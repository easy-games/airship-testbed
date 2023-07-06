import { Controller, OnStart } from "@easy-games/flamework-core";
import { CanvasAPI, PointerDirection } from "Shared/Util/CanvasAPI";
import { SoundUtil } from "Shared/Util/SoundUtil";
import { ClientSettingsController } from "../../ClientSettings/ClientSettingsController";
import { EscapeMenuController } from "./EscapeMenuController";

@Controller({})
export class ClientSettingsUIController implements OnStart {
	private refs: GameObjectReferences;

	constructor(
		private readonly clientSettingsController: ClientSettingsController,
		private readonly escapeMenuController: EscapeMenuController,
	) {
		const settingsCanvasGO = this.escapeMenuController.refs.GetValue("Tabs", "Settings");
		this.refs = settingsCanvasGO.GetComponent<GameObjectReferences>();
	}
	OnStart(): void {
		this.SetupSlider(
			this.refs.GetValue("UI", "MouseSensitivity"),
			this.clientSettingsController.GetMouseSensitivity(),
			(val) => {
				this.clientSettingsController.SetMouseSensitivity(val);
			},
		);
		this.SetupSlider(this.refs.GetValue("UI", "Volume"), this.clientSettingsController.GetGlobalVolume(), (val) => {
			this.clientSettingsController.SetGlobalVolume(val);
		});
		this.SetupSlider(
			this.refs.GetValue("UI", "AmbientSound"),
			this.clientSettingsController.GetAmbientSound(),
			(val) => {
				this.clientSettingsController.SetAmbientSound(val);
			},
		);
	}
	private SetupSlider(go: GameObject, startingValue: number, onChange: (val: number) => void): void {
		const transform = go.transform;
		const inputField = transform.FindChild("InputField")!.GetComponent<TMP_InputField>();
		const slider = transform.FindChild("Slider")!.GetComponent<Slider>();

		slider.value = startingValue;
		inputField.text = startingValue + "";

		CanvasAPI.OnValueChangeEvent(slider.gameObject, (value) => {
			onChange(value);
			inputField.text = math.floor(value * 100) / 100 + "";
		});

		CanvasAPI.OnPointerEvent(slider.gameObject, (direction) => {
			if (direction === PointerDirection.DOWN) {
				SoundUtil.PlayGlobal("UI_Click.wav");
			}
		});
	}
}
