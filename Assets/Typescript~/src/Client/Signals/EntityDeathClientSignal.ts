import { DamageType } from "Shared/Damage/DamageType";
import { Entity } from "Shared/Entity/Entity";

export class EntityDeathClientSignal {
	constructor(
		public readonly entity: Entity,
		public readonly damageType: DamageType,
		public readonly fromEntity?: Entity,
	) {}
}
