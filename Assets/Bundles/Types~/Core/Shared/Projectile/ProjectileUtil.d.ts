/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "Shared/Entity/Entity";
import { ItemMeta } from "Shared/Item/ItemMeta";
export declare class ProjectileUtil {
    static GetLaunchPosition(gos: GameObject[], entity: Entity, isInFirstPerson: boolean): Vector3;
    static GetLaunchForceData(itemMeta: ItemMeta, aimVector: Vector3, chargeSec: number): {
        direction: any;
        initialVelocity: any;
    };
}
