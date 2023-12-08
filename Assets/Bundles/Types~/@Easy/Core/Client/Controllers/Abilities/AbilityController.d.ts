import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
export declare class AbilityController implements OnStart {
    private readonly abilityRegistry;
    /** **All** of the local client's abilities. */
    private localAbilitySet;
    /** Local client ability cooldown states. */
    private localCooldownMap;
    /** Local client ability enabled states. */
    private localStateMap;
    /** Whether or not the local client is **currently** charging an ability. */
    private chargingAbility;
    constructor(abilityRegistry: AbilityRegistry);
    OnStart(): void;
    /**
     * Adds the provided ability to the local client. Fires `AbilityAdded` event. _If_ the ability is enabled,
     * this also fires the `AbilityEnabled` event.
     *
     * @param abilityDto The ability's data transfer object representation.
     */
    private AddAbilityToLocalClient;
    /**
     * Removes the provided ability to the local client. Fires `AbilityRemoved` event.
     *
     * @param abilityId The ability being removed.
     */
    private RemoveAbilityFromLocalClient;
    /**
     * Sets the local client's ability on cooldown for the provided duration. Returns whether or not the cooldown was
     * successfully applied.
     *
     * @param abilityCooldownDto The ability cooldown data transfer object representation.
     * @returns Whether or not the cooldown was successfully applied.
     */
    private SetLocalAbilityOnCooldown;
    /**
     * Sets the local client's ability enabled state. Returns whether or not the enabled state was
     * successfully applied.
     *
     * @param abilityId The ability that is being updated.
     * @param enabled The new enabled state.
     * @returns Whether or not the enabled state was successfully set.
     */
    private SetLocalAbilityEnabledState;
    /**
     * Fires either `AbilityEnabled` or `AbilityDisabled` signal based on updated ability
     * state.
     *
     * @param clientId The client whose ability had a state update.
     * @param abilityId The ability that had a state update.
     * @param enabled The ability's new enabled state.
     */
    private FireAbilityEnabledStateUpdateSignal;
    /**
     * Returns whether or not the provided ability is _currently_ usable by the local client. An ability
     * is usable if it is **not** disabled, **not** on cooldown, and an entity **currently** belongs to
     * the local client.
     *
     * @param abilityId The ability that is being queried.
     * @returns Whether or not the provided ability is _currently_ usable by the local client.
     */
    LocalClientCanUseAbility(abilityId: string): boolean;
    /**
     * Returns whether or not the provided ability is on cooldown for local client. If the client does
     * **not** have the provided ability, this function returns `false`.
     *
     * @param abilityId The ability that is being queried for cooldown.
     * @returns Whether or not the provided ability on cooldown for local client.
     */
    IsLocalAbilityOnCooldown(abilityId: string): boolean;
    /**
     * Returns whether or not the provided ability is disabled for local client. If the client does
     * **not** have the provided ability, this function returns `true`.
     *
     * @param abilityId The ability that is being queried for enabled state.
     * @returns Whether or not the provided ability is disabled for local client.
     */
    IsLocalAbilityDisabled(abilityId: string): boolean;
    /**
     * Returns whether or not the local client has the provided abiltiy.
     * @param abilityId The ability that is being queried.
     * @returns Whether or not the local client has the provided ability.
     */
    LocalClientHasAbility(abilityId: string): boolean;
}
