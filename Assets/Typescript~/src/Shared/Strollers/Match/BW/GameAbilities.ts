import { AbilityConfig, AbilityDto } from "@Easy/Core/Shared/Abilities/Ability";
import { AbilityLogic } from "@Easy/Core/Shared/Abilities/AbilityLogic";
import { AbilitySlot } from "@Easy/Core/Shared/Abilities/AbilitySlot";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { AbilityRegistry } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import { Controller, OnStart, Service } from "@easy-games/flamework-core";
import { Abilities } from "Shared/Abilities/AbilityMeta";

@Service()
@Controller()
export class GameAbilities implements OnStart {
	public constructor(private readonly abilitiesRegistry: AbilityRegistry) {}

	public AddAbilityToCharacter(
		abilityId: AbilityId,
		character: CharacterEntity,
		overrideConfig?: AbilityConfig,
	): AbilityLogic | undefined {
		const ability = this.abilitiesRegistry.GetAbilityById(abilityId);
		if (ability) {
			const abilities = character.GetAbilities();
			return abilities.AddAbilityWithId(abilityId, ability.config.slot, ability, overrideConfig);
		} else {
			return;
		}
	}

	public OnStart(): void {
		for (const [k, v] of pairs(Abilities)) {
			this.abilitiesRegistry.RegisterAbilityById(k as string, v.logic, v.config);
		}
	}
}
