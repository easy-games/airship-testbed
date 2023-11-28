/// <reference types="@easy-games/compiler-types" />
import { AbilityConfig, AbilityLogicConstructor } from "../../Abilities/Ability";
import { AbilityLogic } from "../../Abilities/AbilityLogic";
export interface Ability {
    /**
     * The given id for this ability
     */
    readonly id: string;
    /**
     * The logic class for the ability
     */
    readonly logic: AbilityLogicConstructor;
    /**
     * Configuration around the ability
     */
    readonly config: AbilityConfig;
}
export declare class AbilityRegistry {
    private abilityHandlers;
    /**
     * Registers the given ability to the ability registry by id
     * @param id The id of the ability to register
     * @param abilityLogicClass The logic for the ability
     * @param config The configuration for the ability
     * @returns The registered ability
     */
    RegisterAbilityById<T extends AbilityLogic>(id: string, abilityLogicClass: AbilityLogicConstructor<T>, config: AbilityConfig): Ability;
    /**
     * Gets the ability from the registry by the given id
     * @param id The id of the ability to get
     * @returns The ability (if it exists) - or undefined
     */
    GetAbilityById(id: string): Ability | undefined;
    /**
     * Returns a map of all the abilities registered in this registry
     */
    GetAllRegisteredAbilities(): ReadonlyMap<string, Ability>;
}
