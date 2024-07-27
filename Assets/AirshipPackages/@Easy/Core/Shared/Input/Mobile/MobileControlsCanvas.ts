import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../../Airship";
import { Game } from "../../Game";
import { CoreIcon } from "../UI/CoreIcon";
import TouchJoystick from "./TouchJoystick";

export default class MobileControlsCanvas extends AirshipBehaviour {
	public movementJoystick: TouchJoystick;

	private bin = new Bin();

	protected Start(): void {}

	public Init(): void {
		if (Game.IsMobile()) {
			Airship.Input.CreateMobileButton("Jump", new Vector2(-220, 180));
			Airship.Input.CreateMobileButton("Crouch", new Vector2(-140, 340), {
				icon: CoreIcon.CHEVRON_DOWN,
			});
		}
		this.bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				if (character === undefined) {
					this.HideCharacterControls();
					return;
				}
				this.ShowCharacterControls();
			}),
		);
		this.bin.Add(() => {
			this.HideCharacterControls();
		});
	}

	public ShowCharacterControls(): void {
		this.movementJoystick.gameObject.SetActive(true);
		Airship.Input.ShowMobileButtons("Jump");
		Airship.Input.ShowMobileButtons("Crouch");
	}

	public HideCharacterControls(): void {
		this.movementJoystick.gameObject.SetActive(false);
		Airship.Input.HideMobileButtons("Jump");
		Airship.Input.HideMobileButtons("Crouch");
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
