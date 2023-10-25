import { DamageType } from "Shared/Damage/DamageType";
import { Entity } from "Shared/Entity/Entity";
import { Cancellable } from "Shared/Util/Cancellable";

export class EntityDamageServerSignal extends Cancellable {
	constructor(
		public readonly entity: Entity,
		public amount: number,
		public damageType: DamageType,
		public fromEntity?: Entity,
		public canDamageAllies?: boolean,
	) {
		super();
	}
}
