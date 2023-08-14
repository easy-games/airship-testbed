import { DamageType } from "Imports/Core/Shared/Damage/DamageType";
import { Entity } from "Imports/Core/Shared/Entity/Entity";

export class EntityDamageClientSignal {
	constructor(
		public readonly entity: Entity,
		public readonly amount: number,
		public readonly damageType: DamageType,
		public readonly fromEntity?: Entity,
	) {}
}
