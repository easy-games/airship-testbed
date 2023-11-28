/// <reference types="@easy-games/compiler-types" />
import { ItemStack } from "../Inventory/ItemStack";
export declare class GroundItem {
    readonly id: number;
    readonly itemStack: ItemStack;
    readonly drop: GroundItemDrop;
    readonly pickupTime: number;
    data: Record<string, unknown>;
    readonly transform: Transform;
    constructor(id: number, itemStack: ItemStack, drop: GroundItemDrop, pickupTime: number, data: Record<string, unknown>);
    SetData(key: string, value: unknown): void;
    GetData<T>(key: string): T | undefined;
}
