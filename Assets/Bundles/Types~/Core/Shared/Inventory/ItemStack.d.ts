import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
export interface ItemStackDto {
    /** ItemType */
    i: ItemType;
    /** Amount */
    a: number;
}
export declare type ItemStackTypeChangeSignal = {
    readonly ItemStack: ItemStack;
    readonly NoNetwork: boolean;
    readonly ItemType: ItemType;
};
export declare type ItemStackAmountChangeSignal = {
    readonly ItemStack: ItemStack;
    readonly NoNetwork: boolean;
    readonly Amount: number;
};
export declare class ItemStack {
    private itemType;
    private amount;
    Changed: any;
    ItemTypeChanged: any;
    AmountChanged: any;
    Destroyed: any;
    private hasBeenDestroyed;
    MaxStackSize: number;
    constructor(itemType: ItemType, amount: number);
    GetItemType(): ItemType;
    GetItemMeta(): ItemMeta;
    SetItemType(itemType: ItemType): void;
    GetAmount(): number;
    SetAmount(val: number, config?: {
        noNetwork?: boolean;
    }): void;
    CanMerge(other: ItemStack): boolean;
    Encode(): ItemStackDto;
    static Decode(dto: ItemStackDto): ItemStack;
    GetMeta(): ItemMeta;
    Decrement(amount: number, config?: {
        noNetwork?: boolean;
    }): void;
    Destroy(): void;
    GetMaxStackSize(): number;
    Clone(): ItemStack;
    IsDestroyed(): boolean;
}
