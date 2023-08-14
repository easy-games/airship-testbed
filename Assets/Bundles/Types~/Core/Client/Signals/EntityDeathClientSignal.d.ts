import { DamageType } from "../../Shared/Damage/DamageType";
import { Entity } from "../../Shared/Entity/Entity";
export declare class EntityDeathClientSignal {
    readonly entity: Entity;
    readonly damageType: DamageType;
    readonly fromEntity?: Entity | undefined;
    constructor(entity: Entity, damageType: DamageType, fromEntity?: Entity | undefined);
}
