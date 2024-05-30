import { DamageType } from "./DamageType";

/**
 * Mapping of damage type to whether or not damage type grants immunity when
 * inflicted to an entity.
 */
const DamageTypeGrantsImmunity: { [key in DamageType]?: boolean } = {
	[DamageType.FIRE]: false,
};

/**
 * Returns whether or not damage type should grant immunity. If an entry for provided
 * damage type does not exist in `DamageTypeGrantsImmunity`, the value defaults to `true`.
 *
 * @param damageType The damage type being queried.
 * @returns Whether or not damage type should grant immunity.
 */
export const DoesDamageTypeGrantImmunity = (damageType: DamageType): boolean => {
	return DamageTypeGrantsImmunity[damageType] ?? true;
};
