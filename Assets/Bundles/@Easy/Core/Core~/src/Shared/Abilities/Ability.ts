import { Duration } from "Shared/Util/Duration";
import { AbilitySlot } from "./AbilitySlot";
import { AbilityLogic } from "./AbilityLogic";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AbstractConstructorParameters<T extends abstract new (...args: any) => any> = T extends abstract new (
	...args: infer P
) => infer _
	? P
	: never;

/**
 * @internal
 */
export type AbilityFactory<T extends AbilityLogic = AbilityLogic> = new (
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
	 * Charging
	 */
	readonly charge?: AbilityChargeConfig;
}
