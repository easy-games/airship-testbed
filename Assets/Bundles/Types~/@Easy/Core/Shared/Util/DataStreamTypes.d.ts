import { CoreItemType } from "../Item/CoreItemType";
import { HeldItemState } from "../Item/HeldItems/HeldItemState";
/** Key/value type list. The key is the name of the custom data, followed by the value type. */
export type DataStreamItems = {
    PlaceBlock: {
        pos: Vector3;
        itemType: CoreItemType;
    };
    HitBlock: Vector3;
    TillBlock: Vector3;
    HeldItemState: HeldItemStateInfo;
};
interface HeldItemStateInfo {
    /** Entity state */
    s: HeldItemState;
    /** entity id */
    e: number;
    /** Look vector */
    l: Vector3;
}
export {};
