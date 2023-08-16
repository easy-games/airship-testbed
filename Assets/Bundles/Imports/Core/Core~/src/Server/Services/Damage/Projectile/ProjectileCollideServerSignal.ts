import { Entity } from "Shared/Entity/Entity";
import { Projectile } from "Shared/Projectile/Projectile";

export class ProjectileCollideServerSignal {
	public damage: number;

	constructor(
		public readonly projectile: Projectile,
		public readonly baseDamage: number,
		public readonly hitPosition: Vector3,
		public readonly normal: Vector3,
		public readonly velocity: Vector3,
		public readonly hitEntity: Entity | undefined,
	) {
		this.damage = baseDamage;
	}
}
