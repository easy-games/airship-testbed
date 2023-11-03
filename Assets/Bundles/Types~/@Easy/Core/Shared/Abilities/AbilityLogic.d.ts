import { CharacterEntity } from "../Entity/Character/CharacterEntity";
import { AbilityConfig } from "../Strollers/Abilities/AbilityRegistry";
/**
 * A logic class surrounding an ability
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
    OnPressed(): void;
    OnReleased(): void;
    OnChargeBegan(): void;
    OnChargeCancelled(): void;
}
