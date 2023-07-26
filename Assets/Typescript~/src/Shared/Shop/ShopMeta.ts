import { ItemType } from "Shared/Item/ItemType";

/** Describes a shop category. */
export enum ShopCategory {
	BLOCKS = "Blocks",
	COMBAT = "Combat",
	TOOLS = "Tools",
}

/** Describes a shop item. */
export interface ShopItem {
	/** The item being sold. */
	itemType: ItemType;
	/** The currency used to purchase item. */
	currency: ItemType;
	/** The item price. */
	price: number;
	/** The amount per purchase. */
	quantity: number;
	/** The category item belongs to. */
	category: ShopCategory;

	prevTier?: ItemType;
	nextTier?: ItemType;
	spawnWithItems?: ItemType[];

	/** Define a custom display name. If not set, will use ItemType's display name. */
	displayName?: string;
}

/** Describes a shop. */
export interface Shop {
	/** Items in a shop. */
	shopItems: ShopItem[];
}

/** Default shop. */
export const DEFAULT_BEDWARS_SHOP: Shop = {
	shopItems: [
		{
			itemType: ItemType.WHITE_WOOL,
			currency: ItemType.IRON,
			price: 8,
			quantity: 16,
			category: ShopCategory.BLOCKS,
		},
		{
			itemType: ItemType.STONE_BRICK,
			currency: ItemType.IRON,
			price: 40,
			quantity: 16,
			category: ShopCategory.BLOCKS,
		},
		{
			itemType: ItemType.OAK_WOOD_PLANK,
			currency: ItemType.IRON,
			price: 26,
			quantity: 16,
			category: ShopCategory.BLOCKS,
		},
		{
			itemType: ItemType.CERAMIC,
			currency: ItemType.IRON,
			price: 14,
			quantity: 4,
			category: ShopCategory.BLOCKS,
		},
		{
			itemType: ItemType.OBSIDIAN,
			currency: ItemType.EMERALD,
			price: 2,
			quantity: 4,
			category: ShopCategory.BLOCKS,
		},
		{
			itemType: ItemType.STONE_SWORD,
			currency: ItemType.IRON,
			price: 20,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			itemType: ItemType.IRON_SWORD,
			currency: ItemType.IRON,
			price: 70,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			itemType: ItemType.DIAMOND_SWORD,
			currency: ItemType.EMERALD,
			price: 3,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			itemType: ItemType.WOOD_BOW,
			currency: ItemType.IRON,
			price: 24,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			itemType: ItemType.WOOD_ARROW,
			currency: ItemType.IRON,
			price: 16,
			quantity: 8,
			category: ShopCategory.COMBAT,
		},
		{
			itemType: ItemType.TELEPEARL,
			currency: ItemType.EMERALD,
			price: 2,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			itemType: ItemType.STONE_PICKAXE,
			currency: ItemType.IRON,
			price: 20,
			quantity: 1,
			category: ShopCategory.TOOLS,
			nextTier: ItemType.IRON_PICKAXE,
		},
		{
			itemType: ItemType.IRON_PICKAXE,
			currency: ItemType.IRON,
			price: 40,
			quantity: 1,
			category: ShopCategory.TOOLS,
			prevTier: ItemType.STONE_PICKAXE,
			nextTier: ItemType.DIAMOND_PICKAXE,
		},
		{
			itemType: ItemType.DIAMOND_PICKAXE,
			currency: ItemType.IRON,
			price: 100,
			quantity: 1,
			category: ShopCategory.TOOLS,
			prevTier: ItemType.IRON_PICKAXE,
		},

		// Armor
		{
			itemType: ItemType.LEATHER_ARMOR,
			currency: ItemType.IRON,
			price: 50,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
	],
};
