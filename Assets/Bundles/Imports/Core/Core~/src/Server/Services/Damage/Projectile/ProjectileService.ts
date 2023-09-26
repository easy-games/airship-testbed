import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { BlockInteractService } from "Server/Services/Block/BlockInteractService";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DamageType } from "Shared/Damage/DamageType";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Projectile } from "Shared/Projectile/Projectile";
import { DamageMeta, DamageService } from "../DamageService";
import { ProjectileCollideServerSignal } from "./ProjectileCollideServerSignal";

@Service({})
export class ProjectileService implements OnStart {
	constructor(private readonly damageService: DamageService, private readonly blockService: BlockInteractService) {}

	private projectilesById = new Map<number, Projectile>();

	OnStart(): void {
		/* Listen for `ProjectileHit` and apply damage. */
		CoreServerSignals.ProjectileHit.Connect((event) => {
			//Send event to client
			if (event.projectile.shooter?.player) {
				CoreNetwork.ServerToClient.ProjectileHit.Server.FireClient(
					event.projectile.shooter.player.clientId,
					event.hitPosition,
					event.hitEntity?.id,
				);
			}

			let knockbackDirection = event.velocity.normalized;

			//Deal AOE damage
			if (event.ammoMeta.aoeDamage && event.ammoMeta.aoeDamage.damageRadius > 0) {
				const config: DamageMeta = {
					fromEntity: event.projectile.shooter,
					damageType: DamageType.PROJECTILE,
					projectileHitSignal: event,
					knockbackDirection: knockbackDirection,
				};

				//AOE Entity Damage
				this.damageService.InflictAOEDamage(
					event.hitPosition,
					event.ammoMeta.aoeDamage?.innerDamage ?? event.ammoMeta.damage,
					event.ammoMeta.aoeDamage,
					config,
				);

				//AOE Block Damage
				if (event.projectile.shooter && event.ammoMeta.blockDamage) {
					this.blockService.DamageBlockAOE(
						event.projectile.shooter,
						event.hitPosition,
						event.ammoMeta.blockDamage,
						event.ammoMeta.aoeDamage,
						config,
					);
				}
			}

			//Deal direct damage to hit entity
			if (event.hitEntity) {
				this.damageService.InflictDamage(event.hitEntity, event.ammoMeta.damage, {
					fromEntity: event.projectile.shooter,
					damageType: DamageType.PROJECTILE,
					projectileHitSignal: event,
					knockbackDirection: knockbackDirection,
				});
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
		const ammoMeta = ItemUtil.GetItemMeta(projectile.itemType).projectile!;
		const hitEntity = Entity.FindByCollider(collider);

		const projectileHitSignal = new ProjectileCollideServerSignal(
			projectile,
			ammoMeta,
			hitPoint,
			normal,
			velocity,
			hitEntity,
		);

		CoreServerSignals.ProjectileHit.Fire(projectileHitSignal);

		return true;
	}

	public GetProjectileById(projectileId: number): Projectile | undefined {
		return this.projectilesById.get(projectileId);
	}
}
