import { ItemType } from "../Item/ItemType";
/** Describes a shop category. */
export declare enum ShopCategory {
    BLOCKS = "Blocks",
    COMBAT = "Combat",
    TOOLS = "Tools"
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
export declare class ItemShopMeta {
    static GetShopElementFromItemType(itemType: ItemType): ShopElement | undefined;
    static defaultItems: ItemShop;
}
