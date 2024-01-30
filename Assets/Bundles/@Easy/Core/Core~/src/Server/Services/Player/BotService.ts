import { OnStart, Service } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { Bin } from "Shared/Util/Bin";
import { SetInterval } from "Shared/Util/Timer";

@Service({})
export class BotService implements OnStart {
	OnStart(): void {
		Airship.characters.onCharacterSpawned.Connect((character) => {
			if (character.player?.IsBot()) {
				this.StartRandomMovement(character);
			}
		});
	}

	private StartRandomMovement(character: Character): void {
		const bin = new Bin();

		let randDirectionComponent = () => {
			let r = math.random();
			if (r < 1 / 3) {
				return -1;
			} else if (r < 2 / 3) {
				return 0;
			} else {
				return 1;
			}
		};

		const doMove = () => {
			let direction = new Vector3(randDirectionComponent(), 0, randDirectionComponent());
			character.movement.SetMoveInput(
				direction,
				math.random() < 0.2,
				math.random() < 0.5,
				math.random() < 0.2,
				false,
			);
		};
		doMove();

		bin.Add(
			SetInterval(1.5, () => {
				doMove();
			}),
		);
		bin.Add(
			character.onDespawn.Connect(() => {
				bin.Clean();
			}),
		);
	}
}
