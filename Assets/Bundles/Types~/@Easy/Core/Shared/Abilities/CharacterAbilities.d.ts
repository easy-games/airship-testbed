/// <reference types="@easy-games/compiler-types" />
import { Ability } from "../Strollers/Abilities/AbilityRegistry";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
import { CharacterEntity } from "../Entity/Character/CharacterEntity";
import { AbilityConfig } from "./Ability";
export declare class CharacterAbilities {
    private entity;
    private boundAbilities;
    constructor(entity: CharacterEntity);
    private GetAbilities;
    /**
     * Adds the given ability to the character
     * @param abilityId The ability's unique id
     * @param slot The slot the ability is bound to
     * @param logic The logic of the ability
     */
    AddAbilityWithId(abilityId: string, slot: AbilitySlot, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic;
    /**
     * Gets the ability by the given id
     * @param id The id of the ability
     * @returns The ability logic
     */
    GetAbilityById(id: string): AbilityLogic | undefined;
    /**
     * Gets all abilities bound to the given slot
     * @param slot The slot
     * @returns All the abilities bound to this slot
     */
    GetAbilitiesBoundToSlot(slot: AbilitySlot): Map<string, AbilityLogic>;
}
