import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { OnStart, Service } from "@easy-games/flamework-core";
import { BedService } from "../BedService";
import { MapService } from "../Map/MapService";
import { MatchService } from "../MatchService";
import { BWService } from "./BWService";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";
import { AbilityRegistry } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";

@Service()
export class BWAbilitiesService implements OnStart {
	constructor(
		private readonly bwService: BWService,
		private readonly playerService: PlayerService,
		private readonly mapService: MapService,
		private readonly matchService: MatchService,
		private readonly entityService: EntityService,
		private readonly bedService: BedService,
		private readonly abilityRegistry: AbilityRegistry,
	) {}

	OnStart(): void {
		CoreServerSignals.BeforeEntitySpawn.Connect((event) => {
			if (this.matchService.IsRunning() && event.player) {
				const ability = this.abilityRegistry.GetAbilityById(AbilityId.RECALL);
				if (ability) {
					event.player.Character?.GetAbilities().AddAbilityWithId(
						AbilityId.RECALL,
						AbilitySlot.Utility,
						ability,
					);
				}
			}
		});
	}
}
