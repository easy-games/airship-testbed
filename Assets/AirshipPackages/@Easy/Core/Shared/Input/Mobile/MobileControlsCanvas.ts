import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../../Airship";
import { Game } from "../../Game";
import { ColorUtil } from "../../Util/ColorUtil";
import { CoreAction } from "../AirshipCoreAction";
import { CoreIcon } from "../UI/CoreIcon";
import AirshipMobileButton from "./AirshipMobileButton";
import DynamicJoystick from "./DynamicJoystick";
import { CoreMobileButton, CoreMobileButtonToCoreAction } from "./MobileButton";
import TouchJoystick from "./TouchJoystick";

export default class MobileControlsCanvas extends AirshipBehaviour {
	public staticJoystick: TouchJoystick;
	public dynamicJoystick: DynamicJoystick;
	private isJoystickDynamic = true;

	private crouchGO: GameObject;
	private crouchImg: Image;

	private activeColor = ColorUtil.HexToColor("4B7853", 0.81);
	private inactiveColor = new Color(0, 0, 0, 0.61);

	private crouchToggle = false;

	// If the joystick is moved under 60% of the range, the player will walk.
	private readonly sprintThreshold = 0.6;

	private bin = new Bin();

	protected Start(): void {}
	private canvasEnabled = true;

	protected OnEnable(): void {
		if (!this.canvasEnabled) {
			this.canvasEnabled = true;
			this.SetupEvents();
		}
	}

	protected OnDisable(): void {
		if (this.canvasEnabled) {
			this.canvasEnabled = false;
			this.HideCharacterControls();
			Airship.Characters.localCharacterManager.input?.SetQueuedMoveDirection(new Vector3(0, 0, 0));
		}
		this.bin.Clean();
	}

	public Init(): void {
		if (!Game.IsMobile()) return;

		Airship.Input.CreateMobileButton(CoreMobileButton.Jump, new Vector2(-220, 180), {
			icon: CoreIcon.JumpPose,
		});
		this.crouchGO = Airship.Input.CreateMobileButton(CoreMobileButton.CrouchToggle, new Vector2(-140, 340), {
			icon: CoreIcon.CrouchPose,
		});
		this.crouchImg = this.crouchGO.GetComponent<Image>()!;

		this.SetupEvents();
	}

	private SetupEvents() {
		// Listen for mobile static joystick setting changes
		this.bin.Add(
			contextbridge.subscribe("Settings:Loaded", () => {
				this.isJoystickDynamic = Airship.Input.IsMobileDynamicJoystickEnabled();
				this.UpdateJoystickVisibility(this.isJoystickDynamic);
			}),
		);

		this.bin.Add(
			contextbridge.subscribe(
				"Settings:Toggle:MobileDynamicJoystick:OnChanged",
				(from: LuauContext, value: boolean) => {
					this.UpdateJoystickVisibility(value);
				},
			),
		);

		this.bin.Add(
			Airship.Input.OnDown(CoreMobileButton.CrouchToggle).Connect((event) => {
				this.crouchToggle = !this.crouchToggle;
				this.UpdateButtonState();
			}),
		);
		this.bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				if (character === undefined) {
					this.HideCharacterControls();
					return;
				}
				this.ShowCharacterControls();
				this.UpdateButtonState();

				character.onStateChanged.Connect(() => {
					this.UpdateButtonState();
				});
			}),
		);
	}

	public UpdateButtonState(): void {
		if (this.crouchToggle) {
			Airship.Input.SetDown(CoreAction.Crouch);
		} else {
			Airship.Input.SetUp(CoreAction.Crouch);
		}

		// Crouch
		if (this.crouchToggle) {
			this.crouchImg.color = this.activeColor;
		} else {
			this.crouchImg.color = this.inactiveColor;
		}
	}

	/**
	 * Shows all character control UI elements for mobile devices.
	 * This includes activating the appropriate joystick and making
	 * core mobile buttons that aren't disabled visible.
	 */
	public ShowCharacterControls(): void {
		if (this.isJoystickDynamic) {
			this.dynamicJoystick.gameObject.SetActive(true);
		} else {
			this.staticJoystick.gameObject.SetActive(true);
		}

		for (const [, button] of pairs(CoreMobileButton)) {
			if (Airship.Input.IsCoreActionEnabled(CoreMobileButtonToCoreAction[button])) {
				const buttons = Airship.Input.GetMobileButtons(button);
				for (const button of buttons) {
					button.GetAirshipComponent<AirshipMobileButton>()?.FadeIn();
				}
			}
		}
	}

	/**
	 * Hides all character control UI elements for mobile devices.
	 * This includes deactivating both joystick types and making
	 * core mobile buttons that aren't disabled invisible.
	 */
	public HideCharacterControls(): void {
		this.staticJoystick.gameObject.SetActive(false);
		this.dynamicJoystick.gameObject.SetActive(false);

		for (const [, button] of pairs(CoreMobileButton)) {
			const buttons = Airship.Input.GetMobileButtons(button);
			for (const button of buttons) {
				button.GetAirshipComponent<AirshipMobileButton>()?.FadeOut();
			}
		}
	}

	public UpdateJoystickVisibility(isDynamicJoystickEnabled: boolean): void {
		this.isJoystickDynamic = isDynamicJoystickEnabled;
		this.staticJoystick.gameObject.SetActive(false);
		this.dynamicJoystick.gameObject.SetActive(false);

		if (isDynamicJoystickEnabled) {
			this.dynamicJoystick.gameObject.SetActive(true);
		} else {
			this.staticJoystick.gameObject.SetActive(true);
		}
	}

	protected Update(dt: number): void {
		if (Game.IsMobile()) {
			let input: Vector2;
			if (this.isJoystickDynamic) {
				input = this.dynamicJoystick.input;
			} else {
				input = this.staticJoystick.input;
			}

			// Clap the direction to .1 intervals so that predicted inputs in server auth mode have
			// a better chance of being correct
			const clampInterval = 0.1;
			input = new Vector2(
				math.round(input.x / clampInterval) * clampInterval,
				math.round(input.y / clampInterval) * clampInterval,
			);

			const inputMagnitude = input.magnitude;

			const shouldSprint = inputMagnitude >= this.sprintThreshold;

			if (shouldSprint) {
				Airship.Input.SetDown(CoreAction.Sprint);
			} else {
				Airship.Input.SetUp(CoreAction.Sprint);
			}

			Airship.Characters.localCharacterManager.input?.SetQueuedMoveDirection(new Vector3(input.x, 0, input.y));
		}
	}
}
