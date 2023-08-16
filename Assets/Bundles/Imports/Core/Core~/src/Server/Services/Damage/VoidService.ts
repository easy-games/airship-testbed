import { OnStart, Service } from "@easy-games/flamework-core";
import { DamageType } from "Shared/Damage/DamageType";
import { SetInterval } from "Shared/Util/Timer";
import { EntityService } from "../Entity/EntityService";
import { DamageService } from "./DamageService";

@Service({})
export class VoidService implements OnStart {
	constructor(private readonly entityService: EntityService, private readonly damageService: DamageService) {}

	OnStart(): void {
		SetInterval(1, () => {
			for (const entity of this.entityService.GetEntities()) {
				if (entity.networkObject.transform.position.y <= -40) {
					this.damageService.InflictDamage(entity, math.huge, {
						damageType: DamageType.VOID,
					});
				}
			}
		});
	}
}
