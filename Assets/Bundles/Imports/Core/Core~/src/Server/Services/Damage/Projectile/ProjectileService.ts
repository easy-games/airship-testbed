import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { DamageType } from "Shared/Damage/DamageType";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Network } from "Shared/Network";
import { Projectile } from "Shared/Projectile/Projectile";
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
		ServerSignals.ProjectileHit.Connect((event) => {
			if (event.projectile.shooter?.player) {
				Network.ServerToClient.ProjectileHit.Server.FireClient(
					event.projectile.shooter.player.clientId,
					event.hitPosition,
					event.hitEntity?.id,
				);
			}
		});

		ProjectileManager.Instance.OnProjectileValidate((event) => {
			event.validated = true;

			const itemType = ItemUtil.GetItemTypeFromItemId(event.itemTypeId);
			if (itemType) {
				const itemMeta = ItemUtil.GetItemMeta(itemType);
				const entity = Entity.FindByGameObject(event.shooter);
				if (entity && entity instanceof CharacterEntity) {
					const inv = entity.GetInventory();
					if (inv.HasEnough(itemType, 1)) {
						inv.Decrement(itemType, 1);
					}
				}
			}
		});

		ProjectileManager.Instance.OnProjectileLaunched((easyProjectile, shooterGO) => {
			const shooterEntity = Entity.FindByGameObject(shooterGO);
			const itemType = ItemUtil.GetItemTypeFromItemId(easyProjectile.itemTypeId);
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
		const ammoMeta = ItemUtil.GetItemMeta(projectile.itemType).Ammo!;
		const hitEntity = Entity.FindByCollider(collider);

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
