import { Entity } from "Shared/Entity/Entity";
import { AmmoMeta } from "Shared/Item/ItemMeta";
import { Projectile } from "Shared/Projectile/Projectile";

export class ProjectileCollideServerSignal {
	constructor(
		public readonly projectile: Projectile,
		public readonly ammoMeta: AmmoMeta,
		public readonly hitPosition: Vector3,
		public readonly normal: Vector3,
		public readonly velocity: Vector3,
		public readonly hitEntity: Entity | undefined,
	) {}
}
