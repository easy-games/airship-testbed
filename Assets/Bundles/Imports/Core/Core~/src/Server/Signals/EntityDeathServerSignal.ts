import { Entity } from "Shared/Entity/Entity";
import { EntityDamageServerSignal } from "./EntityDamageServerSignal";

export class EntityDeathServerSignal {
	constructor(
		public readonly entity: Entity,
		public killer: Entity | undefined,
		public readonly damageEvent: EntityDamageServerSignal,
		public respawnTime: number,
	) {}
}
