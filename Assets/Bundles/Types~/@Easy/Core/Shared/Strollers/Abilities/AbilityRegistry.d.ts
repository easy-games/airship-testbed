import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityConfig, AbilityLogicConstructor } from "../../Abilities/Ability";
import { AbilityLogic } from "../../Abilities/AbilityLogic";
export interface Ability {
    /**
     * The logic class for the ability
     */
    readonly logic: AbilityLogicConstructor;
    /**
     * Configuration around the ability
     */
    readonly config: AbilityConfig;
}
export declare class AbilityRegistry implements OnStart {
    private abilityHandlers;
    RegisterAbilityById<T extends AbilityLogic>(id: string, abilityLogicClass: AbilityLogicConstructor<T>, config: AbilityConfig): void;
    GetAbilityById(id: string): Ability | undefined;
    OnStart(): void;
}
