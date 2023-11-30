import { DamageType } from "../../Shared/Damage/DamageType";
import { Entity } from "../../Shared/Entity/Entity";
export declare class EntityDamageClientSignal {
    readonly entity: Entity;
    readonly amount: number;
    readonly damageType: DamageType;
    readonly criticalHit: boolean;
    readonly fromEntity?: Entity | undefined;
    constructor(entity: Entity, amount: number, damageType: DamageType, criticalHit: boolean, fromEntity?: Entity | undefined);
}
