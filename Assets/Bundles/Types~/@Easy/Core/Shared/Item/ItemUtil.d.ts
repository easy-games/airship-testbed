/// <reference types="compiler-types" />
/// <reference types="compiler-types" />
import { ItemDef } from "./ItemDefinitionTypes";
export interface ItemRegistrationConfig {
    accessoryFolder?: string;
}
/**
 * Set of utilities for working with items.
 */
export declare class ItemUtil {
    static readonly defaultItemPath = "@Easy/Core/Shared/Resources/Accessories/missing_item.prefab";
    private static readonly itemAccessories;
    private static readonly blockIdToItemType;
    private static readonly itemIdToItemType;
    private static runtimeIdCounter;
    static missingItemAccessory: AccessoryComponent;
    private static itemTypes;
    private static implictItemTypeMap;
    private static initialized;
    private static onInitialized;
    /**
     * Called by Core.
     */
    static Initialize(): void;
    static WaitForInitialized(): Promise<void>;
    static RegisterItem(itemType: string, itemDefinition: Omit<ItemDef, "id" | "itemType">, config?: ItemRegistrationConfig): void;
    /**
     * @deprecated
     */
    static GetItemTypeFromBlockId(blockId: number): string | undefined;
    static GetItemTypeFromStringId(stringId: string): string | undefined;
    static GetItemTypeFromItemId(itemId: number): string | undefined;
    static GetItemDef(itemType: string): ItemDef;
    static GetFirstAccessoryForItemType(itemType: string): AccessoryComponent;
    static GetAccessoriesForItemType(itemType: string): Readonly<AccessoryComponent[]>;
    static IsItemType(s: string): boolean;
    /**
     * Find an `ItemType` from the given string, first trying direct then case-insensitive searching the items
     * @param expression The string expression to search for
     * @returns The `ItemType` (if found) - otherwise `undefined`.
     */
    static FindItemTypeFromExpression(expression: string): string | undefined;
    /**
     * Checks whether or not an item is a resource.
     * @param itemType An item.
     * @returns Whether or not item is a resource.
     */
    /**
     * Returns the component parts of an ItemType - the scope and the id
     *
     * E.g. `@Easy/Core:wood` returns [`"@Easy/Core"`, `"wood"`]
     * @param itemType The item type to get the components of
     * @returns The component prats of the item type string
     */
    static GetItemTypeComponents(itemType: string): [scope: string, id: string];
    static GetItemTypes(): string[];
}
