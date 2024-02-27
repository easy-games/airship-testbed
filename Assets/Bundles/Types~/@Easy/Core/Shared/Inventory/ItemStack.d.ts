import { CoreItemType } from "../Item/CoreItemType";
import { Signal } from "../Util/Signal";
import { ItemDef } from "../Item/ItemDefinitionTypes";
export interface ItemStackDto {
    /** ItemType */
    i: string;
    /** Amount */
    a: number;
}
export type ItemStackTypeChangeSignal = {
    readonly ItemStack: ItemStack;
    readonly NoNetwork: boolean;
    readonly ItemType: CoreItemType;
};
export type ItemStackAmountChangeSignal = {
    readonly ItemStack: ItemStack;
    readonly NoNetwork: boolean;
    readonly Amount: number;
};
export declare class ItemStack {
    private itemType;
    private amount;
    changed: Signal<void>;
    itemTypeChanged: Signal<ItemStackTypeChangeSignal>;
    amountChanged: Signal<ItemStackAmountChangeSignal>;
    destroyed: Signal<ItemStack>;
    private hasBeenDestroyed;
    constructor(itemType: string, amount?: number);
    GetItemType(): string;
    GetItemDef(): ItemDef;
    SetItemType(itemType: CoreItemType): void;
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
