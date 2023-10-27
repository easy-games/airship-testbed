import { DamageType } from "../../Shared/Damage/DamageType";
import { Entity } from "../../Shared/Entity/Entity";
export declare class EntityDeathClientSignal {
    readonly entity: Entity;
    readonly damageType: DamageType;
    readonly killer: Entity | undefined;
    readonly respawnTime: number;
    constructor(entity: Entity, damageType: DamageType, killer: Entity | undefined, respawnTime: number);
}
