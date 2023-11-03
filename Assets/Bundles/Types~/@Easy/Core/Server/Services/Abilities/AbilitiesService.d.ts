import { CharacterEntity } from "../../../Shared/Entity/Character/CharacterEntity";
import { AbilityConfig, AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
export declare class AbilitiesService {
    private abilityRegistry;
    constructor(abilityRegistry: AbilityRegistry);
    /**
     * Adds an abiltiy to the given
     */
    AddAbilityToEntityById(id: string, entity: CharacterEntity, config: AbilityConfig): void;
}
