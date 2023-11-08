import { Duration } from "../Util/Duration";
import { AbilitySlot } from "./AbilitySlot";
import { AbilityLogic } from "./AbilityLogic";
export interface AbilityChargeConfig {
    readonly chargeDurationSeconds: Duration.Seconds;
    readonly cancelOnMovement?: boolean;
    readonly cancelOnDamage?: boolean;
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
/**
 * @internal
 */
export type AbilityLogicConstructor<T extends AbilityLogic = AbilityLogic> = new (...args: AbstractConstructorParameters<typeof AbilityLogic>) => T;
export interface AbilityDto {
    /**
     * The id of the ability
     */
    readonly id: string;
    /**
     * The enabled state of the ability
     */
    readonly enabled: boolean;
    /**
     * The slot the ability is in
     */
    readonly slot: AbilitySlot;
    /**
     * Charging
     */
    readonly charge?: AbilityChargeConfig;
}
export interface UseAbilityRequest {
    readonly abilityId: string;
}
export interface UseAbilityResponse {
}
export {};
