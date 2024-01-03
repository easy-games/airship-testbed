/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { ItemStack } from "../Inventory/ItemStack";
export interface GroundItemData {
    [name: string]: unknown;
    Grounded?: boolean;
    Spinning?: boolean;
    LocalOffset?: Vector3;
    Direction?: Vector3;
}
export declare class GroundItem {
    readonly id: number;
    readonly itemStack: ItemStack;
    readonly drop: GroundItemDrop;
    readonly pickupTime: number;
    data: GroundItemData;
    readonly transform: Transform;
    shouldMerge: boolean;
    constructor(id: number, itemStack: ItemStack, drop: GroundItemDrop, pickupTime: number, data: GroundItemData);
    SetData(key: string, value: unknown): void;
    GetData<T>(key: string): T | undefined;
}
