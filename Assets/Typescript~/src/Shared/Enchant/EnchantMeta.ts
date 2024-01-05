import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

/** Describes in entry in the enchant table's enchant pool. */
export interface EnchantEntry {
	/** The type of status effect. */
	type: StatusEffectType;
	/** The tier of status effect. */
	tier: number;
}

export interface EnchantTableMeta {
	/** The currency used to repair enchant table. */
	repairCurrency: ItemType;
	/** The cost to repair enchant table. */
	repairCost: number;
	/** The currency used to purchase enchants. */
	purchaseCurrency: ItemType;
	/** The cost to purchase enchants. */
	purchaseCost: number;
	/** The enchants **currently** in rotation. */
	enchantPool: EnchantEntry[];
}

export const EnchantTableMeta: EnchantTableMeta = {
	repairCurrency: ItemType.DIAMOND,
	repairCost: 8,
	purchaseCurrency: ItemType.EMERALD,
	purchaseCost: 2,
	enchantPool: [
		{ type: StatusEffectType.STATIC, tier: 1 },
		{ type: StatusEffectType.STATIC, tier: 2 },
		{ type: StatusEffectType.STATIC, tier: 3 },
		{ type: StatusEffectType.FIRE_ASPECT, tier: 1 },
		{ type: StatusEffectType.FIRE_ASPECT, tier: 2 },
		{ type: StatusEffectType.FIRE_ASPECT, tier: 3 },
	],
};
