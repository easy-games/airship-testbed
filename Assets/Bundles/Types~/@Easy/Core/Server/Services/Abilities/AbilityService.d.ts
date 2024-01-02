import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
import { EntityService } from "../Entity/EntityService";
export declare class AbilityService implements OnStart {
    private readonly abilityRegistry;
    private readonly entityService;
    /** Mapping of **client id** to owned ability ids. */
    private abilityMap;
    /** Mapping of **client id** to ability cooldown states. */
    private cooldownMap;
    /** Mapping of **client id** to ability enabled states. */
    private enabledMap;
    /** Mapping of **client id** to ability charging state. */
    private chargingMap;
    constructor(abilityRegistry: AbilityRegistry, entityService: EntityService);
    OnStart(): void;
    /**
     * Attempts use provided ability for client. Ability is successfully used if the ability
     * exists and `CanUseAbility` validation is successful.
     *
     * @param clientId The client using ability.
     * @param abilityId The ability client is using.
     */
    private UseAbility;
    /**
     * Begins charging ability for provided client. If the ability completely charges,
     * the ability is used.
     *
     * @param clientId The client using ability.
     * @param abilityMeta The ability meta of the ability the client is using.
     */
    private HandleChargeAbility;
    /**
     * Creates cancellation triggers for charge ability. If a cancellation trigger is triggered,
     * the ability is immediately cancelled, and all trigger connections are cleaned up. Returns
     * `Bin` that cleans up cancellation triggers if ability is successfully used.
     *
     * @param clientId The client using a charge ability.
     * @param abilityId The id of the ability being charged.
     * @param cancellationTriggers The triggers that cancel ability.
     * @param cancelCallback Callback that cancels scheduled ability.
     * @param chargeEndedCallback Callback that fires charge ended remote and signals.
     * @returns Bin that cleans up cancellation triggers.
     */
    private CreateCancellationTriggers;
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
    SetAbilityOnCooldown(clientId: number, abilityId: string, duration?: number): boolean;
    /**
     * Sets the client's ability enabled state. Returns whether or not the state was successfully updated.
     * If this function returns `false` the client either does **not** have the provided ability or the
     * ability was already in the provided state.
     *
     * @param clientId The client that ability enabled state is being set for.
     * @param abilityId The ability to enabled or disable.
     * @param enabled The ability's new enabled state.
     * @returns Whether or not the abillity's state was successfully updated.
     */
    SetAbilityEnabledState(clientId: number, abilityId: string, enabled: boolean): boolean;
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
     * Returns whether- or not the provided ability is disabled for client. If the client does
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
     * Returns whether or not the provided client is **currently** charging an
     * ability.
     *
     * @param clientId The client that is being queried.
     * @returns Whether or not the client is currently charging an ability.
     */
    IsClientChargingAbility(clientId: number): boolean;
    /**
     * Returns whether or not the provided ability is _currently_ usable by the client. An ability
     * is usable if it is **not** disabled, **not** on cooldown, **not** charging an ability, and an entity **currently** belongs to
     * `clientId`.
     *
     * @param clientId The client that is being queried.
     * @param abilityId The ability that is being queried.
     * @returns Whether or not the provided ability is _currently_ usable by the client.
     */
    CanUseAbility(clientId: number, abilityId: string): boolean;
}
