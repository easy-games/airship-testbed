import { OnStart } from "@easy-games/flamework-core";
import { CoreUIController } from "../UI/CoreUIController";
import { InventoryController } from "./InventoryController";
export declare class InventoryUIController implements OnStart {
    private readonly invController;
    private readonly coreUIController;
    private hotbarSlots;
    private backpackShown;
    private showBackpackBin;
    private mouse;
    private canvas;
    private hotbarContent;
    private healthBar;
    constructor(invController: InventoryController, coreUIController: CoreUIController);
    OnStart(): void;
    private SetupHotbar;
    private UpdateTile;
    private UpdateHotbarSlot;
    ShowBackpack(): void;
    HideBackpack(): void;
    IsBackpackShown(): boolean;
}
