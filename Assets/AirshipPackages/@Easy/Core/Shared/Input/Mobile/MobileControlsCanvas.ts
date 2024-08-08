import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../../Airship";
import { Game } from "../../Game";
import { ColorUtil } from "../../Util/ColorUtil";
import { CoreIcon } from "../UI/CoreIcon";
import TouchJoystick from "./TouchJoystick";

export default class MobileControlsCanvas extends AirshipBehaviour {
	public movementJoystick: TouchJoystick;

	private sprintGO: GameObject;
	private sprintImg: Image;

	private crouchGO: GameObject;
	private crouchImg: Image;

	private activeColor = ColorUtil.HexToColor("4B7853", 0.81);
	private inactiveColor = new Color(0, 0, 0, 0.61);

	private sprintToggle = false;
	private crouchToggle = false;

	private bin = new Bin();

	protected Start(): void {}

	public Init(): void {
		if (Game.IsMobile()) {
			Airship.Input.CreateMobileButton("Jump", new Vector2(-220, 180), {
				icon: CoreIcon.JumpPose,
			});
			this.crouchGO = Airship.Input.CreateMobileButton("CrouchToggle", new Vector2(-140, 340), {
				icon: CoreIcon.CrouchPose,
			});
			this.crouchImg = this.crouchGO.GetComponent<Image>();

			this.sprintGO = Airship.Input.CreateMobileButton("SprintToggle", new Vector2(-140, 520), {
				icon: CoreIcon.SprintPose,
			});
			this.sprintImg = this.sprintGO.GetComponent<Image>();
		}
		this.bin.Add(
			Airship.Input.OnDown("CrouchToggle").Connect((event) => {
				this.crouchToggle = !this.crouchToggle;
				this.UpdateButtonVisuals();
			}),
		);
		this.bin.Add(
			Airship.Input.OnDown("SprintToggle").Connect((event) => {
				this.sprintToggle = !this.sprintToggle;
				this.UpdateButtonVisuals();
			}),
		);
		this.bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				if (character === undefined) {
					this.HideCharacterControls();
					return;
				}
				this.ShowCharacterControls();
				this.UpdateButtonVisuals();

				character.onStateChanged.Connect(() => {
					this.UpdateButtonVisuals();
				});
			}),
		);
		this.bin.Add(() => {
			this.HideCharacterControls();
		});
	}

	public UpdateButtonVisuals(): void {
		if (!Game.IsMobile()) return;

		const character = Game.localPlayer.character;
		if (!character) return;

		// Crouch
		if (this.crouchToggle) {
			this.crouchImg.color = this.activeColor;
		} else {
			this.crouchImg.color = this.inactiveColor;
		}

		// Sprint
		if (this.sprintToggle) {
			this.sprintImg.color = this.activeColor;
		} else {
			this.sprintImg.color = this.inactiveColor;
		}
	}

	public ShowCharacterControls(): void {
		this.movementJoystick.gameObject.SetActive(true);
		Airship.Input.ShowMobileButtons("Jump");
		Airship.Input.ShowMobileButtons("Crouch");
		Airship.Input.ShowMobileButtons("Sprint");
	}

	public HideCharacterControls(): void {
		this.movementJoystick.gameObject.SetActive(false);
		Airship.Input.HideMobileButtons("Jump");
		Airship.Input.HideMobileButtons("Crouch");
		Airship.Input.HideMobileButtons("Sprint");
	}

	protected Update(dt: number): void {
		if (Game.IsMobile()) {
			const input = this.movementJoystick.input;
			Airship.Characters.localCharacterManager.input?.SetQueuedMoveDirection(new Vector3(input.x, 0, input.y));
		}
	}

	protected OnDestroy(): void {
		this.bin.Clean();
	}
}
