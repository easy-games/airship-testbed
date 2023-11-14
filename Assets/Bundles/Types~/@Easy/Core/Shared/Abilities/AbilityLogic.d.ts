import { CharacterEntity } from "../Entity/Character/CharacterEntity";
import { AbilityConfig, AbilityDto } from "./Ability";
/**
 * A logic class surrounding an ability
 */
export declare abstract class AbilityLogic {
    protected readonly entity: CharacterEntity;
    protected readonly id: string;
    protected readonly configuration: AbilityConfig;
    private enabled;
    constructor(entity: CharacterEntity, id: string, configuration: AbilityConfig);
    GetId(): string;
    /**
     * Get the configuration of this ability
     * @returns The configuration of the ability
     */
    GetConfig(): AbilityConfig;
    /**
     * Set whether or not this ability is enabled
     * @param enabled Whether or not this ability is enabled
     */
    SetEnabled(enabled: boolean): void;
    /**
     * Get the enabled state of this ability
     */
    GetEnabled(): boolean;
    /**
     * Lifecycle function for when this is enabled
     */
    OnEnabled(): void;
    /**
     * Lifecycle function for when this is enabled
     */
    OnDisabled(): void;
    /**
     * Invoked when the ability is triggered
     *
     * - This may be after a charge duration
     * 		if the charge duration is set and the ability charge wasn't cancelled
     */
    abstract OnTriggered(): void;
    OnChargeBegan(): void;
    OnChargeCancelled(): void;
    /**
     * Cast this ability logic to a data transfer object representation
     * @returns The data transfer object representation of this ability logic
     */
    Encode(): AbilityDto;
}
