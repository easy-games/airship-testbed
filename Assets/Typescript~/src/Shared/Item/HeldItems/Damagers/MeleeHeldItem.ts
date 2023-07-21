import { Dependency } from "@easy-games/flamework-core";
import { DamageService } from "../../../../Server/Services/Global/Damage/DamageService";
import { EffectsManager } from "../../../Effects/EffectsManager";
import { Entity } from "../../../Entity/Entity";
import { Bundle_ItemSword } from "../../../Util/ReferenceManagerResources";
import { BoxCollision } from "../../ItemMeta";
import { HeldItem } from "../HeldItem";

export class MeleeHeldItem extends HeldItem {
	override OnUseClient(useIndex: number) {
		super.OnUseClient(useIndex);
		let meleeData = this.meta.melee;
		if (!meleeData) {
			return;
		}
		this.Log("Using Server");
		//Only local player should do collisions checks
		//TODO make sure other players show the attacks effects just without having to do collision checks
		if (this.entity.IsLocalCharacter()) {
			const entityDriver = this.entity.GetEntityDriver();
			entityDriver.UpdateSyncTick();
			let hitTargets = this.ScanForHits(meleeData.colliderData);
			hitTargets.forEach((data) => {
				if (this.bundles && this.meta.melee?.onHitPrefabId) {
					//Local damage predictions
					const effectGO = EffectsManager.SpawnBundleGroupEffect(
						this.bundles,
						Bundle_ItemSword.Prefabs,
						this.meta.melee.onHitPrefabId,
						data.hitPosition,
						Quaternion.LookRotation(data.hitDirection).eulerAngles,
					);
					if (effectGO) {
						effectGO.transform.parent = data.hitEntity.model.transform;
					}
				}
			});
		}
	}

	override OnUseServer(useIndex: number) {
		print("melee.onUseServer");
		Profiler.BeginSample("Melee.OnUseServer");

		Profiler.BeginSample("super.OnUseServer");
		super.OnUseServer(useIndex);
		Profiler.EndSample();
		let meleeData = this.meta.melee;
		if (!meleeData) {
			Profiler.EndSample();
			return;
		}
		this.Log("Using Server");
		Profiler.BeginSample("GetCollisions");
		let hitTargets = this.ScanForHits(meleeData.colliderData);
		Profiler.EndSample();
		print("Server hit tick=" + InstanceFinder.TimeManager.Tick + ", hitTargets=" + hitTargets.size());
		Profiler.BeginSample("HitTargetsInflictDamage");
		hitTargets.forEach((data) => {
			Dependency<DamageService>().InflictDamage(data.hitEntity, meleeData?.damage ?? 0, {
				damageType: meleeData?.damageType,
				fromEntity: this.entity,
				knockbackDirection: data.knockbackDirection,
			});
		});
		Profiler.EndSample();
		Profiler.EndSample();
	}

	private ScanForHits(boxData: BoxCollision | undefined): MeleeHit[] {
		let collisionData: Array<MeleeHit> = [];
		let closestCollisionData: MeleeHit | undefined;
		if (!boxData) {
			error(this.meta.displayName + " Melee No Box Data");
			return collisionData;
		}
		this.Log("Finding Collisions");
		const detectHalfSize = new Vector3(boxData.boxHalfWidth, boxData.boxHalfHeight, boxData.boxHalfDepth);
		const layerMask = 8; // character layer: 1 << 3
		let boxLocalPos = new Vector3(
			boxData.localPositionOffsetX ?? 0,
			boxData.boxHalfHeight + (boxData.localPositionOffsetY ?? 0),
			-0.5 + boxData.boxHalfDepth + (boxData.localPositionOffsetZ ?? 0), //Offset -.5 so the collisions tarts at the back of our character (want to hit targets you are standing on)
		);
		const colliderWorldPos = this.entity.model.transform.TransformPoint(boxLocalPos);
		const hitColliders = Physics.OverlapBox(
			colliderWorldPos,
			detectHalfSize,
			this.entity.model.transform.rotation,
			layerMask,
			QueryTriggerInteraction.UseGlobal,
		);

		let foundRaycastCollision: MeleeHit | undefined;
		const rayDistance = (boxData.boxHalfDepth + boxData.boxHalfHeight + boxData.boxHalfWidth) * 2;

		//For each collider in the box detection
		for (let i = 0; i < hitColliders.Length; i++) {
			this.Log("Collider: " + i);
			const collider = hitColliders.GetValue(i);
			const targetEntity = Entity.FindByCollider(collider);
			//If we hit an entity that is not the owner of this item
			if (!targetEntity) {
				//Box check doesn't care about non entities
				continue;
			}
			if (targetEntity.id === this.entity.id) {
				//Hit Self
				continue;
			}
			this.Log("Hit Entity: " + targetEntity.id);

			//Raycast to the target to find a more concrete collisions
			//TODO the entities look direction should be synced here not just its plane aligned look direction
			let rayStart = this.entity.GetHeadPosition().add(this.entity.model.transform.position);
			let rayEnd = targetEntity.GetHeadPosition();
			let hitDirection = rayEnd.sub(rayStart).normalized;

			//RAYCAST ALL
			this.Log("Raycast All");
			const hitInfosArray = Physics.RaycastAll(rayStart, hitDirection, rayDistance, -1);
			const hitInfos = hitInfosArray as unknown as CSArray<RaycastHit>;
			let blockerDistance = 9999;
			// DebugUtil.DrawSingleLine(rayStart, rayEnd, Color.cyan, 2);

			//Check each ray collision
			for (let i = 0; i < hitInfos.Length; i++) {
				this.Log("Raycasting to target");
				let hitInfo = hitInfos.GetValue(i);
				//Look for entities and blocking colliders
				const rayTarget = Entity.FindByCollider(hitInfo.collider);
				if (rayTarget) {
					if (rayTarget.id === this.entity.id) {
						//Hit self, skip
						continue;
					} else if (rayTarget.id === targetEntity.id) {
						this.Log("Raycast hit: " + rayTarget.id);
						//Raycast hit the target entity
						foundRaycastCollision = {
							hitEntity: targetEntity,
							hitDirection: hitDirection,
							hitPosition: hitInfo.point,
							hitNormal: hitInfo.normal,
							distance: hitInfo.distance,
							knockbackDirection: this.entity.gameObject.transform.forward,
						};
						// DebugUtil.DrawSingleLine(rayStart, hitInfo.point, Color.green, 2);
						if (!closestCollisionData || hitInfo.distance < closestCollisionData.distance) {
							this.Log("New closest target: " + hitInfo.distance);
							closestCollisionData = foundRaycastCollision;
							continue;
						}
					} else {
						//Hit a non entity object
						this.Log("Blocked by object: " + hitInfo.collider.gameObject.name);
						blockerDistance = math.min(blockerDistance, hitInfo.distance);
						// DebugUtil.DrawSingleLine(rayStart, hitInfo.point, Color.red, 2);
					}
				}

				if (foundRaycastCollision) {
					this.Log("Found target");
					if (foundRaycastCollision.distance < blockerDistance) {
						this.Log("Using target");
						//Not blocked by something
						collisionData.push(foundRaycastCollision);
						// DebugUtil.DrawSingleLine(rayStart, foundRaycastCollision.hitPosition, Color.green, 2);
					} else {
						this.Log("Can't use target because of blocker");
					}
				}
			}
		}

		// DebugUtil.DrawBox(
		// 	colliderWorldPos,
		// 	this.entity.model.transform.rotation,
		// 	detectHalfSize,
		// 	closestCollisionData ? Color.green : Color.red,
		// 	2,
		// );

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
