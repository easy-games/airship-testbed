/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../Entity/Entity";
import { ItemDef } from "../Item/ItemDefinitionTypes";
export declare class ProjectileUtil {
    static GetLaunchPosition(rootTransform: Transform, entity: Entity, isInFirstPerson: boolean): Vector3;
    static GetLaunchForceData(itemMeta: ItemDef, aimVector: Vector3, chargeSec: number): {
        direction: Vector3;
        initialVelocity: Vector3;
    };
}
