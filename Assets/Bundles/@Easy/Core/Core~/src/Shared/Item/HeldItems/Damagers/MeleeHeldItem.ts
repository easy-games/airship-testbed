import { Dependency } from "@easy-games/flamework-core";
import { ViewmodelController } from "Client/Controllers/Viewmodel/ViewmodelController";
import { Airship } from "Shared/Airship";
import Character from "Shared/Character/Character";
import { LocalCharacterSingleton } from "Shared/Character/LocalCharacter/LocalCharacterSingleton";
import { DamageUtils } from "Shared/Damage/DamageUtils";
import { MeleeItemDef } from "Shared/Item/ItemDefinitionTypes";
import { Bin } from "Shared/Util/Bin";
import { CSArrayUtil } from "Shared/Util/CSArrayUtil";
import { Layer } from "Shared/Util/Layer";
import { RunUtil } from "Shared/Util/RunUtil";
import { Task } from "Shared/Util/Task";
import { Theme } from "Shared/Util/Theme";
import { SetTimeout } from "Shared/Util/Timer";
import { EffectsManager } from "../../../Effects/EffectsManager";
import { HeldItem } from "../HeldItem";

export class MeleeHeldItem extends HeldItem {
	private gizmoEnabled = true;
	private animationIndex = 0;
	private bin: Bin = new Bin();
	private currentUseVFX: GameObject | undefined;
	// private combatVars = DynamicVariablesManager.Instance.GetVars("Combat")!;

	override OnUseClient(useIndex: number) {
		if (this.character.IsDead()) return;

		//Don't do the default use animations
		this.playEffectsOnUse = false;
		super.OnUseClient(useIndex);

		//Animation
		this.character.animator.PlayItemUseAnim(this.animationIndex, {
			fadeInDuration: 0.05,
			fadeOutDuration: 0.1,
		});

		let meleeData = this.itemMeta?.melee;
		if (!meleeData) {
			error("No melee data on a melee weapon?");
		}

		//Play the items use effect
		const isFirstPerson =
			this.character.IsLocalCharacter() && Dependency<LocalCharacterSingleton>().IsFirstPerson();
		if (meleeData.onUseVFX) {
			if (isFirstPerson) {
				this.currentUseVFX = EffectsManager.SpawnBundleEffectById(meleeData.onUseVFX_FP[this.animationIndex]);
				if (this.currentUseVFX) {
					//Spawn first person effect on the spine
					this.currentUseVFX.transform.SetParent(
						Dependency<ViewmodelController>().boneTransforms.spineMiddle,
					);
					this.currentUseVFX.transform.localRotation = Quaternion.identity;
					this.currentUseVFX.transform.localPosition = Vector3.zero;
				}
			} else {
				//Spawn third person effect on the root
				this.currentUseVFX = EffectsManager.SpawnBundleEffectById(
					meleeData.onUseVFX[this.animationIndex],
					this.character.model.transform.position,
					this.character.model.transform.eulerAngles,
				);
				if (this.currentUseVFX) {
					//Spawn first person effect on the spine
					this.currentUseVFX.transform.SetParent(this.character.model.transform);
				}
			}
			if (this.currentUseVFX) {
				const particleSystems = this.currentUseVFX.gameObject.GetComponentsInChildren<ParticleSystem>();
				for (const particleSystem of CSArrayUtil.Convert(particleSystems)) {
					particleSystem.gameObject.layer = isFirstPerson ? Layer.FIRST_PERSON : Layer.CHARACTER;
					particleSystem.Play();
				}
			}

			this.animationIndex++;
			if (this.animationIndex >= meleeData.onUseVFX.size()) {
				this.animationIndex = 0;
			}
		}

		const DoHit = () => {
			if (!meleeData) {
				return;
			}
			//Sound effect
			this.audioPitchShift = this.animationIndex === 0 ? 1 : 2;
			this.PlayItemSound();

			this.ClientPredictDamage(meleeData);
		};

		if (meleeData.hitDelay !== undefined && meleeData.hitDelay !== 0) {
			Task.Delay(meleeData.hitDelay, () => {
				DoHit();
			});
		} else {
			DoHit();
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

	private ClientPredictDamage(meleeData: MeleeItemDef) {
		//Only local player should do collisions checks
		if (this.character.IsLocalCharacter()) {
			Profiler.BeginSample("MeleeClientEffect");
			// const entityDriver = this.entity.GetEntityDriver();
			// entityDriver.UpdateSyncTick();

			let hitTargets = this.ScanForHits();
			let hitSomething = false;
			let effectGO: GameObject | undefined;
			for (const data of hitTargets) {
				hitSomething = true;
				if (meleeData.onHitPrefabPath) {
					//Local damage predictions
					effectGO = EffectsManager.SpawnPrefabEffect(
						meleeData.onHitPrefabPath,
						data.hitPosition,
						Quaternion.LookRotation(data.hitDirection).eulerAngles,
					);
					if (effectGO) {
						effectGO.transform.SetParent(data.hitCharacter.model.transform);
					}
				}
			}
			if (hitSomething) {
				this.Log("client found hits");
				let effectI = 0;
				let effects: GameObject[] = [];
				if (this.currentUseVFX) {
					effects[effectI] = this.currentUseVFX;
					effectI++;
				}
				if (effectGO) {
					effects[effectI] = effectGO;
					effectI++;
				}
				DamageUtils.AddAttackStun(this.character, meleeData.damage, false, effects);
			} else {
				this.Log("No client hits found");
			}
			Profiler.EndSample();
		}
	}

	override OnUseServer(useIndex: number) {
		super.OnUseServer(useIndex);

		if (this.character.IsDead()) return;

		let meleeData = this.itemMeta?.melee;
		if (!meleeData) {
			error("Melee item doesn't have melee data?");
		}

		const hitDelay = meleeData.hitDelay ?? 0;
		if (meleeData.instantDamage || hitDelay <= 0) {
			//hit the targets immediatly
			this.ServerHit(meleeData);
		} else {
			//Wait for the attack to hit
			Task.Delay(hitDelay, () => {
				this.ServerHit(meleeData);
			});
		}
	}

	private ServerHit(meleeData: MeleeItemDef | undefined) {
		let hitTargets = this.ScanForHits();
		hitTargets.forEach((data) => {
			let damage = meleeData?.damage ?? 0;
			if (data.criticalHit) {
				damage *= 1.3;
				damage = math.floor(damage);
			}
			let knockback = data.knockbackDirection.mul(8);
			Airship.damage.InflictDamage(data.hitCharacter.gameObject, damage, this.character.gameObject, {
				// damageType: meleeData?.damageType ?? DamageType.SWORD,
				knockback,
				// criticalHit: data.criticalHit,
			});
		});
	}

	private ScanForHits(): MeleeHit[] {
		let farBox = new Vector3(0.2, 0.2, 4.8);
		let closeBox = new Vector3(3, 3, 4);

		// let farBox = this.combatVars.GetVector3("swordBoxFar");
		// let closeBox = this.combatVars.GetVector3("swordBoxClose");

		this.Log("scanning for hits");
		let hits = this.ScanBox(closeBox, [], Theme.green, true);
		if (this.itemMeta?.melee?.canHitMultipleTargets) {
			let farHits = this.ScanBox(
				farBox,
				hits.map((x) => x.hitCharacter.id),
				Theme.red,
				false,
			);
			hits = [...hits, ...farHits];
		}
		return hits;
	}

	private ScanBox(box: Vector3, ignoreEntityIds: number[], debugColor: Color, allowCriticalHit: boolean): MeleeHit[] {
		let collisionData: Array<MeleeHit> = [];
		let collisionIndex = 0;
		let closestCollisionData: MeleeHit | undefined;

		const layerMask = 8; // character layer: 1 << 3

		const lookVec = this.lookVector;
		box = box.add(new Vector3(0, 0, 0.5));
		let halfExtents = new Vector3(box.x / 2, box.y / 2, box.z / 2);
		const headPosition = this.character.headBone.transform.position;
		let colliderWorldPos = headPosition.add(lookVec.mul(-0.5 + box.z / 2));

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
			const collider = hitColliders.GetValue(i);
			const targetCharacter = Airship.characters.FindByCollider(collider);
			//If we hit an entity that is not the owner of this item
			if (!targetCharacter) {
				//Box check doesn't care about non entities
				continue;
			}

			if (targetCharacter === this.character) {
				//Hit Self
				this.Log("hit self");
				continue;
			}
			if (ignoreEntityIds.includes(targetCharacter.id)) {
				this.Log("ignored entity: " + targetCharacter.id);
				continue;
			}

			if (!Airship.damage.CanClientDamage(targetCharacter.gameObject, this.character.gameObject)) {
				continue;
			}

			//Raycast to the target to find a more concrete collisions
			let rayStart = headPosition;
			let rayEnd = targetCharacter.chestBone.transform.position;
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
				const hitCharacter = Airship.characters.FindByCollider(hitInfo.collider);
				if (hitCharacter) {
					if (hitCharacter.id === this.character.id) {
						//Hit self, skip
						continue;
					} else if (hitCharacter.id === targetCharacter.id) {
						//Raycast hit the target entity
						let knockbackDirection = this.character.gameObject.transform.forward;
						if (RunUtil.IsServer()) {
							knockbackDirection = new Vector3(knockbackDirection.x, 1, knockbackDirection.z);
						}
						foundRaycastCollision = {
							hitCharacter: targetCharacter,
							hitDirection: hitDirection,
							hitPosition: hitInfo.point,
							hitNormal: hitInfo.normal,
							distance: hitInfo.distance,
							knockbackDirection,
						};

						// Extra raycast to find impact point
						const ray = new Ray(headPosition, this.lookVector);
						// DebugUtil.DrawSingleLine(
						// 	ray.origin,
						// 	ray.origin.add(ray.direction.mul(rayDistance)),
						// 	Theme.red,
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
							this.Log("found close target");
							continue;
						} else {
							this.Log("target is too far away");
						}
					} else {
						// hit other entity. ignore.
						this.Log("ignoring entity");
						continue;
					}
				} else {
					//Hit a non entity object
					this.Log("Blocked by non entity: " + hitInfo.distance);
					blockerDistance = math.min(blockerDistance, hitInfo.distance);
				}
			}
			// if (foundRaycastCollision) {
			// 	this.Log("found collision");
			// 	if (foundRaycastCollision.distance > blockerDistance) {
			// 		print("target is farther than blocker");
			// 		return [];
			// 	}
			// }
		}

		// for (let collision of collisionData) {
		// 	if (allowCriticalHit) {
		// 		const hitHeight = collision.hitPosition.sub(collision.hitCharacter.model.transform.position).magnitude;
		// 		if (collision.hitCharacter.IsHeadshotHitHeight(hitHeight)) {
		// 			collision.criticalHit = true;
		// 		}
		// 		// print("hitHeight: " + hitHeight + ", go:" + collision.hitEntity.id);
		// 	}
		// }

		if (this.itemMeta?.melee?.canHitMultipleTargets) {
			return collisionData;
		} else if (closestCollisionData) {
			return [closestCollisionData];
		}
		this.Log("found nothing");
		return [];
	}
}

export interface MeleeHit {
	hitCharacter: Character;
	hitDirection: Vector3;
	hitPosition: Vector3;
	hitNormal: Vector3;
	distance: number;
	knockbackDirection: Vector3;
	criticalHit?: boolean;
}
