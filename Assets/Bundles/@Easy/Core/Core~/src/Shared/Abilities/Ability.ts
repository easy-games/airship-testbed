import { Duration } from "Shared/Util/Duration";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";

export enum AbilityKind {
	/**
	 * The ability is active
	 */
	Active,
	/**
	 * The ability is passive
	 */
	Passive,
}
export enum AbilityCancellationTrigger {
	/**
	 * Damage is taken by the casting entity
	 */
	EntityDamageTaken,
	/**
	 * The casting entity moves
	 */
	EntityMovement,
}

export interface AbilityChargeConfig {
	/**
	 * The length of time it will take to charge up this ability
	 */
	readonly chargeTimeSeconds: Duration.Seconds;
	/**
	 * A list of triggers that will result in cancelling this ability's charging
	 */
	readonly cancelTriggers: readonly AbilityCancellationTrigger[];

	/**
	 * Override the display text for the charging ability - otherwise will display `Charging (ABILITY_NAME)`
	 */
	readonly displayText?: string;
}

export interface AbilityConfig {
	/**
	 * The kind of ability this is
	 */
	readonly kind: AbilityKind;
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
	readonly slot?: AbilitySlot;
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

	/**
	 * Charging configuration for this ability - if not set it will be instantaneous
	 */
	readonly charge?: AbilityChargeConfig;

	/**
	 * The cooldown of this ability
	 */
	readonly cooldownTimeSeconds?: Duration.Seconds;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AbstractConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (
	...args: infer P
) => infer _
	? P
	: never;

/**
 * @internal
 */
export type AbilityLogicConstructor<T extends AbilityLogic = AbilityLogic> = new (
	...args: AbstractConstructorParameters<typeof AbilityLogic>
) => T;

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
	readonly slot?: AbilitySlot;
	/**
	 * Charging
	 */
	charging?: AbilityChargeConfig;
}

export interface ChargingAbilityDto {
	readonly id: string;
	readonly timeStart: number;
	readonly length: number;
	readonly timeEnd: number;
	readonly displayText: string;
}

export interface AbilityCooldownDto {
	readonly id: string;
	readonly timeStart: number;
	readonly timeEnd: number;
	readonly length: number;
}

export enum ChargingAbilityEndedState {
	Finished,
	Cancelled,
}
export interface ChargingAbilityEndedDto {
	readonly id: string;
	readonly endState: ChargingAbilityEndedState;
}

export interface UseAbilityRequest {
	readonly abilityId: string;
}
export interface UseAbilityResponse {}
