import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { DamageType } from "Shared/Damage/DamageType";
import { Entity } from "Shared/Entity/Entity";
import { GetItemMeta, GetItemTypeFromItemId } from "Shared/Item/ItemDefinitions";
import { Projectile } from "Shared/Projectile/Projectile";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { DamageService } from "../DamageService";
import { ProjectileCollideServerSignal } from "./ProjectileCollideServerSignal";

@Service({})
export class ProjectileService implements OnStart {
	constructor(private readonly damageService: DamageService) {}

	private projectilesById = new Map<number, Projectile>();

	OnStart(): void {
		/* Listen for `ProjectileHit` and apply damage. */
		ServerSignals.ProjectileHit.Connect((event) => {
			if (!event.hitEntity) {
				return;
			}

			let knockbackDirection = event.velocity.normalized;
			this.damageService.InflictDamage(event.hitEntity, event.damage, {
				fromEntity: event.projectile.shooter,
				damageType: DamageType.PROJECTILE,
				projectileHitSignal: event,
				knockbackDirection: knockbackDirection,
			});
		});
		// ServerSignals.ProjectileHit.Connect((event) => {
		// 	Network.ServerToClient.DebugProjectileHit.Server.FireAllClients(event.hitPosition);
		// });

		ProjectileManager.Instance.onProjectileValidate((event) => {
			event.validated = true;
		});

		ProjectileManager.Instance.onProjectileLaunched((easyProjectile, shooterGO) => {
			const shooterEntity = Entity.FindByGameObject(shooterGO);
			const itemType = GetItemTypeFromItemId(easyProjectile.itemTypeId);
			if (!itemType) {
				Debug.LogError("Failed to find itemType with id " + easyProjectile.itemTypeId);
				return;
			}
			const projectile = new Projectile(easyProjectile, itemType, shooterEntity);
		});
	}

	public HandleCollision(
		projectile: Projectile,
		collider: Collider,
		hitPoint: Vector3,
		normal: Vector3,
		velocity: Vector3,
	): boolean {
		const ammoMeta = GetItemMeta(projectile.itemType).Ammo!;
		const hitEntity = Entity.FindByCollider(collider);

		// Check if it should be colliding with us.
		if (!LayerUtil.LayerIsInMask(collider.gameObject.layer, ammoMeta.projectileHitLayerMask)) {
			return false;
		}

		const projectileHitSignal = new ProjectileCollideServerSignal(
			projectile,
			ammoMeta.damage,
			hitPoint,
			normal,
			velocity,
			hitEntity,
		);

		ServerSignals.ProjectileHit.Fire(projectileHitSignal);

		return true;
	}

	public GetProjectileById(projectileId: number): Projectile | undefined {
		return this.projectilesById.get(projectileId);
	}
}
