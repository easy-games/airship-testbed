/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../Flamework";
import { RemoteFunction } from "../Network/RemoteFunction";
import { CharacterInventorySingleton } from "./CharacterInventorySingleton";
import Inventory, { InventoryDto } from "./Inventory";
interface InventoryEntry {
    Inv: Inventory;
    Viewers: Set<number>;
    Owners: Set<number>;
}
export declare class InventorySingleton implements OnStart {
    readonly localCharacterInventory: CharacterInventorySingleton;
    private inventories;
    remotes: {
        clientToServer: {
            getFullUpdate: RemoteFunction<[invId: number], InventoryDto | undefined>;
        };
    };
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
