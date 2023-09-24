import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemType } from "Shared/Item/ItemType";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { AudioBundlePlayMode, AudioBundleSpacialMode, AudioClipBundle } from "../../Audio/AudioClipBundle";
import { AudioManager } from "../../Audio/AudioManager";
import { ItemUtil } from "../../Item/ItemUtil";
import { ArrayUtil } from "../../Util/ArrayUtil";
import { BundleReferenceManager } from "../../Util/BundleReferenceManager";
import { BundleGroupNames, Bundle_Entity, Bundle_Entity_OnHit } from "../../Util/ReferenceManagerResources";
import { Task } from "../../Util/Task";
import { Entity, EntityReferences } from "../Entity";
import { ItemPlayMode } from "./CharacterEntityAnimator";

export class EntityAnimator {
	private readonly RootOverrideLayer = 1;
	private readonly TopMostLayerIndex = 3;
	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly anim: AnimancerComponent;
	public readonly defaultTransitionTime: number = 0.15;

	protected readonly entityRef: EntityReferences;
	protected bin = new Bin();
	private flinchClipFPS?: AnimationClip;
	private deathClipFPS?: AnimationClip;
	private flinchClipTP?: AnimationClip;
	private deathClipTP?: AnimationClip;
	private damageEffectTemplate?: GameObject;
	private deathEffectTemplate?: GameObject;
	private deathEffectVoidTemplate?: GameObject;
	private isFlashing = false;

	private footstepAudioBundle: AudioClipBundle;
	private slideAudioBundle: AudioClipBundle;
	private steppedOnBlockType = 0;
	private lastFootstepSoundTime = 0;
	private deathVfx?: GameObject;

	constructor(protected entity: Entity, anim: AnimancerComponent, entityRef: EntityReferences) {
		this.anim = anim;
		this.entityRef = entityRef;

		//AUDIO
		this.footstepAudioBundle = new AudioClipBundle([]);
		this.footstepAudioBundle.volumeScale = 0.15;
		this.footstepAudioBundle.spacialMode = entity.IsLocalCharacter()
			? AudioBundleSpacialMode.GLOBAL
			: AudioBundleSpacialMode.SPACIAL;

		this.slideAudioBundle = new AudioClipBundle(entityRef.slideSoundPaths);
		this.slideAudioBundle.volumeScale = 0.15;
		this.slideAudioBundle.useFullPath = true;
		this.slideAudioBundle.playMode = AudioBundlePlayMode.RANDOM_TO_LOOP;
		this.slideAudioBundle.spacialMode = entity.IsLocalCharacter()
			? AudioBundleSpacialMode.GLOBAL
			: AudioBundleSpacialMode.SPACIAL;

		//ANIMATIONS
		this.flinchClipFPS = BundleReferenceManager.LoadResource<AnimationClip>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.FlinchAnimFPS,
		);
		this.deathClipFPS = BundleReferenceManager.LoadResource<AnimationClip>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.DeathAnimFPS,
		);
		this.flinchClipTP = BundleReferenceManager.LoadResource<AnimationClip>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.FlinchAnimTP,
		);
		this.deathClipTP = BundleReferenceManager.LoadResource<AnimationClip>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.DeathAnimTP,
		);

		//VFX
		this.damageEffectTemplate = BundleReferenceManager.LoadResource<GameObject>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.GenericVFX,
		);
		this.deathEffectTemplate = BundleReferenceManager.LoadResource<GameObject>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.DeathVFX,
		);
		this.deathEffectVoidTemplate = BundleReferenceManager.LoadResource<GameObject>(
			BundleGroupNames.Entity,
			Bundle_Entity.OnHit,
			Bundle_Entity_OnHit.DeathVoidVFX,
		);

		//Listen to animation events
		const animConn = this.entityRef.animationEvents.OnEntityAnimationEvent((data) => {
			if (data.key !== 0) {
				//print("Animation Event: " + data.key + " On Entity: " + this.entity.id);
			}
			this.OnAnimationEvent(data.key, data);
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(animConn);
		});

		this.entityRef.root.gameObject.SetActive(true);
	}

	public Destroy(): void {
		if (this.deathVfx) {
			//TODO Move the transform off this entity so the effect can keep playing even after the body is gone
			EffectsManager.ReleaseGameObject(this.deathVfx);
		}
		this.bin.Clean();
	}

	public PlayAnimation(clip: AnimationClip, layer = 0, wrapMode: WrapMode = WrapMode.Default): AnimancerState {
		return AnimancerBridge.Play(this.anim, clip, layer, this.defaultTransitionTime, FadeMode.FromStart, wrapMode);
	}

	public PlayAnimationOnce(clip: AnimationClip, layer = 0, wrapMode: WrapMode = WrapMode.Default): AnimancerState {
		return AnimancerBridge.PlayOnce(this.anim, clip, layer, this.defaultTransitionTime, FadeMode.FromStart);
	}

	public StartItemIdle(): void {}

	public PlayItemUse(useIndex = 0, itemPlayMode: ItemPlayMode = 0): void {}

	public EquipItem(itemId: BundleGroupNames): void {}

	public SetFirstPerson(isFirstPerson: boolean): void {}

	public PlayTakeDamage(
		damageAmount: number,
		damageType: DamageType,
		position: Vector3,
		entityModel: GameObject | undefined,
	) {
		const isFirstPerson =
			RunUtil.IsClient() && this.entity.IsLocalCharacter() && Dependency<LocalEntityController>().IsFirstPerson();

		this.PlayDamageFlash();

		//Animate flinch
		const flinchClip = isFirstPerson ? this.flinchClipFPS : this.flinchClipTP;
		if (flinchClip) {
			this.PlayAnimation(flinchClip, this.RootOverrideLayer);
			Task.Delay(0.1, () => {
				AnimancerBridge.GetLayer(this.anim, this.RootOverrideLayer).StartFade(0, 0.05);
			});
		}

		//Don't render some effects if we are in first person
		if (isFirstPerson) {
			return;
		}

		//Play specific effects for different damage types like fire attacks or magic damage
		let vfxTemplate;
		switch (damageType) {
			default:
				vfxTemplate = this.damageEffectTemplate;
				break;
		}
		if (vfxTemplate) {
			const go = EffectsManager.SpawnGameObjectAtPosition(vfxTemplate, position, undefined, 2);
			if (entityModel) {
				go.transform.parent = entityModel.transform;
			}
		}
	}

	public PlayDeath(damageType: DamageType) {
		//Play death animation
		let isFirstPerson = false;
		if (this.entity.IsLocalCharacter()) {
			const localController = Dependency<LocalEntityController>();
			isFirstPerson = localController.IsFirstPerson();
			//Always play death animation in third person
			// localController.ForceFirstPersonMode(false);
			//Lock Inputs
			this.entity.entityDriver.disableInput = true;
		}
		const deathClip = this.deathClipTP; // isFirstPerson ? this.deathClipFPS : this.deathClipTP;
		if (deathClip) {
			this.PlayAnimation(deathClip, this.TopMostLayerIndex);
		}
		//Spawn death particle
		const inVoid = damageType === DamageType.VOID;
		const deathEffect = inVoid ? this.deathEffectVoidTemplate : this.deathEffectTemplate;
		if (deathEffect) {
			this.deathVfx = EffectsManager.SpawnGameObjectAtPosition(
				deathEffect,
				this.entity.GetHeadPosition(),
				undefined,
			);
			if (!inVoid) {
				this.deathVfx.transform.SetParent(this.entity.gameObject.transform);
			}
		}

		Task.Delay(0.5, () => {
			this.entityRef.root.gameObject.SetActive(false);
		});
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

		// fallback to stone sounds.
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
				this.slideAudioBundle.spacialPosition = this.entity.model.transform.position;
				this.slideAudioBundle.Stop();
				this.slideAudioBundle.PlayNext();
				break;
			case EntityAnimationEventKey.SLIDE_END:
				this.slideAudioBundle.Stop();
				break;
			case EntityAnimationEventKey.JUMP:
				if (this.entityRef.jumpSound) {
					if (this.entity.IsLocalCharacter()) {
						AudioManager.PlayClipGlobal(this.entityRef.jumpSound, {
							volumeScale: 0.2,
						});
					} else {
						AudioManager.PlayClipAtPosition(
							this.entityRef.jumpSound,
							this.entity.model.transform.position,
							{
								volumeScale: 0.2,
							},
						);
					}
				}
				break;
			case EntityAnimationEventKey.LAND:
				this.PlayFootstepSound();
				if (this.entityRef.landSound) {
					if (this.entity.IsLocalCharacter()) {
						AudioManager.PlayClipGlobal(this.entityRef.landSound, {
							volumeScale: 0.2,
						});
					} else {
						AudioManager.PlayClipAtPosition(
							this.entityRef.landSound,
							this.entity.model.transform.position,
							{
								volumeScale: 0.2,
							},
						);
					}
				}
				break;
		}
	}
}
