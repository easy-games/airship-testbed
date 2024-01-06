import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { BlockInteractService } from "Server/Services/Block/BlockInteractService";
import { GroundItemService } from "Server/Services/GroundItem/GroundItemService";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DamageType } from "Shared/Damage/DamageType";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Projectile } from "Shared/Projectile/Projectile";
import { DamageService, InflictDamageConfig } from "../DamageService";
import { ProjectileCollideServerSignal } from "./ProjectileCollideServerSignal";
import ProjectileHitBehaviour from "Shared/Behaviours/Projectiles/ProjectileHitBehaviour";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Service({})
export class ProjectileService implements OnStart {
	constructor(
		private readonly damageService: DamageService,
		private readonly blockService: BlockInteractService,
		private readonly groundItemService: GroundItemService,
	) {}

	private projectilesById = new Map<number, Projectile>();

	OnStart(): void {
		/* Listen for `ProjectileHit` and apply damage. */
		CoreServerSignals.ProjectileHit.Connect((event) => {
			const projectile = event.projectile;
			const launcherItemType = projectile.GetLauncherItemType();
			const launcherMeta = launcherItemType ? ItemUtil.GetItemDef(launcherItemType) : undefined;

			let damage = event.ammoMeta.damage;

			const projectileLauncher = launcherMeta?.projectileLauncher;

			// If a projectile launcher is attached to this projectile, add any applicable modifiers
			if (projectileLauncher) {
				// Apply the launcher's damage multiplier if applicable
				if (projectileLauncher?.damageMultiplier) {
					damage *= projectileLauncher.damageMultiplier;
				}
			}

			//Send event to client
			if (projectile.shooter?.player) {
				CoreNetwork.ServerToClient.ProjectileHit.server.FireClient(
					projectile.shooter.player.clientId,
					event.hitPosition,
					event.hitEntity?.id,
				);
			}

			let knockbackDirection = event.velocity.normalized;
			knockbackDirection = new Vector3(knockbackDirection.x, 1, knockbackDirection.z);

			//Deal AOE damage
			if (event.ammoMeta.aoeDamage && event.ammoMeta.aoeDamage.damageRadius > 0) {
				const config: InflictDamageConfig = {
					fromEntity: projectile.shooter,
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
						event.hitPosition.add(event.velocity.normalized.mul(0.5)),
						event.ammoMeta.aoeDamage,
					);
				}
			}

			print("inflict damage", damage, "base:", event.ammoMeta.damage);
			print("hit stuff", event.hitBehaviour, event.hitEntity, event.hitPosition);

			//Deal direct damage to hit entity
			if (event.hitEntity) {
				let criticalHit = false;
				const hitHeight = event.hitPosition.sub(event.hitEntity.model.transform.position).magnitude;
				if (event.hitEntity.IsHeadshotHitHeight(hitHeight)) {
					criticalHit = true;
				}
				damage = math.floor(damage + 0.5);
				if (criticalHit) {
					damage *= 1.5;
				}
				this.damageService.InflictDamage(event.hitEntity, damage, {
					fromEntity: projectile.shooter,
					damageType: DamageType.PROJECTILE,
					projectileHitSignal: event,
					knockbackDirection: knockbackDirection,
					criticalHit: criticalHit,
				});
			} else if (event.hitBehaviour) {
				event.hitBehaviour.ProjectileHit(event.velocity.normalized);
			} else {
				const hitItemBlockMeta = event.hitBlock?.itemDef?.block;
				const activateOnPierce = hitItemBlockMeta?.activePrefab?.activateOnProjectilePierce;
				if (activateOnPierce) {
					Dependency<BlockInteractService>().ActivateBlockAtPosition(
						event.hitEntity,
						event.hitPosition,
						(gameObject) => {
							if (activateOnPierce.applyKnockback) {
								const knockback = activateOnPierce.applyKnockback;
								const knockbackMod = knockback.knockbackModifier ?? new Vector3();

								const rb = gameObject.GetComponent<Rigidbody>();
								if (rb) {
									rb.AddForce(
										event.velocity.normalized.add(knockbackMod).mul(knockback.knockbackForce),
										ForceMode.Impulse,
									);
								}
							}
						},
					);
				} else if (event.ammoMeta.stickItemAtSurfaceOnMiss) {
					const groundItem = this.groundItemService.SpawnGroundItem(
						new ItemStack(event.projectile.itemType, 1),
						event.hitPosition,
						undefined,
						{
							Spinning: false,
							Grounded: true,
							LocalOffset: new Vector3(),
							Direction: event.velocity.normalized,
						},
					);
					groundItem.shouldMerge = false;
				}
			}
		});

		ProjectileManager.Instance.OnProjectileValidate((event) => {
			event.validated = true;

			const itemType = ItemUtil.GetItemTypeFromItemId(event.itemTypeId);
			if (itemType) {
				const itemMeta = ItemUtil.GetItemDef(itemType);
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

			let launcherItemType: ItemType | undefined;

			if (shooterEntity instanceof CharacterEntity) {
				launcherItemType = shooterEntity.GetInventory().GetHeldItem()?.GetItemType();
			}

			if (shooterEntity) {
				CoreServerSignals.ProjectileFired.Fire({
					shooter: shooterEntity,
					launcherItemType: launcherItemType ?? ItemType.WOOD_BOW,
					ammoItemType: itemType,
				});
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
		const ammoMeta = ItemUtil.GetItemDef(projectile.itemType).projectile!;
		const hitBlock = WorldAPI.GetMainWorld()?.GetBlockAt(hitPoint);
		const hitEntity = Entity.FindByCollider(collider);

		const projectileHitSignal = new ProjectileCollideServerSignal(
			projectile,
			ammoMeta,
			hitPoint,
			normal,
			velocity,
			hitEntity,
			hitBlock,
			collider.gameObject.GetComponent<ProjectileHitBehaviour>(),
		);

		CoreServerSignals.ProjectileHit.Fire(projectileHitSignal);

		return true;
	}

	public GetProjectileById(projectileId: number): Projectile | undefined {
		return this.projectilesById.get(projectileId);
	}
}
