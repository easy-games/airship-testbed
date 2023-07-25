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
	item: ItemType;
	/** The currency used to purchase item. */
	currency: ItemType;
	/** The item price. */
	price: number;
	/** The amount per purchase. */
	quantity: number;
	/** The category item belongs to. */
	category: ShopCategory;
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
			item: ItemType.WHITE_WOOL,
			currency: ItemType.IRON,
			price: 8,
			quantity: 16,
			category: ShopCategory.BLOCKS,
		},
		{
			item: ItemType.STONE_BRICK,
			currency: ItemType.IRON,
			price: 40,
			quantity: 16,
			category: ShopCategory.BLOCKS,
		},
		{
			item: ItemType.OAK_WOOD_PLANK,
			currency: ItemType.IRON,
			price: 26,
			quantity: 16,
			category: ShopCategory.BLOCKS,
		},
		{
			item: ItemType.CERAMIC,
			currency: ItemType.IRON,
			price: 4,
			quantity: 14,
			category: ShopCategory.BLOCKS,
		},
		{
			item: ItemType.OBSIDIAN,
			currency: ItemType.EMERALD,
			price: 2,
			quantity: 4,
			category: ShopCategory.BLOCKS,
		},
		{
			item: ItemType.STONE_SWORD,
			currency: ItemType.IRON,
			price: 20,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			item: ItemType.IRON_SWORD,
			currency: ItemType.IRON,
			price: 70,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			item: ItemType.DIAMOND_SWORD,
			currency: ItemType.EMERALD,
			price: 3,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			item: ItemType.WOOD_BOW,
			currency: ItemType.IRON,
			price: 24,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			item: ItemType.WOOD_ARROW,
			currency: ItemType.IRON,
			price: 16,
			quantity: 8,
			category: ShopCategory.COMBAT,
		},
		{
			item: ItemType.TELEPEARL,
			currency: ItemType.EMERALD,
			price: 2,
			quantity: 1,
			category: ShopCategory.COMBAT,
		},
		{
			item: ItemType.STONE_PICKAXE,
			currency: ItemType.IRON,
			price: 20,
			quantity: 1,
			category: ShopCategory.TOOLS,
		},
	],
};
