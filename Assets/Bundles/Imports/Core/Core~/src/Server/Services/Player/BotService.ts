import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { Entity } from "Shared/Entity/Entity";
import { SetTimeout } from "Shared/Util/Timer";

@Service({})
export class BotService implements OnStart {
	OnStart(): void {
		ServerSignals.EntitySpawn.Connect((event) => {
			if (event.entity.player?.IsBot()) {
				this.DoRandomMoveInput(event.entity);
			}
		});
	}

	private DoRandomMoveInput(entity: Entity): void {
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
		let direction = new Vector3(randDirectionComponent(), 0, randDirectionComponent());
		entity.entityDriver.SetMoveInput(direction, math.random() < 0.2, math.random() < 0.5, math.random() < 0.2);

		SetTimeout(1.5, () => {
			if (entity.IsAlive()) {
				this.DoRandomMoveInput(entity);
			}
		});
	}
}
