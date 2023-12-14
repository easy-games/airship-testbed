import { GetStatusEffectMeta } from "../StatusEffectDefinitions";
import { StatusEffectType } from "../StatusEffectType";

/** Static damage ordered by **tier**. */
const StaticDamageByTier = [5, 8, 12];

/**
 * Returns damage that corresponds to provided tier. If tier is below `1` or above the status
 * effect's max tier, the value clamped to the tier range.
 *
 * @param tier The status effect tier.
 * @returns The damage value that corresponds to provided tier.
 */
export const GetStaticDamageByTier = (tier: number): number => {
	const statusEffectMeta = GetStatusEffectMeta(StatusEffectType.STATIC);
	if (tier < 1) {
		warn(`Invalid tier requested: (${tier}) Expected value: 1-${statusEffectMeta.maxTier} (Inclusive)`);
		return StaticDamageByTier[0];
	}
	if (tier > statusEffectMeta.maxTier) {
		warn(`Invalid tier requested: (${tier}) Expected value: 1-${statusEffectMeta.maxTier} (Inclusive)`);
		return StaticDamageByTier[statusEffectMeta.maxTier - 1];
	}
	return StaticDamageByTier[tier - 1];
};
