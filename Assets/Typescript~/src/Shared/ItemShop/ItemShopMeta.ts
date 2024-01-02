import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ArmorCollection } from "./ArmorCollection";

/** Describes a shop category. */
export enum ShopCategory {
	BLOCKS = "Blocks",
	COMBAT = "Combat",
	TOOLS = "Tools",
}

/** Describes a shop item. */
export interface ShopElement {
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

	preventPurchasingIfAlreadyOwned?: boolean;

	prevTier?: ItemType;
	nextTier?: ItemType;
	spawnWithItems?: ItemType[];

	removeTierOnDeath?: boolean;
	lockAfterPurchase?: boolean;
	replaceMelee?: boolean;
	replaceBow?: boolean;
	replacePickaxe?: boolean;
	replaceAxe?: boolean;

	/** Define a custom display name. If not set, will use ItemType's display name. */
	displayName?: string;
}

/** Describes a shop. */
export interface ItemShop {
	/** Items in a shop. */
	shopItems: ShopElement[];
}

export class ItemShopMeta {
	public static GetShopElementFromItemType(itemType: ItemType): ShopElement | undefined {
		return this.DefaultItems.shopItems.find((x) => x.itemType === itemType);
	}

	public static DefaultItems: ItemShop = {
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
				displayName: "Blastproof Ceramic",
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
				replaceMelee: true,
				preventPurchasingIfAlreadyOwned: true,
			},
			{
				itemType: ItemType.IRON_SWORD,
				currency: ItemType.IRON,
				price: 70,
				quantity: 1,
				category: ShopCategory.COMBAT,
				replaceMelee: true,
				preventPurchasingIfAlreadyOwned: true,
			},
			{
				itemType: ItemType.DIAMOND_SWORD,
				currency: ItemType.EMERALD,
				price: 3,
				quantity: 1,
				category: ShopCategory.COMBAT,
				replaceMelee: true,
				preventPurchasingIfAlreadyOwned: true,
			},
			{
				itemType: ItemType.WOOD_BOW,
				currency: ItemType.IRON,
				price: 24,
				quantity: 1,
				category: ShopCategory.COMBAT,
				replaceBow: true,
				spawnWithItems: [ItemType.WOOD_BOW],
				preventPurchasingIfAlreadyOwned: true,
			},
			{
				itemType: ItemType.WOOD_CROSSBOW,
				currency: ItemType.EMERALD,
				price: 4,
				quantity: 1,
				category: ShopCategory.COMBAT,
				replaceBow: true,
				spawnWithItems: [ItemType.WOOD_CROSSBOW],
				preventPurchasingIfAlreadyOwned: true,
			},
			{
				itemType: ItemType.WOOD_ARROW,
				currency: ItemType.IRON,
				price: 16,
				quantity: 8,
				category: ShopCategory.COMBAT,
			},
			{
				itemType: ItemType.FIREBALL,
				currency: ItemType.IRON,
				price: 75,
				quantity: 1,
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
				spawnWithItems: [ItemType.STONE_PICKAXE],
			},
			{
				itemType: ItemType.IRON_PICKAXE,
				currency: ItemType.IRON,
				price: 20,
				quantity: 1,
				category: ShopCategory.TOOLS,
				prevTier: ItemType.STONE_PICKAXE,
				nextTier: ItemType.DIAMOND_PICKAXE,
				spawnWithItems: [ItemType.IRON_PICKAXE],
			},
			{
				itemType: ItemType.DIAMOND_PICKAXE,
				currency: ItemType.IRON,
				price: 60,
				quantity: 1,
				category: ShopCategory.TOOLS,
				prevTier: ItemType.IRON_PICKAXE,
				spawnWithItems: [ItemType.DIAMOND_PICKAXE],
				lockAfterPurchase: true,
				preventPurchasingIfAlreadyOwned: true,
			},

			// Armor
			{
				displayName: "Leather Armor",
				itemType: ItemType.LEATHER_HELMET,
				currency: ItemType.IRON,
				price: 50,
				quantity: 1,
				category: ShopCategory.COMBAT,
				nextTier: ItemType.IRON_HELMET,
				spawnWithItems: ArmorCollection.LEATHER,
			},
			{
				displayName: "Iron Armor",
				itemType: ItemType.IRON_HELMET,
				currency: ItemType.IRON,
				price: 50,
				quantity: 1,
				category: ShopCategory.COMBAT,
				prevTier: ItemType.LEATHER_HELMET,
				nextTier: ItemType.DIAMOND_HELMET,
				spawnWithItems: ArmorCollection.IRON,
			},
			{
				displayName: "Diamond Armor",
				itemType: ItemType.DIAMOND_HELMET,
				currency: ItemType.EMERALD,
				price: 8,
				quantity: 1,
				category: ShopCategory.COMBAT,
				prevTier: ItemType.IRON_HELMET,
				nextTier: ItemType.EMERALD_HELMET,
				spawnWithItems: ArmorCollection.DIAMOND,
			},
			{
				displayName: "Emerald Armor",
				itemType: ItemType.EMERALD_HELMET,
				currency: ItemType.EMERALD,
				price: 40,
				quantity: 1,
				category: ShopCategory.COMBAT,
				prevTier: ItemType.DIAMOND_HELMET,
				spawnWithItems: ArmorCollection.EMERALD,
				lockAfterPurchase: true,
			},
		],
	};
}
