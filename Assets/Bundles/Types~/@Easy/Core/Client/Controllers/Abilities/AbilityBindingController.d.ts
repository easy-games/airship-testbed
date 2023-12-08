/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
import { Bin } from "../../../Shared/Util/Bin";
import { AbilityBinding } from "./Class/AbilityBinding";
export declare class AbilityBindingController implements OnStart {
    private readonly abilityRegistry;
    /** Ability keyboard instance. */
    private readonly keyboard;
    /** Primary slot ability bindings. */
    private primaryAbilitySlots;
    /** Secondary slot ability bindings. */
    private secondaryAbilitySlots;
    /** Utility slot ability bindings. */
    private utilityAbiltySlots;
    /** All slot ability bindings. */
    private combinedSlots;
    constructor(abilityRegistry: AbilityRegistry);
    OnStart(): void;
    /**
     * Creates and sets up ability bindings for all keys and slot types.
     */
    private CreateBindingSlots;
    /**
     * Registers provided ability for local client. Returns whether or not the local ability
     * was successfully registered. If this returns `false`, no available slot existed for ability.
     *
     * @param abilityDto The added ability's data transfer object representation.
     * @returns Whether or not the local ability was successfuly registered.
     */
    private RegisterLocalAbility;
    /**
     * Unregisters provided ability for local client. Unbinds keybinding associated
     * with ability.
     *
     * @param abilityId The ability being removed.
     */
    private UnregisterLocalAbility;
    /**
     * Updates ability binding for ability associated with provided ability cooldown data,
     * if binding exists.
     *
     * @param abilityCooldownDto The ability cooldown data transfer object representation.
     */
    private UpdateAbilityBindingCooldown;
    /**
     * Returns the next available slot, if it exists. Searches through provided slots in index order,
     * if a specific search order is desired, construct the `slots` array accordingly.
     *
     * @param slots Slots to search through.
     * @returns The next available slot, if it exists.
     */
    private FindNextAvailableSlot;
    /**
     * Returns ability binding associated with provided ability id, if it exists.
     *
     * @param abilityId The ability id being queried.
     * @returns Returns ability binding associated with provided ability id, if it exists.
     */
    private GetAbilityBindingByAbilityId;
    /**
     * Observe ability bindings for local ability updates. Returns a `Bin` to clean up `BindingStateChanged`
     * connections.
     *
     * @param callback A callback that operates on _all_ ability bindings.
     * @returns `Bin` to clean up `BindingStateChanged` connections.
     */
    ObserveAbilityBindings(callback: (abilities: ReadonlyArray<AbilityBinding>) => Bin): Bin;
}
