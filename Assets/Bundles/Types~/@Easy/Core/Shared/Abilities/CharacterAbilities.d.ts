/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { CharacterEntity } from "../Entity/Character/CharacterEntity";
import { Ability } from "../Strollers/Abilities/AbilityRegistry";
import { Duration } from "../Util/Duration";
import { AbilityCancellationTrigger, AbilityConfig, AbilityDto } from "./Ability";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";
export interface AbilityCooldown {
    readonly length: Duration;
    readonly startTimestamp: number;
    readonly endTimestamp: number;
}
export interface AbilityChargingState {
    readonly id: string;
    readonly timeStarted: number;
    readonly timeLength: Duration;
    readonly cancellationTriggers: ReadonlySet<AbilityCancellationTrigger>;
}
export declare class CharacterAbilities {
    private entity;
    private abilityIdSlotMap;
    private abilityIdPassiveMap;
    private cooldowns;
    private boundAbilities;
    private currentChargingAbilityState;
    constructor(entity: CharacterEntity);
    private SetAbilityOnCooldown;
    /**
     * Returns all the abilities registered to this character
     * @returns A map of the ability id to the ability logics
     */
    GetAbilities(): ReadonlyMap<string, AbilityLogic>;
    /**
     * Returns whether or not the id matches an ability registered to this character, at the given ability slot
     * @param id The id to check
     * @param slot The slot to check against
     * @returns True if the character has an ability with this id, at the given slot
     */
    HasAbilityWithIdAtSlot(id: string, slot: AbilitySlot): boolean;
    /**
     * Returns whether or not the id matches an ability registered to this character
     * @param id The id to check
     * @returns True if the character has an ability with this id
     */
    HasAbilityWithId(id: string): boolean;
    /**
     * Adds the given ability to the character
     *
     * @param abilityId The ability's unique id
     * @param ability The ability being given to the character
     * @return logic The logic of the ability
     */
    AddAbilityWithId(abilityId: string, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic;
    /**
     * Adds the given **active** ability to the character
     *
     * @param abilityId The ability's unique id
     * @param ability The ability being given to the character
     * @return logic The logic of the ability
     */
    private AddActiveAbilityWithId;
    /**
     * Adds the given **passive** ability to the character
     *
     * @param abilityId The ability's unique id
     * @param ability The ability being given to the character
     * @return logic The logic of the ability
     */
    private AddPassiveAbilityWithId;
    /**
     * Removes the ability with the given id from this character
     * @param abilityId The ability id to remove
     * @returns True if the ability was removed
     */
    RemoveAbilityById(abilityId: string): boolean;
    /**
     * Removes the **active** ability with the given id from this character
     * @param abilityId The ability id to remove
     * @returns True if the ability was removed
     */
    private removeActiveAbilityById;
    /**
     * Removes the **active** ability with the given id from this character
     * @param abilityId The ability id to remove
     * @returns True if the ability was removed
     */
    private removePassiveAbilityById;
    /**
     * Removes all abilities from this character
     */
    RemoveAllAbilities(): void;
    /**
     * Gets the currently charging abiltiy
     *
     * @server Server-only API
     */
    GetChargingAbility(): AbilityChargingState | undefined;
    /**
     * Gets the ability by the given id
     * @param id The id of the ability
     * @returns The ability logic
     *
     * @server Server-only API
     */
    GetAbilityLogicById(id: string): AbilityLogic | undefined;
    /**
     * Gets all abilities bound to the given slot
     * @param slot The slot
     * @returns All the abilities bound to this slot
     */
    GetAbilitiesBoundToSlot(slot: AbilitySlot): Map<string, AbilityLogic>;
    /**
     * Returns whether or not the given ability is on cooldown
     * @param abilityId The ability id to check for cooldown state
     * @returns True if the ability is on cooldown
     *
     * @server Server-only API
     */
    IsAbilityOnCooldown(abilityId: string): boolean;
    /**
     * Use the ability with the given `id`
     *
     * @param id The id of the ability to use
     * @server Server-only API
     */
    UseAbilityById(id: string): void;
    /**
     * Cancel any charging abilities
     * @returns True if a charging ability was cancelled
     *
     * @server Server-only API
     */
    CancelChargingAbility(): boolean;
    /**
     * Gets all abilities as an array of data transfer objects
     * @returns The array of data transfer objects
     */
    Encode(): AbilityDto[];
}
