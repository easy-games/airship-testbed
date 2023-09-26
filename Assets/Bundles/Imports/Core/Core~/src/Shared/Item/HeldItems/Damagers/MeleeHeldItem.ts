import { Dependency } from "@easy-games/flamework-core";
import { DamageService } from "Server/Services/Damage/DamageService";
import { DamageType } from "Shared/Damage/DamageType";
import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";
import { Theme } from "Shared/Util/Theme";
import { EffectsManager } from "../../../Effects/EffectsManager";
import { Entity } from "../../../Entity/Entity";
import { HeldItem } from "../HeldItem";

export class MeleeHeldItem extends HeldItem {
	private gizmoEnabled = true;
	private combatVars = DynamicVariablesManager.Instance.GetVars("Combat")!;

	override OnUseClient(useIndex: number) {
		if (this.entity.IsDead()) return;

		super.OnUseClient(useIndex);
		let meleeData = this.meta.melee;
		if (!meleeData) {
			return;
		}
		//Only local player should do collisions checks
		//TODO make sure other players show the attacks effects just without having to do collision checks
		if (this.entity.IsLocalCharacter()) {
			const entityDriver = this.entity.GetEntityDriver();
			entityDriver.UpdateSyncTick();

			let farTargets = this.ScanForHits();

			for (const data of farTargets) {
				if (this.bundles && this.meta.melee?.onHitPrefabPath !== "none") {
					let prefabPath = this.meta.melee?.onHitPrefabPath ?? AllBundleItems.ItemSword_Prefabs_OnHit;
					//Local damage predictions
					const effectGO = EffectsManager.SpawnEffect(
						prefabPath,
						data.hitPosition,
						Quaternion.LookRotation(data.hitDirection).eulerAngles,
					);
					if (effectGO) {
						effectGO.transform.parent = data.hitEntity.model.transform;
					}
				}
			}
		}
	}

	override OnUseServer(useIndex: number) {
		super.OnUseServer(useIndex);

		if (this.entity.IsDead()) return;

		let meleeData = this.meta.melee;
		if (!meleeData) {
			return;
		}

		let hitTargets = this.ScanForHits();
		hitTargets.forEach((data) => {
			Dependency<DamageService>().InflictDamage(data.hitEntity, meleeData?.damage ?? 0, {
				damageType: meleeData?.damageType ?? DamageType.SWORD,
				fromEntity: this.entity,
				knockbackDirection: data.knockbackDirection,
			});
		});
	}

	private ScanForHits(): MeleeHit[] {
		let farBox = this.combatVars.GetVector3("swordBoxFar");
		let closeBox = this.combatVars.GetVector3("swordBoxClose");

		let hits = this.ScanBox(closeBox, [], Theme.Green);
		if (this.meta.melee?.canHitMultipleTargets) {
			let farHits = this.ScanBox(
				farBox,
				hits.map((x) => x.hitEntity.id),
				Theme.Red,
			);
			hits = [...hits, ...farHits];
		}
		return hits;
	}

	private ScanBox(box: Vector3, ignoreEntityIds: number[], debugColor: Color): MeleeHit[] {
		let collisionData: Array<MeleeHit> = [];
		let closestCollisionData: MeleeHit | undefined;

		const layerMask = 8; // character layer: 1 << 3

		const lookVec = this.entity.entityDriver.GetLookVector();
		box = box.add(new Vector3(0, 0, 0.5));
		let halfExtents = new Vector3(box.x / 2, box.y / 2, box.z / 2);
		let headOffset = this.entity.GetHeadOffset();
		const t = this.entity.model.transform;
		let colliderWorldPos = t.position.add(headOffset).add(lookVec.mul(-0.5 + box.z / 2));

		let rotation = Quaternion.LookRotation(lookVec);

		if (this.gizmoEnabled) {
			// DebugUtil.DrawBox(colliderWorldPos, rotation, halfExtents, debugColor, 2);
		}
		const hitColliders = Physics.OverlapBox(
			colliderWorldPos,
			halfExtents,
			rotation,
			layerMask,
			QueryTriggerInteraction.UseGlobal,
		);

		let foundRaycastCollision: MeleeHit | undefined;
		const rayDistance = box.magnitude;

		//For each collider in the box detection
		for (let i = 0; i < hitColliders.Length; i++) {
			const collider = hitColliders.GetValue(i);
			const targetEntity = Entity.FindByCollider(collider);
			//If we hit an entity that is not the owner of this item
			if (!targetEntity) {
				//Box check doesn't care about non entities
				continue;
			}
			if (targetEntity === this.entity) {
				//Hit Self
				continue;
			}
			if (ignoreEntityIds.includes(targetEntity.id)) {
				continue;
			}

			if (!this.entity.CanDamage(targetEntity)) {
				continue;
			}

			//Raycast to the target to find a more concrete collisions
			const headPosition = this.entity.GetHeadPosition();
			let rayStart = headPosition;
			let rayEnd = targetEntity.GetMiddlePosition();
			let hitDirection = rayEnd.sub(rayStart).normalized;

			// Raycast against the map
			// mask: 1 << 6 = 64
			// const mapLayerMask = 64;
			const hitInfosArray = Physics.RaycastAll(
				rayStart,
				hitDirection,
				rayDistance,
				LayerMask.GetMask("Block", "Character"),
			);
			const hitInfos = hitInfosArray as CSArray<RaycastHit>;
			let blockerDistance = 9999;

			// Validate hitting through walls
			for (let i = 0; i < hitInfos.Length; i++) {
				let hitInfo = hitInfos.GetValue(i);
				//Look for entities and blocking colliders
				const hitEntity = Entity.FindByCollider(hitInfo.collider);
				if (hitEntity) {
					if (hitEntity.id === this.entity.id) {
						//Hit self, skip
						continue;
					} else if (hitEntity.id === targetEntity.id) {
						//Raycast hit the target entity
						foundRaycastCollision = {
							hitEntity: targetEntity,
							hitDirection: hitDirection,
							hitPosition: hitInfo.point,
							hitNormal: hitInfo.normal,
							distance: hitInfo.distance,
							knockbackDirection: this.entity.gameObject.transform.forward,
						};

						// Extra raycast to find impact point
						const ray = new Ray(headPosition, this.entity.entityDriver.GetLookVector());
						// DebugUtil.DrawSingleLine(
						// 	ray.origin,
						// 	ray.origin.add(ray.direction.mul(rayDistance)),
						// 	Theme.Red,
						// 	5,
						// );
						// DebugUtil.DrawSphere(ray.origin, Quaternion.identity, 0.1, Theme.Green, 10, 5);
						const hit = hitInfo.collider.Raycast(ray, rayDistance);
						if (hit) {
							foundRaycastCollision.hitPosition = hit.point;
							foundRaycastCollision.hitNormal = hit.normal;
						}

						if (!closestCollisionData || hitInfo.distance < closestCollisionData.distance) {
							closestCollisionData = foundRaycastCollision;
							continue;
						}
					} else {
						// hit other entity. ignore.
						continue;
					}
				} else {
					//Hit a non entity object
					blockerDistance = math.min(blockerDistance, hitInfo.distance);
				}
			}
			if (foundRaycastCollision) {
				if (foundRaycastCollision.distance > blockerDistance) {
					return [];
				}
			}
		}

		if (this.meta.melee?.canHitMultipleTargets) {
			return collisionData;
		} else if (closestCollisionData) {
			return [closestCollisionData];
		}
		return [];
	}
}

export interface MeleeHit {
	hitEntity: Entity;
	hitDirection: Vector3;
	hitPosition: Vector3;
	hitNormal: Vector3;
	distance: number;
	knockbackDirection: Vector3;
}
