import { ItemDef } from "../Item/ItemDefinitionTypes";
import { ItemType } from "../Item/ItemType";
import { Signal } from "../Util/Signal";
export interface ItemStackDto {
    /** ItemType */
    i: ItemType;
    /** Amount */
    a: number;
}
export type ItemStackTypeChangeSignal = {
    readonly ItemStack: ItemStack;
    readonly NoNetwork: boolean;
    readonly ItemType: ItemType;
};
export type ItemStackAmountChangeSignal = {
    readonly ItemStack: ItemStack;
    readonly NoNetwork: boolean;
    readonly Amount: number;
};
export declare class ItemStack {
    private itemType;
    private amount;
    Changed: Signal<void>;
    ItemTypeChanged: Signal<ItemStackTypeChangeSignal>;
    AmountChanged: Signal<ItemStackAmountChangeSignal>;
    Destroyed: Signal<ItemStack>;
    private hasBeenDestroyed;
    constructor(itemType: ItemType, amount?: number);
    GetItemType(): ItemType;
    GetItemDef(): ItemDef;
    SetItemType(itemType: ItemType): void;
    GetAmount(): number;
    SetAmount(val: number, config?: {
        noNetwork?: boolean;
    }): void;
    CanMerge(other: ItemStack): boolean;
    Encode(): ItemStackDto;
    static Decode(dto: ItemStackDto): ItemStack;
    GetMeta(): ItemDef;
    Decrement(amount: number, config?: {
        noNetwork?: boolean;
    }): void;
    Destroy(): void;
    GetMaxStackSize(): number;
    Clone(): ItemStack;
    IsDestroyed(): boolean;
}
