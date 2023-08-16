import { OnStart } from "@easy-games/flamework-core";
import { InventoryController } from "./InventoryController";
export declare class InventoryUIController implements OnStart {
    private readonly invController;
    private hotbarSlots;
    private backpackShown;
    private showBackpackBin;
    private mouse;
    private canvas;
    private hotbarContent;
    private healthBar;
    constructor(invController: InventoryController);
    OnStart(): void;
    private SetupHotbar;
    private UpdateTile;
    private UpdateHotbarSlot;
    ShowBackpack(): void;
    HideBackpack(): void;
    IsBackpackShown(): boolean;
}
