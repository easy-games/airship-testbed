import { Service } from "@easy-games/flamework-core";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { AbilityConfig, AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";

@Service()
export class AbilitiesService {
	public constructor(private abilityRegistry: AbilityRegistry) {}

	/**
	 * Adds an abiltiy to the given
	 */
	public AddAbilityToEntityById(id: string, entity: CharacterEntity, overrideConfig?: AbilityConfig) {
		const ability = this.abilityRegistry.GetAbilityById(id);

		if (ability !== undefined) {
			const logic = new ability.factory(entity, id, overrideConfig ?? ability.config);
			logic.OnServerInit();

			// TODO: Replicate to client?
		}
	}
}
