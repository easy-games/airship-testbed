/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { Ability } from "../Strollers/Abilities/AbilityRegistry";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
import { CharacterEntity } from "../Entity/Character/CharacterEntity";
import { AbilityCancellationTrigger, AbilityConfig, AbilityDto } from "./Ability";
import { Duration } from "../Util/Duration";
export interface AbilityCooldown {
    readonly length: Duration;
    readonly startedTimestamp: number;
}
export interface AbiltityChargingState {
    readonly timeStarted: number;
    readonly timeLength: Duration;
    readonly cancellationTriggers: Set<AbilityCancellationTrigger>;
    readonly abilityLogic: AbilityLogic;
    readonly cancel: () => void;
}
export declare class CharacterAbilities {
    private entity;
    private cooldowns;
    private boundAbilities;
    private currentChargingAbilityState;
    constructor(entity: CharacterEntity);
    private GetAbilities;
    /**
     * Adds the given ability to the character
     * @param abilityId The ability's unique id
     * @param slot The slot the ability is bound to
     * @param logic The logic of the ability
     */
    AddAbilityWithId(abilityId: string, slot: AbilitySlot, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic;
    GetChargingAbility(): AbiltityChargingState | undefined;
    /**
     * Gets the ability by the given id
     * @param id The id of the ability
     * @returns The ability logic
     */
    GetAbilityById(id: string): AbilityLogic | undefined;
    UseAbilityById(id: string): Promise<void>;
    /**
     * Gets all abilities as an array of data transfer objects
     * @returns The array of data transfer objects
     */
    ToArrayDto(): AbilityDto[];
    /**
     * Gets all abilities bound to the given slot
     * @param slot The slot
     * @returns All the abilities bound to this slot
     */
    GetAbilitiesBoundToSlot(slot: AbilitySlot): Map<string, AbilityLogic>;
}
