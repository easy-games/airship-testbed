import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
export declare class AbilityService implements OnStart {
    private readonly abilityRegistry;
    /** Mapping of **client id** to owned ability ids. */
    private abilityMap;
    /** Mapping of **client id** to ability cooldown states. */
    private cooldownMap;
    /** Mapping of **client id** to ability enabled states. */
    private enabledMap;
    constructor(abilityRegistry: AbilityRegistry);
    OnStart(): void;
    /**
     * Adds the provided ability to client `clientId`. Returns whether or not ability was successfully added to client.
     *
     * @param clientId The client that the provided ability is being added to.
     * @param abilityId The ability to add to client.
     * @returns Whether or not ability was successfully added to client.
     */
    AddAbilityToClient(clientId: number, abilityId: string): boolean;
    /**
     * Removes the provided ability to client `clientId`. Returns whether or not ability was removed from client.
     *
     * @param clientId The client that the provided ability is being removed from.
     * @param abilityId The ability to remove from to client.
     * @returns Whether or not ability was removed from client.
     */
    RemoveAbilityFromClient(clientId: number, abilityId: string): boolean;
    /**
     * Returns whether or not client has provided ability.
     *
     * @param clientId The client that is being queried.
     * @param abilityId The ability that the client is being checked for.
     * @returns Whether or not client has provided ability.
     */
    ClientHasAbility(clientId: number, abilityId: string): boolean;
    /**
     * Sets the client's ability on cooldown for the provided duration. Returns whether or not the cooldown was
     * successfully applied.
     *
     * @param clientId The client that ability cooldown is being set for.
     * @param abilityId The ability to set on cooldown.
     * @param duration The cooldown duration in **seconds**.
     * @returns Whether or not the cooldown was successfully applied.
     */
    SetAbilityOnCooldown(clientId: number, abilityId: string, duration: number): boolean;
    /**
     * Sets the client's ability enabled state. Returns whether or not the state was successfully updated.
     * Returns whether or not the ability's state was updated. If this function returns `false` the client
     * either does **not** have the provided ability or the ability was already in the provided state.
     *
     * @param clientId The client that ability enabled state is being set for.
     * @param abilityId The ability to enabled or disable.
     * @param enabled The ability's new enabled state.
     * @returns Whether or not the abillity's state was successfully updated.
     */
    SetAbilityEnabledState(clientId: number, abilityId: string, enabled: boolean): boolean;
    /**
     * Returns whether or not the provided ability is disabled for client. If the client does
     * **not** have the provided ability, this function returns `true`.
     *
     * @param clientId The client that is being queried.
     * @param abilityId The ability that is being queried for enabled state.
     * @returns Whether or not the provided ability is disabled for client.
     */
    IsAbilityDisabled(clientId: number, abilityId: string): boolean;
    /**
     * Returns whether or not the provided ability is on cooldown for client. If the client does
     * **not** have the provided ability, this function returns `false`.
     *
     * @param clientId The client that is being queried.
     * @param abilityId The ability that is being queried for cooldown.
     * @returns Whether or not the provided ability on cooldown for client.
     */
    IsAbilityOnCooldown(clientId: number, abilityId: string): boolean;
    /**
     * Returns whether or not the provided ability is _currently_ usable by the client. An ability
     * is usable if it is **not** disabled and **not** on cooldown.
     *
     * @param clientId The client that is being queried.
     * @param abilityId The ability that is being queried.
     * @returns Whether or not the provided ability is _currently_ usable by the client.
     */
    CanUseAbility(clientId: number, abilityId: string): boolean;
}
