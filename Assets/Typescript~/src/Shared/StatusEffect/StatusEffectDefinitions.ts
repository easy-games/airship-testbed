import { StatusEffectMeta } from "./StatusEffectMeta";
import { StatusEffectType } from "./StatusEffectType";

/** Mapping of **all** status effects to their respective metas. */
const statusEffects: { [key in StatusEffectType]: StatusEffectMeta } = {
	[StatusEffectType.FIRE_ASPECT]: {
		name: "Fire Aspect",
		description: "Fire hurts",
		maxTier: 3,
	},
};

/**
 * Returns status effect meta that corresponds to provided type.
 *
 * @param statusEffectType A status effect type.
 * @returns Meta that corresponds to provided type.
 */
export const GetStatusEffectMeta = (statusEffectType: StatusEffectType): StatusEffectMeta => {
	return statusEffects[statusEffectType];
};
