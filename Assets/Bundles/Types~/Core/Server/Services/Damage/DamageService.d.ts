/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "@easy-games/flamework-core";
import { DamageType } from "../../../Shared/Damage/DamageType";
import { Entity } from "../../../Shared/Entity/Entity";
import { EntityService } from "../Entity/EntityService";
import { ProjectileCollideServerSignal } from "./Projectile/ProjectileCollideServerSignal";
export declare class DamageService implements OnStart {
    private readonly entityService;
    private combatVars;
    constructor(entityService: EntityService);
    OnStart(): void;
    /**
     *
     * @param entity
     * @param amount
     * @param config
     * @returns Returns true if the damage is inflicted. Returns false if event is cancelled.
     */
    InflictDamage(entity: Entity, amount: number, config?: {
        damageType?: DamageType;
        fromEntity?: Entity;
        ignoreCancelled?: boolean;
        ignoreImmunity?: boolean;
        projectileHitSignal?: ProjectileCollideServerSignal;
        knockbackDirection?: Vector3;
    }): boolean;
}
