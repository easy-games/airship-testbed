import { Entity } from "Shared/Entity/Entity";
import { EntityDamageServerSignal } from "./EntityDamageServerSignal";

export class EntityDeathServerSignal {
	constructor(
		public readonly entity: Entity,
		public killer: Entity | undefined,
		public readonly damageEvent: EntityDamageServerSignal,

		/**
		 * By default, the player will not be respawned at the end of this time.
		 * That should be implemented at the game level if desired.
		 * */
		public respawnTime: number,
	) {}
}
