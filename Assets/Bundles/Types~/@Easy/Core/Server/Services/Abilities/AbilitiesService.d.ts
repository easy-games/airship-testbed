import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CharacterEntity } from "../../../Shared/Entity/Character/CharacterEntity";
import { AbilityConfig, AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
export declare class AbilitiesService implements OnStart {
    private abilityRegistry;
    constructor(abilityRegistry: AbilityRegistry);
    /**
     * Adds an abiltiy to the given
     */
    AddAbilityToEntityById(id: string, entity: CharacterEntity, overrideConfig?: AbilityConfig): void;
    OnStart(): void;
}
