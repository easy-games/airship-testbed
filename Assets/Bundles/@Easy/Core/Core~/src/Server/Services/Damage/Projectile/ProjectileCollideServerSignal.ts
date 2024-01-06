import ProjectileHitBehaviour from "Shared/Behaviours/Projectiles/ProjectileHitBehaviour";
import { Entity } from "Shared/Entity/Entity";
import { AmmoDef } from "Shared/Item/ItemDefinitionTypes";
import { Projectile } from "Shared/Projectile/Projectile";

export class ProjectileCollideServerSignal {
	constructor(
		public readonly projectile: Projectile,
		public readonly ammoMeta: AmmoDef,
		public readonly hitPosition: Vector3,
		public readonly normal: Vector3,
		public readonly velocity: Vector3,
		public readonly hitEntity: Entity | undefined,
		public readonly hitObserver: ProjectileHitBehaviour | undefined,
	) {}
}
