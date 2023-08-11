import { Projectile } from "./Projectile";

export class ProjectileSharedImpl {
	/**
	 *
	 * @param projectile
	 * @param hitPoint
	 * @param hitVelocity
	 * @param collider
	 * @returns true if collision is ignored.
	 */
	public static ShouldIgnoreCollision(
		projectile: Projectile,
		hitPoint: Vector3,
		velocity: Vector3,
		collider: Collider,
	): boolean {
		return false;
	}
}
