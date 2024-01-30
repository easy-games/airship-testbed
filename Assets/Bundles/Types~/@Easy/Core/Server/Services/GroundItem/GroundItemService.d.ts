/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { GroundItem, GroundItemData } from "../../../Shared/GroundItem/GroundItem";
import { ItemStack } from "../../../Shared/Inventory/ItemStack";
export declare class GroundItemService implements OnStart {
    private groundItemPrefab;
    private groundItems;
    private idCounter;
    private movingGroundItems;
    private removeMovingGroundItems;
    private idleGroundItemsByPosition;
    private groundItemsFolder;
    constructor();
    OnStart(): void;
    private RemoveGroundItemFromTracking;
    private GetGroundItemPositionKey;
    private IsGroundItemMoving;
    private ScanForIdleItems;
    DestroyGroundItem(groundItem: GroundItem): void;
    SpawnGroundItem(itemStack: ItemStack, pos: Vector3, velocity?: Vector3, data?: GroundItemData): GroundItem;
    private MakeNewID;
}
