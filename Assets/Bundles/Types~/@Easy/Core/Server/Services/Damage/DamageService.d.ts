/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { DamageType } from "../../../Shared/Damage/DamageType";
import { Entity } from "../../../Shared/Entity/Entity";
import { AOEDamageDef } from "../../../Shared/Item/ItemDefinitionTypes";
import { EntityService } from "../Entity/EntityService";
import { ProjectileCollideServerSignal } from "./Projectile/ProjectileCollideServerSignal";
export declare class DamageService implements OnStart {
    private readonly entityService;
    private combatVars;
    constructor(entityService: EntityService);
    GetDefaultKnockbackY(): number;
    OnStart(): void;
    InflictAOEDamage(centerPosition: Vector3, innerDamage: number, aoeMeta: AOEDamageDef, config: InflictDamageConfig): void;
    InflictFallDamage(entity: Entity, verticalSpeed: number): boolean;
    /**
     *
     * @param entity
     * @param amount
     * @param config
     * @returns Returns true if the damage is inflicted. Returns false if event is cancelled.
     */
    InflictDamage(entity: Entity, amount: number, config?: InflictDamageConfig): boolean;
    ApplyKnockback(driver: EntityDriver, knockbackVel: Vector3 | undefined): void;
}
export interface InflictDamageConfig {
    damageType?: DamageType;
    fromEntity?: Entity;
    ignoreCancelled?: boolean;
    ignoreImmunity?: boolean;
    projectileHitSignal?: ProjectileCollideServerSignal;
    /**
     * Applies standardized knockback in a given direction.
     *
     * You should usually use y=1 for this.
     * */
    knockbackDirection?: Vector3;
    canDamageAllies?: boolean;
    criticalHit?: boolean;
}
