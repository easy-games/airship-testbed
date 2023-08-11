import { OnStart } from "@easy-games/flamework-core";
import { Inventory } from "Shared/Inventory/Inventory";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Bin } from "Shared/Util/Bin";
export declare class InventoryController implements OnStart {
    private inventories;
    LocalInventory?: Inventory;
    HeldSlotChanged: any;
    LocalInventoryAdded: any;
    private enabled;
    private disablers;
    private disablerCounter;
    constructor();
    OnStart(): void;
    AddDisabler(): () => void;
    SwapSlots(fromInventory: Inventory, fromSlot: number, toInventory: Inventory, toSlot: number, config?: {
        noNetwork: boolean;
    }): void;
    CheckInventoryOutOfSync(): void;
    DropItemInHand(): void;
    SetLocalInventory(inventory: Inventory): void;
    ObserveLocalInventory(callback: (inv: Inventory) => CleanupFunc): Bin;
    ObserveLocalHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin;
    SetHeldSlot(slot: number): void;
    GetInventory(id: number): Inventory | undefined;
    RegisterInventory(inv: Inventory): void;
    QuickMoveSlot(inv: Inventory, slot: number): void;
}
