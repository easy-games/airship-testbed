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
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";

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
	) {
		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (event.entity instanceof CharacterEntity && event.entity.player) {
				print(
					"add ability to character",
					event.entity.player.username,
					event.entity.player.Character !== undefined,
				);
				const ability = this.abilityRegistry.GetAbilityById(AbilityId.RECALL);
				if (ability) {
					event.entity?.GetAbilities().AddAbilityWithId(AbilityId.RECALL, AbilitySlot.Utility, ability);
				}
			}
		});
	}

	OnStart(): void {}
}
