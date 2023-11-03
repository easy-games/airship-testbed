import { CharacterEntity } from "../Entity/Character/CharacterEntity";
import { AbilityConfig } from "../Strollers/Abilities/AbilityRegistry";
/**
 * An ability
 */
export declare abstract class AbilityLogic {
    protected readonly entity: CharacterEntity;
    protected readonly id: string;
    protected readonly configuration: AbilityConfig;
    private enabled;
    constructor(entity: CharacterEntity, id: string, configuration: AbilityConfig);
    /**
     * Lifecycle for this being initialized on the server
     * @internal
     */
    OnServerInit(): void;
    /**
     * Lifecycle for this being initialized on the client
     * @internal
     */
    OnClientInit(): void;
    /**
     * Set whether or not this ability is enabled
     * @param enabled Whether or not this ability is enabled
     */
    SetEnabled(enabled: boolean): void;
    /**
     * Get the enabled state of this ability
     */
    GetEnabled(): boolean;
}
