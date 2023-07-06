import { OnStart, Service } from "@easy-games/flamework-core";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { SetInterval } from "Shared/Util/Timer";

const TIME_UNTIL_REGEN = 5;
const REGEN_PER_SECOND = 5;
const REGEN_TICKS_PER_SECOND = 5;

@Service({})
export class HealthRegenService implements OnStart {
	constructor(private readonly entityService: EntityService) {}
	OnStart(): void {
		const regenAmount = REGEN_PER_SECOND / REGEN_TICKS_PER_SECOND;
		SetInterval(1 / REGEN_TICKS_PER_SECOND, () => {
			for (const entity of this.entityService.GetEntities()) {
				if (entity.GetHealth() < entity.GetMaxHealth()) {
					if (entity.TimeSinceLastDamaged() >= TIME_UNTIL_REGEN) {
						entity.SetHealth(entity.GetHealth() + regenAmount);
					}
				}
			}
		});
	}
}
