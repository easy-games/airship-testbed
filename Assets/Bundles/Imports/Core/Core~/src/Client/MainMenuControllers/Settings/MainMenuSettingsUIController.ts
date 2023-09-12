import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "Client/MainMenuControllers/Settings/ClientSettingsController";
import { AudioManager } from "Shared/Audio/AudioManager";
import { CanvasAPI, PointerDirection } from "Shared/Util/CanvasAPI";
import { MainMenuController } from "../MainMenuController";

@Controller({})
export class MainMenuSettingsUIController implements OnStart {
	constructor(
		private readonly clientSettingsController: ClientSettingsController,
		private readonly mainMenuController: MainMenuController,
	) {}

	OnStart(): void {
		print("MainMenuSettings.OnStart");

		this.clientSettingsController.onSettingsLoaded.Connect(() => {
			this.Setup();
		});
	}

	public Setup(): void {
		this.SetupSlider(
			this.mainMenuController.refs.GetValue("Settings", "MouseSensitivity"),
			this.clientSettingsController.GetMouseSensitivity(),
			(val) => {
				this.clientSettingsController.SetMouseSensitivity(val);
			},
		);
		this.SetupSlider(
			this.mainMenuController.refs.GetValue("Settings", "Volume"),
			this.clientSettingsController.GetGlobalVolume(),
			(val) => {
				this.clientSettingsController.SetGlobalVolume(val);
			},
		);
		this.SetupSlider(
			this.mainMenuController.refs.GetValue("Settings", "AmbientVolume"),
			this.clientSettingsController.GetAmbientVolume(),
			(val) => {
				this.clientSettingsController.SetAmbientVolume(val);
			},
		);
		this.SetupSlider(
			this.mainMenuController.refs.GetValue("Settings", "MusicVolume"),
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
				AudioManager.PlayGlobal("Imports/Core/Shared/Resources/Sound/UI_Select.wav");
			}
		});
	}
}
