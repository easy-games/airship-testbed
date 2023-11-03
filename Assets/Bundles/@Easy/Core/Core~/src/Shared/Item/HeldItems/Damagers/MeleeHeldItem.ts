import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { DamageService } from "Server/Services/Damage/DamageService";
import { DamageType } from "Shared/Damage/DamageType";
import { Bin } from "Shared/Util/Bin";
import { Layer } from "Shared/Util/Layer";
import { RunUtil } from "Shared/Util/RunUtil";
import { Theme } from "Shared/Util/Theme";
import { SetTimeout } from "Shared/Util/Timer";
import { EffectsManager } from "../../../Effects/EffectsManager";
import { Entity } from "../../../Entity/Entity";
import { HeldItem } from "../HeldItem";

export class MeleeHeldItem extends HeldItem {
	private gizmoEnabled = true;
	private animationIndex = 0;
	private bin: Bin = new Bin();
	// private combatVars = DynamicVariablesManager.Instance.GetVars("Combat")!;

	override OnUseClient(useIndex: number) {
		if (this.entity.IsDead()) return;

		//Don't do the default use animations
		this.playEffectsOnUse = false;
		super.OnUseClient(useIndex);

		//Animation
		this.entity.animator.PlayUseAnim(this.animationIndex, {
			transitionTime: 0.1,
			autoFadeOut: true,
		});

		//Sound effect
		this.audioPitchShift = this.animationIndex === 0 ? 1 : 2;
		this.PlayItemSound();

		let meleeData = this.itemMeta?.melee;
		if (!meleeData) {
			error("No melee data on a melee weapon?");
			return;
		}

		//Only local player should do collisions checks
		if (this.entity.IsLocalCharacter()) {
			Profiler.BeginSample("MeleeClientEffect");
			// const entityDriver = this.entity.GetEntityDriver();
			// entityDriver.UpdateSyncTick();

			let hitTargets = this.ScanForHits();

			for (const data of hitTargets) {
				if (meleeData.onHitPrefabPath) {
					//Local damage predictions
					const effectGO = EffectsManager.SpawnPrefabEffect(
						meleeData.onHitPrefabPath,
						data.hitPosition,
						Quaternion.LookRotation(data.hitDirection).eulerAngles,
					);
					if (effectGO) {
						effectGO.transform.SetParent(data.hitEntity.model.transform);
					}
				}
			}
			Profiler.EndSample();
		}

		//Play the items use effect
		const isFirstPerson = this.entity.IsLocalCharacter() && Dependency<LocalEntityController>().IsFirstPerson();
		if (meleeData.onUseVFX) {
			if (isFirstPerson) {
				let effect = EffectsManager.SpawnBundleEffectById(meleeData.onUseVFX_FP[this.animationIndex]);
				if (effect) {
					//Spawn first person effect on the spine
					effect.transform.SetParent(this.entity.references.spineBoneMiddle);
					effect.transform.localRotation = Quaternion.identity;
					effect.transform.localPosition = Vector3.zero;
					effect.layer = Layer.FIRST_PERSON;
				}
			} else {
				//Spawn third person effect on the root
				let effect = EffectsManager.SpawnBundleEffectById(
					meleeData.onUseVFX[this.animationIndex],
					this.entity.model.transform.position,
					this.entity.model.transform.eulerAngles,
				);
				if (effect) {
					//Spawn first person effect on the spine
					effect.transform.SetParent(this.entity.model.transform);
					effect.layer = Layer.CHARACTER;
				}
			}

			this.animationIndex++;
			if (this.animationIndex >= meleeData.onUseVFX.size()) {
				this.animationIndex = 0;
			}

			//Reset the index if you don't use the attack for a while
			if (this.bin) {
				this.bin.Clean();
			}
			if (this.itemMeta?.usable?.cooldownSeconds) {
				this.bin.Add(
					SetTimeout(this.itemMeta.usable.cooldownSeconds + 0.25, () => {
						this.animationIndex = 0;
					}),
				);
			}
		}
	}

	override OnUseServer(useIndex: number) {
		super.OnUseServer(useIndex);

		if (this.entity.IsDead()) return;

		let meleeData = this.itemMeta?.melee;
		if (!meleeData) {
			error("Melee item doesn't have melee data?");
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
		let farBox = new Vector3(0.2, 0.2, 4.8);
		let closeBox = new Vector3(3, 3, 4);
		// let farBox = this.combatVars.GetVector3("swordBoxFar");
		// let closeBox = this.combatVars.GetVector3("swordBoxClose");

		let hits = this.ScanBox(closeBox, [], Theme.Green);
		if (this.itemMeta?.melee?.canHitMultipleTargets) {
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
		let collisionIndex = 0;
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
						let knockbackDirection = this.entity.gameObject.transform.forward;
						if (RunUtil.IsServer()) {
							knockbackDirection = new Vector3(knockbackDirection.x, 1, knockbackDirection.z);
						}
						foundRaycastCollision = {
							hitEntity: targetEntity,
							hitDirection: hitDirection,
							hitPosition: hitInfo.point,
							hitNormal: hitInfo.normal,
							distance: hitInfo.distance,
							knockbackDirection,
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

						collisionData[collisionIndex] = foundRaycastCollision;
						collisionIndex++;
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

		if (this.itemMeta?.melee?.canHitMultipleTargets) {
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
