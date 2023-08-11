import { ItemMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";
/**
 * Set of utilities for working with items.
 */
export declare class ItemUtil {
    static readonly DefaultAccessoryCollectionPath = "Shared/Resources/Accessories/Kits/Whim/WhimAccessoryCollection.asset";
    static readonly DefaultItemPath = "Shared/Resources/Accessories/missing_item.asset";
    private static readonly itemAccessories;
    private static readonly blockIdToItemType;
    private static readonly itemIdToItemType;
    static missingItemAccessory: Accessory;
    static defaultKitAccessory: AccessoryCollection | undefined;
    static Initialize(): void;
    static GetItemTypeFromBlockId(blockId: number): ItemType | undefined;
    static GetItemTypeFromItemId(itemId: number): ItemType | undefined;
    static GetItemMeta(itemType: ItemType): ItemMeta;
    static GetFirstAccessoryForItemType(itemType: ItemType): Accessory;
    static GetAccessoriesForItemType(itemType: ItemType): Readonly<Accessory[]>;
    static IsItemType(s: string): boolean;
    /**
     * Fetch a render texture for a provided item.
     * @param itemType An item.
     * @returns Render texture that corresponds to item.
     */
    static GetItemRenderTexture(itemType: ItemType): Texture2D;
    /**
     * Fetch an asset bundle item render path for a provided item.
     * @param itemType An item.
     * @returns Render path that corresponds to item.
     */
    static GetItemRenderPath(itemType: ItemType): string;
    /**
     * Checks whether or not an item is a resource.
     * @param itemType An item.
     * @returns Whether or not item is a resource.
     */
    static IsResource(itemType: ItemType): boolean;
}
