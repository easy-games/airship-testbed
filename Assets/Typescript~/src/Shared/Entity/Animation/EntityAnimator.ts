import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Global/Character/LocalEntityController";
import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemType } from "Shared/Item/ItemType";
import { RunUtil } from "Shared/Util/RunUtil";
import { AudioClipBundle } from "../../Audio/AudioClipBundle";
import { AudioManager } from "../../Audio/AudioManager";
import { ItemUtil } from "../../Item/ItemUtil";
import { ArrayUtil } from "../../Util/ArrayUtil";
import { BundleReferenceManager } from "../../Util/BundleReferenceManager";
import { BundleGroupNames, Bundle_Entity, Bundle_Entity_OnHit } from "../../Util/ReferenceManagerResources";
import { Task } from "../../Util/Task";
import { Entity, EntityReferences } from "../Entity";

export class EntityAnimator {
	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly anim: AnimancerComponent;
	public readonly defaultTransitionTime: number = 0.15;

	protected readonly entityRef: EntityReferences;

	private damageEffectClip?: AnimationClip;
	private damageEffectTemplate?: GameObject;
	private isFlashing = false;

	private footstepAudioBundle: AudioClipBundle;
	private steppedOnBlockType = 0;
	private lastFootstepSoundTime = 0;

	constructor(protected entity: Entity, anim: AnimancerComponent, entityRef: EntityReferences) {
		this.anim = anim;
		this.entityRef = entityRef;
		this.footstepAudioBundle = new AudioClipBundle([], "Footsteps");
		this.footstepAudioBundle.soundOptions = { volumeScale: 0.15 };
		this.damageEffectClip = BundleReferenceManager.LoadResource<AnimationClip>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.GeneralAnim,
		);
		this.damageEffectTemplate = BundleReferenceManager.LoadResource<GameObject>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.GenericVFX,
		);

		//Listen to animation events
		this.entityRef.animationEvents.OnEntityAnimationEvent((data) => {
			if (data.key !== 0) {
				//print("Animation Event: " + data.key + " On Entity: " + this.entity.id);
			}
			this.OnAnimationEvent(data.key, data);
		});
	}

	public PlayAnimation(clip: AnimationClip, layer = 0, wrapMode: WrapMode = WrapMode.Default): AnimancerState {
		return AnimancerBridge.Play(this.anim, clip, layer, this.defaultTransitionTime, FadeMode.FromStart, wrapMode);
	}

	public PlayAnimationOnce(clip: AnimationClip, layer = 0, wrapMode: WrapMode = WrapMode.Default): AnimancerState {
		return AnimancerBridge.PlayOnce(this.anim, clip, layer, this.defaultTransitionTime, FadeMode.FromStart);
	}

	public PlayTakeDamage(
		damageAmount: number,
		damageType: DamageType,
		position: Vector3,
		entityModel: GameObject | undefined,
	) {
		this.PlayDamageFlash();

		if (RunUtil.IsClient()) {
			if (this.entity.IsLocalCharacter() && Dependency<LocalEntityController>().IsFirstPerson()) {
				return;
			}
		}

		//Play specific effects for different damage types like fire attacks or magic damage
		let vfxTemplate;
		switch (damageType) {
			default:
				vfxTemplate = this.damageEffectTemplate;
				break;
		}
		if (vfxTemplate) {
			const go = EffectsManager.SpawnEffectAtPosition(vfxTemplate, position);
			if (entityModel) {
				go.transform.parent = entityModel.transform;
			}
		}
	}

	private PlayDamageFlash() {
		if (this.entity.IsDestroyed() || this.isFlashing) return;
		let allMeshes = ArrayUtil.Combine(this.entity.GetAccessoryMeshes(AccessorySlot.Root), this.entityRef.meshes);
		const duration = this.flashTransitionDuration + this.flashOnTime;
		this.isFlashing = true;
		allMeshes.forEach((renderer) => {
			if (renderer && renderer.enabled) {
				renderer
					.TweenMaterialsFloatProperty("_OverrideStrength", 0, 1, this.flashTransitionDuration)
					.SetPingPong();
			}
		});
		Task.Delay(duration, () => {
			this.isFlashing = false;
		});
	}

	public PlayFootstepSound(): void {
		const blockId = this.entity.entityDriver.groundedBlockId;
		if (blockId === 0) return;

		if (os.clock() - this.lastFootstepSoundTime < 0.18) {
			return;
		}
		this.lastFootstepSoundTime = os.clock();

		let itemType = ItemUtil.GetItemTypeFromBlockId(blockId);
		if (!itemType) {
			itemType = ItemType.STONE;
		}

		const itemMeta = ItemUtil.GetItemMeta(itemType);

		let stepSounds = itemMeta.block?.stepSound ?? ItemUtil.GetItemMeta(ItemType.STONE).block?.stepSound;
		if (stepSounds === undefined) {
			stepSounds = [];
		}

		if (stepSounds.size() > 0) {
			if (blockId !== this.steppedOnBlockType) {
				//Refresh our audio bundle with the new sound list
				this.steppedOnBlockType = blockId;
				this.footstepAudioBundle.UpdatePaths(stepSounds);
			}
			this.footstepAudioBundle.spacialPosition = this.entity.model.transform.position;
			this.footstepAudioBundle.PlayNext();
		}
	}

	private OnAnimationEvent(key: EntityAnimationEventKey, data: EntityAnimationEventData) {
		switch (key) {
			case EntityAnimationEventKey.FOOTSTEP:
				this.PlayFootstepSound();
				break;
			case EntityAnimationEventKey.SLIDE_START:
				if (this.entityRef.slideSound) {
					AudioManager.PlayClipAtPosition(this.entityRef.slideSound, this.entity.model.transform.position, {
						volumeScale: 0.3,
					});
				}
				break;
			case EntityAnimationEventKey.JUMP:
				if (this.entityRef.jumpSound) {
					AudioManager.PlayClipAtPosition(this.entityRef.jumpSound, this.entity.model.transform.position, {
						volumeScale: 0.2,
					});
				}
				break;
		}
	}
}
