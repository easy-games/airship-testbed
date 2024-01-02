import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { OnStart, Service } from "@easy-games/flamework-core";
import { AbilityId } from "Shared/Abilities/AbilityType";
import { BWSpawnService } from "../../BW/BWSpawnService";

@Service({})
export class RecallService implements OnStart {
	constructor(private readonly entityService: EntityService, private readonly bwSpawnService: BWSpawnService) {}

	OnStart(): void {
		CoreServerSignals.AbilityUsed.Connect((event) => {
			if (event.abilityId !== AbilityId.RECALL) return;
			const entity = this.entityService.GetEntityByClientId(event.clientId);
			if (!entity || !entity.Player) return;
			this.bwSpawnService.TeleportPlayerToSpawn(entity.Player);
		});
	}
}
