import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { Entity } from "Shared/Entity/Entity";
import { Bin } from "Shared/Util/Bin";
import { SetInterval } from "Shared/Util/Timer";

@Service({})
export class BotService implements OnStart {
	OnStart(): void {
		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (event.entity.player?.IsBot()) {
				this.StartRandomMovement(event.entity);
			}
		});
	}

	private StartRandomMovement(entity: Entity): void {
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
			print("doMove");
			let direction = new Vector3(randDirectionComponent(), 0, randDirectionComponent());
			entity.movement.SetMoveInput(
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
			entity.onDespawn.Connect(() => {
				bin.Clean();
			}),
		);
	}
}
