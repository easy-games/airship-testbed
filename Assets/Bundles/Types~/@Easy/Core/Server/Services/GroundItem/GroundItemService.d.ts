import { OnStart } from "../../../Shared/Flamework";
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
    SpawnGroundItem(itemStack: ItemStack, pos: Vector3, velocity?: Vector3, data?: GroundItemData): GroundItem | undefined;
    private MakeNewID;
}
