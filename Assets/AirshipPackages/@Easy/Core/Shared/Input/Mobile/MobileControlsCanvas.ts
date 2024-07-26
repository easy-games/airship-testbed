import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Airship } from "../../Airship";
import { Game } from "../../Game";
import TouchJoystick from "./TouchJoystick";

export default class MobileControlsCanvas extends AirshipBehaviour {
	public movementJoystick: TouchJoystick;

	private bin = new Bin();

	override OnEnable(): void {
		this.bin.Add(
			Game.localPlayer.ObserveCharacter((character) => {
				if (character === undefined) {
					this.movementJoystick.gameObject.SetActive(false);
					return;
				}
				this.movementJoystick.gameObject.SetActive(true);
			}),
		);
		this.bin.Add(() => {
			this.movementJoystick.gameObject.SetActive(false);
		});
	}

	protected Update(dt: number): void {
		if (Game.IsMobile()) {
			const input = this.movementJoystick.input;
			Airship.Characters.localCharacterManager.input?.SetQueuedMoveDirection(new Vector3(input.x, 0, input.y));
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
