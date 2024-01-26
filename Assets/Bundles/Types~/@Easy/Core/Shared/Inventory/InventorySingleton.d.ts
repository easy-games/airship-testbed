/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../node_modules/@easy-games/flamework-core";
import { CharacterInventorySingleton } from "./CharacterInventorySingleton";
import Inventory from "./Inventory";
interface InventoryEntry {
    Inv: Inventory;
    Viewers: Set<number>;
    Owners: Set<number>;
}
export declare class InventorySingleton implements OnStart {
    readonly localCharacterInventory: CharacterInventorySingleton;
    private inventories;
    constructor(localCharacterInventory: CharacterInventorySingleton);
    OnStart(): void;
    private StartClient;
    private StartServer;
    private SwapSlots;
    GetInvEntry(inventory: Inventory): InventoryEntry;
    GetInventory(id: number): Inventory | undefined;
    Subscribe(clientId: number, inventory: Inventory, owner: boolean): void;
    Unsubscribe(clientId: number, inventory: Inventory): void;
    RegisterInventory(inventory: Inventory): void;
    UnregisterInventory(inventory: Inventory): void;
    QuickMoveSlot(inv: Inventory, slot: number): void;
    MoveToSlot(fromInv: Inventory, fromSlot: number, toInv: Inventory, toSlot: number, amount: number): void;
}
export {};
