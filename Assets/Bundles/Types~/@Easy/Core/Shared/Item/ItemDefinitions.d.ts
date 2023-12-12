/// <reference types="@easy-games/compiler-types" />
import { ItemDef } from "./ItemDefinitionTypes";
import { ItemType } from "./ItemType";
/**
 * Internal use - External use is through `ItemUtil.ItemTypeComponents`.
 *
 * @internal - Will not show up in types
 */
export declare function ItemTypeComponentsInternal(itemType: ItemType): [scope: string, id: string];
export declare const items: {
    [key in ItemType]: Omit<ItemDef, "id" | "itemType">;
};
