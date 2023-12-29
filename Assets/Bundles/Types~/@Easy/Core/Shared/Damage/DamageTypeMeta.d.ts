import { DamageType } from "./DamageType";
/**
 * Returns whether or not damage type should grant immunity. If an entry for provided
 * damage type does not exist in `DamageTypeGrantsImmunity`, the value defaults to `true`.
 *
 * @param damageType The damage type being queried.
 * @returns Whether or not damage type should grant immunity.
 */
export declare const doesDamageTypeGrantImmunity: (damageType: DamageType) => boolean;
