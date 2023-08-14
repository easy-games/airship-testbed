/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { CancellableEvent } from "@easy-games/unity-sync-event";
import { Entity } from "../Entity/Entity";
import { ItemType } from "../Item/ItemType";
export declare class BeforeBlockPlacedSignal extends CancellableEvent {
    readonly pos: Vector3;
    readonly itemType: ItemType;
    readonly voxel: number;
    /** Will always be undefined on client. */
    readonly entity?: Entity | undefined;
    constructor(pos: Vector3, itemType: ItemType, voxel: number, 
    /** Will always be undefined on client. */
    entity?: Entity | undefined);
}
