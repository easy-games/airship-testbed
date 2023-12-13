import { GetStatusEffectMeta } from "../StatusEffectDefinitions";
import { StatusEffectType } from "../StatusEffectType";

/** How often entities are inflicted with fire in **seconds**. */
export const FireDuration = 4;

/** How often fire aspect damages an inflicted entity in **seconds**. */
export const FireTickRate = 1;

/** Fire damage per tick ordered by **tier**. */
const FireDamagePerTick = [2, 3, 5];

/**
 * Returns damage that corresponds to provided tier. If tier is below `1` or above the status
 * effect's max tier, the value clamped to the tier range.
 *
 * @param tier The status effect tier.
 * @returns The damage value that corresponds to provided tier.
 */
export const GetFireDamageByTier = (tier: number): number => {
	const statusEffectMeta = GetStatusEffectMeta(StatusEffectType.FIRE_ASPECT);
	if (tier < 1) {
		warn(`Invalid tier requested: (${tier}) Expected value: 1-${statusEffectMeta.maxTier} (Inclusive)`);
		return FireDamagePerTick[0];
	}
	if (tier > statusEffectMeta.maxTier) {
		warn(`Invalid tier requested: (${tier}) Expected value: 1-${statusEffectMeta.maxTier} (Inclusive)`);
		return FireDamagePerTick[statusEffectMeta.maxTier - 1];
	}
	return FireDamagePerTick[tier - 1];
};
