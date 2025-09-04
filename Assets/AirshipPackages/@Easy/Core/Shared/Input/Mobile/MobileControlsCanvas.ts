import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../../Airship";
import { Game } from "../../Game";
import { ColorUtil } from "../../Util/ColorUtil";
import { CoreAction } from "../AirshipCoreAction";
import { CoreIcon } from "../UI/CoreIcon";
import { CoreMobileButton } from "./MobileButton";
import TouchJoystick from "./TouchJoystick";

export default class MobileControlsCanvas extends AirshipBehaviour {
	public movementJoystick: TouchJoystick;

	private crouchGO: GameObject;
	private crouchImg: Image;

	private activeColor = ColorUtil.HexToColor("4B7853", 0.81);
	private inactiveColor = new Color(0, 0, 0, 0.61);

	private crouchToggle = false;

	// If the joystick is moved under 60% of the range, the player will walk.
	private readonly sprintThreshold = 0.6;

	private bin = new Bin();

	protected Start(): void {}

	public Init(): void {
		if (Game.IsMobile()) {
			Airship.Input.CreateMobileButton(CoreMobileButton.Jump, new Vector2(-220, 180), {
				icon: CoreIcon.JumpPose,
			});
			this.crouchGO = Airship.Input.CreateMobileButton(CoreMobileButton.CrouchToggle, new Vector2(-140, 340), {
				icon: CoreIcon.CrouchPose,
			});
			this.crouchImg = this.crouchGO.GetComponent<Image>()!;
		}
		this.bin.Add(
			Airship.Input.OnDown(CoreMobileButton.CrouchToggle).Connect((event) => {
				this.crouchToggle = !this.crouchToggle;
				this.UpdateButtonState();
			}),
		);
		this.bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				if (!Game.IsMobile()) return;
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
		this.bin.Add(() => {
			this.HideCharacterControls();
		});
	}

	public UpdateButtonState(): void {
		if (!Game.IsMobile()) return;

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

	public ShowCharacterControls(): void {
		this.movementJoystick.gameObject.SetActive(true);

		for (const [, button] of pairs(CoreMobileButton)) {
			Airship.Input.ShowMobileButtons(button);
		}
	}

	public HideCharacterControls(): void {
		this.movementJoystick.gameObject.SetActive(false);

		for (const [, button] of pairs(CoreMobileButton)) {
			Airship.Input.HideMobileButtons(button);
		}
	}

	protected Update(dt: number): void {
		if (Game.IsMobile()) {
			const input = this.movementJoystick.input;
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

	protected OnDestroy(): void {
		this.bin.Clean();
	}
}
