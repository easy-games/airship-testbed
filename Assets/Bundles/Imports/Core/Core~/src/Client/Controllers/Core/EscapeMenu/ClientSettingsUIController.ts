import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "Client/Controllers/ClientSettings/ClientSettingsController";
import { AudioManager } from "Shared/Audio/AudioManager";
import { CanvasAPI, PointerDirection } from "Shared/Util/CanvasAPI";
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
			this.refs.GetValue("UI", "AmbientVolume"),
			this.clientSettingsController.GetAmbientVolume(),
			(val) => {
				this.clientSettingsController.SetAmbientVolume(val);
			},
		);
		this.SetupSlider(
			this.refs.GetValue("UI", "MusicVolume"),
			this.clientSettingsController.GetAmbientVolume(),
			(val) => {
				this.clientSettingsController.SetMusicVolume(val);
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
				AudioManager.PlayGlobal("UI_Select.wav");
			}
		});
	}
}
