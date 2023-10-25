import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";

export class EntityDamageClientSignal {
	constructor(
		public readonly entity: Entity,
		public readonly amount: number,
		public readonly damageType: DamageType,
		public readonly fromEntity?: Entity,
	) {}
}
