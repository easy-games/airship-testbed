/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { ArmorType } from "../Item/ArmorType";
import { ItemType } from "../Item/ItemType";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
import { ItemStack, ItemStackDto } from "./ItemStack";
export interface InventoryDto {
    id: number;
    items: Map<number, ItemStackDto>;
    heldSlot: number;
}
export default class Inventory extends AirshipBehaviour {
    networkObject: NetworkObject;
    id: number;
    maxSlots: number;
    hotbarSlots: number;
    heldSlot: number;
    armorSlots: {
        [key in ArmorType]: number;
    };
    private items;
    /** Fired when a `slot` points to a new `ItemStack`. Changes to the same ItemStack will **not** fire this event. */
    readonly slotChanged: Signal<[slot: number, itemStack: ItemStack | undefined]>;
    readonly heldSlotChanged: Signal<number>;
    /**
     * Fired whenever any change happens.
     * This includes changes to ItemStacks.
     **/
    readonly changed: Signal<void>;
    private finishedInitialReplication;
    private slotConnections;
    Awake(): void;
    GetItem(slot: number): ItemStack | undefined;
    GetSlot(itemStack: ItemStack): number | undefined;
    ObserveHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin;
    SetItem(slot: number, itemStack: ItemStack | undefined, config?: {
        clientPredicted?: boolean;
    }): void;
    Decrement(itemType: ItemType, amount: number): void;
    StartNetworkingDiffs(): void;
    AddItem(itemStack: ItemStack): boolean;
    /**
     * @returns Returns the index of first empty slot. Returns -1 if no open slot found.
     */
    GetFirstOpenSlot(): number;
    GetHeldItem(): ItemStack | undefined;
    GetHeldSlot(): number;
    SetHeldSlot(slot: number): void;
    Encode(): InventoryDto;
    ProcessDto(dto: InventoryDto): void;
    HasEnough(itemType: ItemType, amount: number): boolean;
    HasItemType(itemType: ItemType): boolean;
    GetPairs(): Array<[slot: number, itemStack: ItemStack]>;
    GetMaxSlots(): number;
    GetBackpackTileCount(): number;
    GetHotbarSlotCount(): number;
    FindSlotWithItemType(itemType: ItemType): number | undefined;
    GetAllItems(): ItemStack[];
}
