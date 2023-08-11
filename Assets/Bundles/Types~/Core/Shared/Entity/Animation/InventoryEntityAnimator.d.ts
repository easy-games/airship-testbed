import { BundleGroupNames } from "../../Util/ReferenceManagerResources";
import { Entity, EntityReferences } from "../Entity";
import { EntityAnimator } from "./EntityAnimator";
export declare enum ItemEventKeys {
    NONE = -1,
    IDLE = 0,
    EQUIP = 1,
    UN_EQUIP = 2,
    USE = 3
}
export declare enum ItemPlayMode {
    DEFAULT = 0,
    LOOP = 1,
    HOLD = 2
}
export declare class InventoryEntityAnimator extends EntityAnimator {
    private readonly itemLayerIndex;
    private itemLayer;
    private currentItemClips;
    private bundleIndex;
    private currentBundleName;
    private currentItemState;
    private isFirstPerson;
    constructor(entity: Entity, anim: AnimancerComponent, ref: EntityReferences);
    private Log;
    SetFirstPerson(isFirstPerson: boolean): void;
    private Play;
    private LoadNewItemResources;
    private TriggerEvent;
    EquipItem(itemId: BundleGroupNames): void;
    private StartUnEquipAnim;
    private StartItemEquipAnim;
    StartItemIdle(): void;
    PlayItemUse(useIndex?: number, itemPlayMode?: ItemPlayMode): void;
}
