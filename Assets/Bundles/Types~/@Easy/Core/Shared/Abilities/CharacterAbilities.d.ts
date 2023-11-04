/// <reference types="@easy-games/compiler-types" />
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
export declare class CharacterAbilities {
    private boundAbilities;
    /**
     * Adds the given ability to the character
     * @param abilityId The ability's unique id
     * @param slot The slot the ability is bound to
     * @param logic The logic of the ability
     */
    AddAbilityWithId(abilityId: string, slot: AbilitySlot, logic: AbilityLogic): void;
    /**
     * Gets all abilities bound to the given slot
     * @param slot The slot
     * @returns All the abilities bound to this slot
     */
    GetAbilitiesBoundToSlot(slot: AbilitySlot): Map<string, AbilityLogic>;
}
