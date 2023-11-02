/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { ItemMeta } from "./ItemMeta";
import { ItemType } from "./ItemType";
export interface ItemRegistrationConfig {
    accessoryFolder?: string;
}
/**
 * Set of utilities for working with items.
 */
export declare class ItemUtil {
    static readonly DefaultAccessoryCollectionPath = "@Easy/Core/Shared/Resources/Accessories/Kits/GothGirl/Kit_GothGirl_Collection.asset";
    static readonly DefaultItemPath = "@Easy/Core/Shared/Resources/Accessories/missing_item.asset";
    private static readonly itemAccessories;
    private static readonly blockIdToItemType;
    private static readonly itemIdToItemType;
    static missingItemAccessory: Accessory;
    static defaultKitAccessory: AccessoryCollection | undefined;
    private static itemTypes;
    private static implictItemTypeMap;
    private static initialized;
    private static onInitialized;
    /**
     * Called by Core.
     */
    static Initialize(): void;
    static WaitForInitialized(): Promise<void>;
    static RegisterItem(itemType: ItemType, itemDefinition: Omit<ItemMeta, "id" | "itemType">, config?: ItemRegistrationConfig): void;
    /**
     * @deprecated
     */
    static GetItemTypeFromBlockId(blockId: number): ItemType | undefined;
    static GetItemTypeFromStringId(stringId: string): ItemType | undefined;
    static GetItemTypeFromItemId(itemId: number): ItemType | undefined;
    static GetItemMeta(itemType: ItemType): ItemMeta;
    static GetFirstAccessoryForItemType(itemType: ItemType): Accessory;
    static GetAccessoriesForItemType(itemType: ItemType): Readonly<Accessory[]>;
    static IsItemType(s: string): boolean;
    /**
     * Find an `ItemType` from the given string, first trying direct then case-insensitive searching the items
     * @param expression The string expression to search for
     * @returns The `ItemType` (if found) - otherwise `undefined`.
     */
    static FindItemTypeFromExpression(expression: string): ItemType | undefined;
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
    /**
     * Returns the component parts of an ItemType - the scope and the id
     *
     * E.g. `@Easy/Core:wood` returns [`"@Easy/Core"`, `"wood"`]
     * @param itemType The item type to get the components of
     * @returns The component prats of the item type string
     */
    static GetItemTypeComponents(itemType: ItemType): [scope: string, id: string];
    static GetItemTypes(): ItemType[];
}
