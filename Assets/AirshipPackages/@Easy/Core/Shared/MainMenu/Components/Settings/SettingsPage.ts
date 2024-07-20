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
	public canvasScalar: CanvasScaler;
	public verticalLayoutGroup: VerticalLayoutGroup;
	public rightSection: RectTransform;
	public mobileHeader: RectTransform;
	public desktopCloseButtonWrapper: RectTransform;
	public mobileCloseButtonWrapper: RectTransform;

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
		this.bin.Add(() => {
			mainMenu.SetHideMobileEscapeButton(false);
		});

		mainMenu.SetHideMobileEscapeButton(true);
		this.bin.Add(
			mainMenu.ObserveScreenSize((size) => {
				if (size === "sm" && Game.IsMobile()) {
					const notchHeight = Game.GetNotchHeight();

					this.sidebar.gameObject.SetActive(false);
					// this.scrollView.offsetMax = new Vector2(-5, -7);
					// this.scrollView.offsetMin = new Vector2(5, 0);
					// this.scrollView.anchoredPosition = new Vector2(0, -96);
					this.scrollView.offsetMax = new Vector2(0, -notchHeight - 70);
					this.scrollView.offsetMin = new Vector2(0, 0);

					this.mobileHeader.gameObject.SetActive(true);
					this.mobileHeader.sizeDelta = new Vector2(this.mobileHeader.sizeDelta.x, notchHeight + 70);

					this.desktopCloseButtonWrapper.gameObject.SetActive(false);
					this.canvasScalar.matchWidthOrHeight = 1;
					this.rightSection.anchorMin = new Vector2(0, 0);
					this.rightSection.anchoredPosition = new Vector2(0, 0);
					this.verticalLayoutGroup.spacing = 60;
					this.verticalLayoutGroup.padding.left = 15;
					this.verticalLayoutGroup.padding.top = 20;
					this.verticalLayoutGroup.padding.bottom = 80;

					if (Game.IsLandscape()) {
						this.verticalLayoutGroup.padding.left = 120;
						this.verticalLayoutGroup.padding.right = 20;
						this.canvasScalar.matchWidthOrHeight = 0;
						this.mobileCloseButtonWrapper.anchoredPosition = new Vector2(
							120,
							this.mobileCloseButtonWrapper.anchoredPosition.y,
						);
					}

					if (Game.deviceType === AirshipDeviceType.Phone) {
						this.tabs.GetChild(0).gameObject.SetActive(true); // Profile
						this.tabs.GetChild(1).gameObject.SetActive(true); // Input
						this.tabs.GetChild(2).gameObject.SetActive(true); // Sound

						this.tabs.GetChild(6).gameObject.SetActive(true); // Blocked
						this.tabs.GetChild(7).gameObject.SetActive(true); // Developer
						this.tabs.GetChild(8).gameObject.SetActive(true); // Other
					}
				} else {
					this.tabs.anchorMax = new Vector2(0, 1);
					this.tabs.offsetMax = new Vector2(800, 0);
					// this.tabs.anchoredPosition = new Vector2(800, 0);
					this.mobileHeader.gameObject.SetActive(false);
					this.desktopCloseButtonWrapper.gameObject.SetActive(true);
					for (let child of this.tabs) {
						child.gameObject.SetActive(true);
					}
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
