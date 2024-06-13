import { ClientSettingsController } from "@Easy/Core/Client/ProtectedControllers/Settings/ClientSettingsController";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { MainMenuSingleton } from "../../Singletons/MainMenuSingleton";

export default class SettingsPage extends AirshipBehaviour {
	public sidebar!: RectTransform;
	public tabs!: RectTransform;
	public scrollView!: RectTransform;

	@Header("Sliders")
	public mouseSensitivityGO!: GameObject;
	public mouseSmoothingGO!: GameObject;
	public touchSensitibityGO!: GameObject;
	public volumeGO!: GameObject;

	// public mobilePages!: RectTransform[];

	private bin = new Bin();

	public OnEnable(): void {
		if (!Game.IsClient()) return;

		const rect = this.gameObject.transform as RectTransform;
		const mainMenu = Dependency<MainMenuSingleton>();
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm" && Game.IsMobile()) {
					this.sidebar.gameObject.SetActive(false);
					this.scrollView.offsetMax = new Vector2(-5, -7);
					this.scrollView.offsetMin = new Vector2(5, 0);
					// rect.offsetMax = new Vector2(rect.offsetMax.x, 40);
					// rect.offsetMin = new Vector2(rect.offsetMin.x, 0);

					// for (let page of this.mobilePages) {
					// 	page.gameObject.SetActive(true);
					// }

					// const navbarDisc = mainMenu.navbarModifier.Add({ hidden: true });
					// this.bin.Add(navbarDisc);
					// return () => {
					// 	navbarDisc();
					// };

					if (Game.deviceType === AirshipDeviceType.Phone) {
						this.tabs.GetChild(0).gameObject.SetActive(true); // Input
						this.tabs.GetChild(1).gameObject.SetActive(true); // Sound
						// this.tabs.GetChild(2).gameObject.SetActive(true); // Microphone
						this.tabs.GetChild(4).gameObject.SetActive(true); // Blocked
						this.tabs.GetChild(5).gameObject.SetActive(true); // Developer
						this.tabs.GetChild(6).gameObject.SetActive(true); // Other
					}
				} else {
					// rect.offsetMax = new Vector2(rect.offsetMax.x, 0);
					// this.sidebar.gameObject.SetActive(true);
					// this.tabs.offsetMax = new Vector2(-41, -49);
					// this.tabs.offsetMin = new Vector2(270, -mainMenu.screenSize.y);
				}
			}),
		);

		const clientSettingsController = Dependency<ClientSettingsController>();

		this.SetupSlider(this.mouseSensitivityGO, clientSettingsController.GetMouseSensitivity(), (val) => {
			clientSettingsController.SetMouseSensitivity(val);
		});
		this.SetupSlider(this.mouseSmoothingGO, clientSettingsController.GetMouseSmoothing(), (val) => {
			clientSettingsController.SetMouseSmoothing(val);
		});
		this.SetupSlider(this.touchSensitibityGO, clientSettingsController.GetTouchSensitivity(), (val) => {
			clientSettingsController.SetTouchSensitivity(val);
		});
		this.SetupSlider(this.volumeGO, clientSettingsController.GetGlobalVolume(), (val) => {
			clientSettingsController.SetGlobalVolume(val);
		});
	}

	private SetupSlider(go: GameObject, startingValue: number, onChange: (val: number) => void): void {
		const transform = go.transform;
		const inputField = transform.FindChild("InputField")!.GetComponent<TMP_InputField>()!;
		const slider = transform.FindChild("Slider")!.GetComponent<Slider>()!;

		let valRounded = math.floor(startingValue * 10) / 10;
		slider.value = valRounded;
		inputField.text = valRounded + "";

		let ignoreNextSliderChange = false;
		let ignoreNextInputFieldChange = false;

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(inputField.gameObject, () => {
				if (ignoreNextInputFieldChange) {
					ignoreNextInputFieldChange = false;
					return;
				}

				const value = tonumber(inputField.text);
				if (value === undefined) return;

				ignoreNextSliderChange = true;
				onChange(value);
				slider.value = value;
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnValueChangeEvent(slider.gameObject, (value) => {
				if (ignoreNextSliderChange) {
					ignoreNextSliderChange = false;
					return;
				}

				ignoreNextInputFieldChange = true;
				onChange(value);
				inputField.text = math.floor(value * 100) / 100 + "";
			}),
		);

		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(slider.gameObject, (direction) => {
				if (direction === PointerDirection.DOWN) {
					this.PlaySelectSound();
				}
			}),
		);
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
		AudioManager.PlayGlobal("AirshipPackages/@Easy/Core/Sound/UI_Select.wav");
	}

	public OnDisable(): void {
		this.bin.Clean();
	}
}
