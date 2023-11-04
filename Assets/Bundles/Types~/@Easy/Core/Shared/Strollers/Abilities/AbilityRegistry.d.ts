import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { AbilityLogic } from "../../Abilities/AbilityLogic";
import { AbilitySlot } from "../../Abilities/AbilitySlot";
import { Duration } from "../../Util/Duration";
export interface AbilityChargeConfig {
    readonly chargeDurationSeconds: Duration.Seconds;
}
export interface AbilityConfig {
    /**
     * The slot for this ability
     *
     * This will bind appropriate bindings on a per-platform basis depending on the slot
     *
     * Order:
     * - Primary (Q, E, R, T)
     * - Secondary (Q, E, R, T)
     * - Utility (Z, X, C, V)
     *
     * @see {@link AbilitySlot} for more details
     */
    readonly slot: AbilitySlot;
    /**
     * The priority of this ability, will change whether or not this ability
     */
    readonly priority?: number;
    /**
     * The icon for this ability
     */
    readonly image?: string;
    /**
     * The name of this ability
     */
    readonly name: string;
    readonly charge?: AbilityChargeConfig;
}
type AbstractConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (...args: infer P) => infer _ ? P : never;
type AbilityFactory<T extends AbilityLogic = AbilityLogic> = new (...args: AbstractConstructorParameters<typeof AbilityLogic>) => T;
export interface Ability {
    /**
     * @internal
     */
    factory: AbilityFactory;
    config: AbilityConfig;
}
export declare class AbilityRegistry implements OnStart {
    private abilityHandlers;
    RegisterAbilityById<T extends AbilityLogic>(id: string, abilityLogicClass: AbilityFactory<T>, config: AbilityConfig): void;
    GetAbilityById(id: string): Ability | undefined;
    OnStart(): void;
}
export {};
