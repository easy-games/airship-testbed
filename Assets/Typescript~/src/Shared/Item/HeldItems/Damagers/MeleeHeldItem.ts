import { Dependency } from "@easy-games/flamework-core";
import { Theme } from "Shared/Util/Theme";
import { DamageService } from "../../../../Server/Services/Global/Damage/DamageService";
import { EffectsManager } from "../../../Effects/EffectsManager";
import { Entity } from "../../../Entity/Entity";
import { Bundle_ItemSword } from "../../../Util/ReferenceManagerResources";
import { HeldItem } from "../HeldItem";

export class MeleeHeldItem extends HeldItem {
	private gizmoEnabled = true;
	private combatVars = DynamicVariablesManager.Instance.GetVars("Combat")!;

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

			let farTargets = this.ScanForHits();

			for (const data of farTargets) {
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
			}
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
		let hitTargets = this.ScanForHits();
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

	private ScanForHits(): MeleeHit[] {
		let farBox = this.combatVars.GetVector3("swordBoxFar");
		let closeBox = this.combatVars.GetVector3("swordBoxClose");

		let farHits = this.ScanBox(farBox, [], Theme.Red);
		let closeHits = this.ScanBox(
			closeBox,
			farHits.map((x) => x.hitEntity.id),
			Theme.Green,
		);
		let results = [...farHits, ...closeHits];
		return results;
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
			DebugUtil.DrawBox(colliderWorldPos, rotation, halfExtents, debugColor, 2);
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
			this.Log("Collider: " + i);
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
			this.Log("Hit Entity: " + targetEntity.id);

			//Raycast to the target to find a more concrete collisions\
			let rayStart = this.entity.GetHeadPosition();
			let rayEnd = targetEntity.GetHeadPosition();
			let hitDirection = rayEnd.sub(rayStart).normalized;

			//RAYCAST ALL
			this.Log("Raycast All");
			const hitInfosArray = Physics.RaycastAll(rayStart, hitDirection, rayDistance, -1);
			const hitInfos = hitInfosArray as unknown as CSArray<RaycastHit>;
			let blockerDistance = 9999;

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
