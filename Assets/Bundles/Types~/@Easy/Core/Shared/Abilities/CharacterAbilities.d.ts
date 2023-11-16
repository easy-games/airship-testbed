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
    private cooldowns;
    private boundAbilities;
    private currentChargingAbilityState;
    constructor(entity: CharacterEntity);
    private GetAbilities;
    private SetAbilityOnCooldown;
    /**
     * @server Server-only API
     */
    HasAbilityWithIdAtSlot(id: string, slot: AbilitySlot): boolean;
    /**
     * @server Server-only API
     */
    HasAbilityWithId(id: string): boolean;
    /**
     * Adds the given ability to the character
     * @param abilityId The ability's unique id
     * @param slot The slot the ability is bound to
     * @param logic The logic of the ability
     */
    AddAbilityWithId(abilityId: string, ability: Ability, overrideConfig?: AbilityConfig): AbilityLogic;
    RemoveAbilityById(abilityId: string): false | undefined;
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
     *
     * @server Server-only API
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
    UseAbilityById(id: string): boolean;
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
     *
     * @server Server-only API
     */
    Encode(): AbilityDto[];
}
