/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../../../../Shared/Entity/Entity";
import { AmmoDef } from "../../../../Shared/Item/ItemDefinitionTypes";
import { Projectile } from "../../../../Shared/Projectile/Projectile";
export declare class ProjectileCollideServerSignal {
    readonly projectile: Projectile;
    readonly ammoMeta: AmmoDef;
    readonly hitPosition: Vector3;
    readonly normal: Vector3;
    readonly velocity: Vector3;
    readonly hitEntity: Entity | undefined;
    constructor(projectile: Projectile, ammoMeta: AmmoDef, hitPosition: Vector3, normal: Vector3, velocity: Vector3, hitEntity: Entity | undefined);
}
