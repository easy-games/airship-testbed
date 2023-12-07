import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import StringUtils from "Shared/Types/StringUtil";
import { Bin } from "Shared/Util/Bin";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { AudioBundlePlayMode, AudioBundleSpacialMode, AudioClipBundle } from "../../Audio/AudioClipBundle";
import { ItemUtil } from "../../Item/ItemUtil";
import { ArrayUtil } from "../../Util/ArrayUtil";
import { BundleReferenceManager } from "../../Util/BundleReferenceManager";
import { BundleGroupNames, Bundle_Entity, Bundle_Entity_OnHit } from "../../Util/ReferenceManagerResources";
import { Task } from "../../Util/Task";
import { Entity } from "../Entity";
import EntityReferencesComponent from "../EntityReferencesComponent";
import { EntityAnimationLayer } from "./EntityAnimationLayer";

export abstract class EntityAnimator {
	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly anim: AnimancerComponent;
	public readonly defaultTransitionTime: number = 0.15;

	protected readonly entityRef: EntityReferencesComponent;
	protected bin = new Bin();
	private flinchClipFPS?: AnimationClip;
	private deathClipFPS?: AnimationClip;
	private flinchClipTP?: AnimationClip;
	private deathClipTP?: AnimationClip;
	private damageEffectTemplate?: GameObject;
	private deathEffectTemplate?: GameObject;
	private deathEffectVoidTemplate?: GameObject;
	private isFlashing = false;
	protected isFirstPerson = false;

	private footstepAudioBundle: AudioClipBundle | undefined;
	private slideAudioBundle: AudioClipBundle | undefined;
	private steppedOnBlockType = 0;
	private lastFootstepSoundTime = 0;
	private deathVfx?: GameObject;

	public baseFootstepVolumeScale = 0.1;

	constructor(protected entity: Entity, anim: AnimancerComponent, entityRef: EntityReferencesComponent) {
		this.anim = anim;
		this.entityRef = entityRef;
		this.isFlashing = false;

		//AUDIO
		if (RunUtil.IsClient()) {
			this.footstepAudioBundle = new AudioClipBundle([]);
			this.footstepAudioBundle.volumeScale = this.baseFootstepVolumeScale;
			this.footstepAudioBundle.soundOptions.maxDistance = 15;
			this.footstepAudioBundle.spacialMode = entity.IsLocalCharacter()
				? AudioBundleSpacialMode.GLOBAL
				: AudioBundleSpacialMode.SPACIAL;

			this.slideAudioBundle = new AudioClipBundle(entityRef.GetSlideSoundPaths());
			this.slideAudioBundle.volumeScale = 0.2;
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
			// this.deathEffectVoidTemplate = BundleReferenceManager.LoadResource<GameObject>(
			// 	BundleGroupNames.Entity,
			// 	Bundle_Entity.OnHit,
			// 	Bundle_Entity_OnHit.DeathVoidVFX,
			// );
		}

		//Listen to animation events
		const animConn = this.entityRef.animationEvents.OnEntityAnimationEvent((data) => {
			// if (data !== 0) {
			// 	print("Animation Event: " + data + " On Entity: " + this.entity.id);
			// }
			this.OnAnimationEvent(data);
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

	public PlayAnimationOnLayer(
		clip: AnimationClip,
		layer: number,
		wrapMode: WrapMode = WrapMode.Default,
		transitionTime = this.defaultTransitionTime,
		onEnd?: Callback,
	): AnimancerState {
		return AnimancerBridge.PlayOnLayer(this.anim, clip, layer, transitionTime, FadeMode.FromStart, wrapMode);
	}

	public StartIdleAnim(instantTransition: boolean): void {}

	public PlayUseAnim(
		useIndex = 0,
		config?: {
			fadeMode?: FadeMode;
			wrapMode?: WrapMode;
			fadeInDuration?: number;
			fadeOutDuration?: number;
			autoFadeOut?: boolean;
		},
	): void {}

	public EquipItem(itemMeta: ItemMeta | undefined): void {}

	public abstract PlayAnimation(
		clip: AnimationClip,
		layer: number,
		onEnd?: Callback,
		config?: {
			fadeMode?: FadeMode;
			wrapMode?: WrapMode;
			fadeInDuration?: number;
			fadeOutDuration?: number;
			autoFadeOut?: boolean;
		},
	): AnimancerState;

	public SetFirstPerson(isFirstPerson: boolean): void {
		this.isFirstPerson = isFirstPerson;
	}

	public PlayTakeDamage(
		flinchDuration: number,
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
			this.PlayAnimation(flinchClip, EntityAnimationLayer.ROOT_OVERRIDE, undefined, {
				autoFadeOut: false,
				fadeInDuration: 0.01,
			});
			Task.Delay(flinchDuration, () => {
				AnimancerBridge.GetLayer(this.anim, EntityAnimationLayer.ROOT_OVERRIDE).StartFade(0, 0.05);
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
				go.transform.SetParent(entityModel.transform);
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
			this.PlayAnimation(deathClip, EntityAnimationLayer.TOP_MOST);
		}
		//Spawn death particle
		const inVoid = damageType === DamageType.VOID;
		let deathEffect = inVoid ? this.deathEffectVoidTemplate : this.deathEffectTemplate;
		if (inVoid && this.entity.IsLocalCharacter()) {
			deathEffect = undefined;
		}
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
		let allMeshes = this.entity.accessoryBuilder.GetAllAccessoryMeshes();
		const duration = this.flashTransitionDuration + this.flashOnTime;
		this.isFlashing = true;
		for (let i = 0; i < allMeshes.Length; i++) {
			const renderer = allMeshes.GetValue(i);
			if (renderer && renderer.enabled) {
				renderer
					.TweenMaterialsFloatProperty("_OverrideStrength", 0, 1, this.flashTransitionDuration)
					.SetPingPong();
			}
		}
		Task.Delay(duration, () => {
			this.isFlashing = false;
		});
	}

	public SetFresnelColor(color: Color, power: number, strength: number) {
		if (this.entity.IsDestroyed()) return;
		let allMeshes = ArrayUtil.Combine(
			this.entity.GetAccessoryMeshes(AccessorySlot.Root),
			this.entityRef.GetMeshRenderers(),
		);
		//TODO: Material property block AddColor doesn't seem to be working???
		/* const propertyBlock: MaterialPropertyBlock = Bridge.MakeMaterialPropertyBlock();
		propertyBlock.AddFloat("_RimPower", power);
		propertyBlock.AddFloat("_RimIntensity", strength);
		propertyBlock.AddColor("_RimColor", color); */
		allMeshes.forEach((renderer) => {
			if (renderer && renderer.enabled) {
				const materials = renderer.materials;
				for (let i = 0; i < materials.Length; i++) {
					const mat = materials.GetValue(i);
					mat.EnableKeyword("RIM_LIGHT_ON");
					mat.SetColor("_RimColor", color);
					mat.SetFloat("_RimPower", power);
					mat.SetFloat("_RimIntensity", strength);
					//renderer.SetPropertyBlock(propertyBlock);
				}
			}
		});
	}

	/**
	 *
	 * @param volumeScale
	 * @param cameraPos Pass in cached camera position if playing lots of sounds to improve performance.
	 * @returns
	 */
	public PlayFootstepSound(volumeScale: number, cameraPos?: Vector3): void {
		// Check if we should play
		if (os.clock() - this.lastFootstepSoundTime < 0.18) {
			return;
		}
		const blockId = this.entity.entityDriver.groundedBlockId;
		if (blockId === 0) return;

		if (!cameraPos) {
			cameraPos = Camera.main.transform.position;
		}
		if (cameraPos.sub(this.entity.model.transform.position).magnitude > 20) {
			return;
		}

		// Finished checks. We are playing.
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

		if (stepSounds.size() > 0 && this.footstepAudioBundle) {
			let soundPath = RandomUtil.FromArray(stepSounds);
			if (!StringUtils.includes(soundPath, ".")) {
				soundPath += ".ogg";
			}
			let audioClip = AssetCache.LoadAsset<AudioClip>(soundPath);
			let volume = this.baseFootstepVolumeScale * volumeScale;
			this.entityRef.footstepAudioSource.PlayOneShot(audioClip, volume);
		}
	}

	private OnAnimationEvent(key: EntityAnimationEventKey) {
		switch (key) {
			case EntityAnimationEventKey.SLIDE_START:
				if (this.slideAudioBundle) {
					this.slideAudioBundle.spacialPosition = this.entity.model.transform.position;
					this.slideAudioBundle.Stop();
					this.slideAudioBundle.PlayNext();
				}
				break;
			case EntityAnimationEventKey.SLIDE_END:
				this.slideAudioBundle?.Stop(1);
				break;
			case EntityAnimationEventKey.JUMP:
				// if (this.entityRef.jumpSound) {
				// 	if (this.entity.IsLocalCharacter()) {
				// 		AudioManager.PlayClipGlobal(this.entityRef.jumpSound, {
				// 			volumeScale: 0.2,
				// 		});
				// 	} else {
				// 		AudioManager.PlayClipAtPosition(
				// 			this.entityRef.jumpSound,
				// 			this.entity.model.transform.position,
				// 			{
				// 				volumeScale: 0.2,
				// 			},
				// 		);
				// 	}
				// }
				break;
			case EntityAnimationEventKey.LAND:
				this.PlayFootstepSound(1.4);
				// if (this.entityRef.landSound) {
				// 	if (this.entity.IsLocalCharacter()) {
				// 		AudioManager.PlayClipGlobal(this.entityRef.landSound, {
				// 			volumeScale: 0.2,
				// 		});
				// 	} else {
				// 		AudioManager.PlayClipAtPosition(
				// 			this.entityRef.landSound,
				// 			this.entity.model.transform.position,
				// 			{
				// 				volumeScale: 0.2,
				// 			},
				// 		);
				// 	}
				// }
				break;
		}
	}

	public IsFirstPerson(): boolean {
		return this.isFirstPerson;
	}

	public SetPlaybackSpeed(newSpeed: number) {
		AnimancerBridge.SetGlobalSpeed(this.anim, newSpeed);
	}
}
