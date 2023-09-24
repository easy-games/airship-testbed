import { OnStart } from "@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { InventoryController } from "./InventoryController";
export declare class InventoryUIController implements OnStart {
    private readonly invController;
    private readonly coreUIController;
    private hotbarSlots;
    private backpackShown;
    private canvas;
    private hotbarContent;
    private healthBar;
    private inventoryRefs;
    private backpackRefs;
    private backpackCanvas;
    private slotToBackpackTileMap;
    private enabled;
    constructor(invController: InventoryController, coreUIController: CoreUIController);
    OnStart(): void;
    SetEnabled(enabled: boolean): void;
    OpenBackpack(): void;
    private SetupHotbar;
    private UpdateTile;
    private prevSelectedSlot;
    private UpdateHotbarSlot;
    private SetupBackpack;
    IsBackpackShown(): boolean;
}
