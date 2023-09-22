/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "@easy-games/flamework-core";
import { DamageType } from "../../../Shared/Damage/DamageType";
import { Entity } from "../../../Shared/Entity/Entity";
import { AOEDamageMeta } from "../../../Shared/Item/ItemMeta";
import { EntityService } from "../Entity/EntityService";
import { ProjectileCollideServerSignal } from "./Projectile/ProjectileCollideServerSignal";
export declare class DamageService implements OnStart {
    private readonly entityService;
    private combatVars;
    constructor(entityService: EntityService);
    OnStart(): void;
    InflictAOEDamage(centerPosition: Vector3, innerDamage: number, aoeMeta: AOEDamageMeta, config: DamageMeta): void;
    /**
     *
     * @param entity
     * @param amount
     * @param config
     * @returns Returns true if the damage is inflicted. Returns false if event is cancelled.
     */
    InflictDamage(entity: Entity, amount: number, config?: DamageMeta): boolean;
}
export interface DamageMeta {
    damageType?: DamageType;
    fromEntity?: Entity;
    ignoreCancelled?: boolean;
    ignoreImmunity?: boolean;
    projectileHitSignal?: ProjectileCollideServerSignal;
    knockbackDirection?: Vector3;
}
