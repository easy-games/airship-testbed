import { Entity } from "Shared/Entity/Entity";
import { ItemType } from "Shared/Item/ItemType";
export interface ProjectileDto {
    nobId: number;
    itemType: ItemType;
    shooterEntityId?: number;
}
export declare class Projectile {
    private easyProjectile;
    readonly gameObject: GameObject;
    readonly itemType: ItemType;
    readonly shooter: Entity | undefined;
    private destroyed;
    readonly OnDestroy: any;
    /**
     * Fired when the projectile hits something that will destroy it.
     *
     * For additional collide information, you should instead listen to either `ClientSignals.ProjectileHit` or `ServerSignals.ProjectileHit`
     */
    readonly OnHit: any;
    constructor(easyProjectile: EasyProjectile, itemType: ItemType, shooter: Entity | undefined);
    Destroy(): void;
}
