import { OnStart } from "../Flamework";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
import Inventory from "./Inventory";
import { ItemStack } from "./ItemStack";
/**
 * The CharacterInventorySingleton is responsible for controlling
 * the inventory attached to your local character.
 */
export declare class CharacterInventorySingleton implements OnStart {
    localInventory?: Inventory;
    private enabled;
    private disablers;
    private disablerCounter;
    heldSlotChanged: Signal<number>;
    localInventoryChanged: Signal<Inventory>;
    private lastScrollTime;
    private scrollCooldown;
    OnStart(): void;
    SetHeldSlot(slot: number): void;
    DropItemInHand(): void;
    DropItemInSlot(slot: number, amount: number): void;
    SetLocalInventory(inventory: Inventory): void;
    ObserveLocalInventory(callback: (inv: Inventory) => CleanupFunc): Bin;
    ObserveLocalHeldItem(callback: (itemStack: ItemStack | undefined) => CleanupFunc): Bin;
    AddDisabler(): () => void;
}
