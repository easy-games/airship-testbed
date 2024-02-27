/// <reference types="@easy-games/compiler-types" />
import { ItemDef } from "./ItemDefinitionTypes";
export declare const CoreItemDefinitions: {
    [key: string]: Omit<ItemDef, "id" | "itemType">;
};
