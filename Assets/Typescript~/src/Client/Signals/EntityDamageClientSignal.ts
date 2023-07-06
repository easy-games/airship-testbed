import { DamageType } from "Shared/Damage/DamageType";
import { Entity } from "Shared/Entity/Entity";

export class EntityDamageClientSignal {
	constructor(
		public readonly entity: Entity,
		public readonly amount: number,
		public readonly damageType: DamageType,
		public readonly fromEntity?: Entity,
	) {}
}
