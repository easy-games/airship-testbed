import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";

export class EntityDeathClientSignal {
	constructor(
		public readonly entity: Entity,
		public readonly damageType: DamageType,
		public readonly fromEntity?: Entity,
	) {}
}
