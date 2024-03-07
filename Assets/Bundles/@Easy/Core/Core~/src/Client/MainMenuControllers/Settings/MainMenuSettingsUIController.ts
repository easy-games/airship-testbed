import { ClientSettingsController } from "Client/MainMenuControllers/Settings/ClientSettingsController";
import { AudioManager } from "Shared/Audio/AudioManager";
import { Controller, OnStart } from "Shared/Flamework";
import { CanvasAPI, PointerDirection } from "Shared/Util/CanvasAPI";
import { MainMenuController } from "../MainMenuController";

@Controller({})
export class MainMenuSettingsUIController implements OnStart {
	constructor(
		private readonly clientSettingsController: ClientSettingsController,
		private readonly mainMenuController: MainMenuController,
	) {}

	OnStart(): void {
		this.clientSettingsController.WaitForSettingsLoaded().then(() => {
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
			this.mainMenuController.refs.GetValue("Settings", "TouchSensitivity"),
			this.clientSettingsController.GetTouchSensitivity(),
			(val) => {
				this.clientSettingsController.SetTouchSensitivity(val);
			},
		);
		this.SetupSlider(
			this.mainMenuController.refs.GetValue("Settings", "Volume"),
			this.clientSettingsController.GetGlobalVolume(),
			(val) => {
				this.clientSettingsController.SetGlobalVolume(val);
			},
		);

		// HD Rendering
		// const toggleHD: Toggle = this.mainMenuController.refs.GetValue("Settings", "HDToggle");
		// toggleHD.isOn = this.clientSettingsController.GetScreenshotRenderHD();
		// this.SetupToggle(toggleHD, (value) => {
		// 	this.clientSettingsController.SetScreenshotRenderHD(value);
		// });

		// Screenshot UI
		// const toggleUI: Toggle = this.mainMenuController.refs.GetValue("Settings", "UIToggle");
		// toggleUI.isOn = this.clientSettingsController.GetScreenshotShowUI();
		// this.SetupToggle(toggleUI, (value) => {
		// 	this.clientSettingsController.SetScreenshotShowUI(value);
		// });
	}

	private SetupSlider(go: GameObject, startingValue: number, onChange: (val: number) => void): void {
		const transform = go.transform;
		const inputField = transform.FindChild("InputField")!.GetComponent<TMP_InputField>();
		const slider = transform.FindChild("Slider")!.GetComponent<Slider>();

		let valRounded = math.floor(startingValue * 10) / 10;
		slider.value = valRounded;
		inputField.text = valRounded + "";

		CanvasAPI.OnValueChangeEvent(slider.gameObject, (value) => {
			onChange(value);
			inputField.text = math.floor(value * 100) / 100 + "";
		});

		CanvasAPI.OnPointerEvent(slider.gameObject, (direction) => {
			if (direction === PointerDirection.DOWN) {
				this.PlaySelectSound();
			}
		});
	}

	private SetupToggle(toggle: Toggle, onChange: (val: boolean) => void): void {
		CanvasAPI.OnToggleValueChangeEvent(toggle.gameObject, (value) => {
			this.PlaySelectSound();
			onChange(value);
		});

		CanvasAPI.OnPointerEvent(toggle.gameObject, (direction) => {
			if (direction === PointerDirection.DOWN) {
				this.PlaySelectSound();
			}
		});
	}

	private PlaySelectSound() {
		AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/UI_Select.wav");
	}
}
