import { Duration } from "@Easy/Core/Shared/Util/Duration";
import { AbilityLogic } from "./AbilityLogic";
import { AbilitySlot } from "./AbilitySlot";

export enum AbilityKind {
	/**
	 * The ability is active.
	 */
	Active,
	/**
	 * The ability is passive.
	 */
	Passive,
}
export enum AbilityCancellationTrigger {
	/**
	 * Damage is taken by the casting entity.
	 */
	EntityDamageTaken,
	/**
	 * The casting entity moves.
	 */
	EntityMovement,
	/**
	 * The casting entity fires a projectile.
	 */
	EntityFiredProjectile,
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
	 * The id of the ability.
	 */
	readonly abilityId: string;
	/**
	 * The enabled state of the ability.
	 */
	readonly enabled: boolean;
	/**
	 * The slot the ability is in.
	 */
	readonly slot?: AbilitySlot;
	/**
	 * The ability's charge configuration, if it exists.
	 */
	charging?: AbilityChargeConfig;
}

export interface ChargingAbilityDto {
	/** The ability's id. */
	readonly abilityId: string;
	/** The time the ability began charging. */
	readonly timeStart: number;
	/** The duration of the charge. */
	readonly length: number;
	/** The time the ability will stop charging. */
	readonly timeEnd: number;
	/** The ability's display text. This is displayed above the charge bar on the **client**. */
	readonly displayText: string;
}

export interface AbilityCooldownDto {
	/** The ability's id. */
	readonly abilityId: string;
	/** The time the cooldown began. */
	readonly timeStart: number;
	/** The time the cooldown will end. */
	readonly timeEnd: number;
	/** The duration of the cooldown. */
	readonly length: number;
}

export enum ChargingAbilityEndedState {
	/** Indicates ability was successfully charged. */
	Finished,
	/** Indicates the ability charge was cancelled. */
	Cancelled,
}

export interface ChargingAbilityEndedDto {
	/** The ability's id. */
	readonly abilityId: string;
	/** The result of the charge ability. */
	readonly endState: ChargingAbilityEndedState;
}

export interface AbilityCooldown {
	/** The duration of the cooldown. */
	readonly length: Duration;
	/** When the cooldown began. */
	readonly startTimestamp: number;
	/** When the cooldown will end. */
	readonly endTimestamp: number;
}

export interface AbilityChargingState {
	/** The ability's id. */
	readonly abilityId: string;
	/** When the ability began charging. */
	readonly timeStarted: number;
	/** How long the ability will charge for. */
	readonly timeLength: Duration;
	/** The custom triggers that will cancel ability. */
	readonly cancellationTriggers: ReadonlySet<AbilityCancellationTrigger>;
	/** Callback that cancels ability. */
	readonly cancel: () => void;
}
