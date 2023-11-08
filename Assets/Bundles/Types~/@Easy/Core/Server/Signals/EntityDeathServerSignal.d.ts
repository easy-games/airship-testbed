import { Entity } from "../../Shared/Entity/Entity";
import { EntityDamageServerSignal } from "./EntityDamageServerSignal";
export declare class EntityDeathServerSignal {
    readonly entity: Entity;
    killer: Entity | undefined;
    readonly damageEvent: EntityDamageServerSignal;
    /**
     * By default, the player will not be respawned at the end of this time.
     * That should be implemented at the game level if desired.
     * */
    respawnTime: number;
    constructor(entity: Entity, killer: Entity | undefined, damageEvent: EntityDamageServerSignal, 
    /**
     * By default, the player will not be respawned at the end of this time.
     * That should be implemented at the game level if desired.
     * */
    respawnTime: number);
}
