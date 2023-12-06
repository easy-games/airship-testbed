import { OnInit, OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityRegistry } from "../../../Shared/Strollers/Abilities/AbilityRegistry";
export declare class AbilityBindingController implements OnStart, OnInit {
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
    OnInit(): void;
    OnStart(): void;
    /**
     * Creates and sets up ability bindings for all keys and slot types.
     */
    private CreateBindingSlots;
    /**
     * Returns whether or not the local ability was successfully registered. If this
     * returns `false`, no available slot existed for ability.
     *
     * @param abilityDto The added ability's data transfer object representation.
     * @returns Whether or not the local ability was successfuly registered.
     */
    private RegisterLocalAbility;
    /**
     * Returns the next available slot, if it exists. Searches through provided slots in index order,
     * if a specific search order is desired, construct the `slots` array accordingly.
     *
     * @param slots Slots to search through.
     * @returns The next available slot, if it exists.
     */
    private FindNextAvailableSlot;
}
