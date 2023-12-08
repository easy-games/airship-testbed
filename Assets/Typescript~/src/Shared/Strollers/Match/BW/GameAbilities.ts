import { AbilityRegistry } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Abilities } from "Shared/Abilities/AbilityMeta";
import { AbilityId } from "Shared/Abilities/AbilityType";

@Service()
@Controller()
export class GameAbilities implements OnStart {
	public constructor(private readonly abilitiesRegistry: AbilityRegistry) {}

	public OnStart(): void {
		for (const [abilityId, abilityMeta] of pairs(Abilities)) {
			this.abilitiesRegistry.RegisterAbilityById(abilityId as AbilityId, abilityMeta.config);
		}
	}
}
