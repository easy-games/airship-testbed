/// <reference types="@easy-games/compiler-types" />
import { ItemDef } from "./ItemDefinitionTypes";
/**
 * Internal use - External use is through `ItemUtil.ItemTypeComponents`.
 *
 * @internal - Will not show up in types
 */
export declare function ItemTypeComponentsInternal(itemType: string): [scope: string, id: string];
export declare const CoreItemDefinitions: {
    [key: string]: Omit<ItemDef, "id" | "itemType">;
};
