﻿import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { ViewmodelController } from "Client/Controllers/Viewmodel/ViewmodelController";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { AudioBundleSpacialMode, AudioClipBundle } from "Shared/Audio/AudioClipBundle";
import Character from "Shared/Character/Character";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemDef } from "Shared/Item/ItemDefinitionTypes";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import StringUtils from "Shared/Types/StringUtil";
import { Bin } from "Shared/Util/Bin";
import { BundleReferenceManager } from "Shared/Util/BundleReferenceManager";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { BundleGroupNames, Bundle_Entity, Bundle_Entity_OnHit } from "Shared/Util/ReferenceManagerResources";
import { RunUtil } from "Shared/Util/RunUtil";
import { Task } from "Shared/Util/Task";
import { CharacterAnimationLayer } from "./CharacterAnimationLayer";

export enum ItemAnimationId {
	IDLE = "Idle",
	EQUIP = "Equip",
	UN_EQUIP = "UnEquip",
	USE = "Use",
}

export enum ItemPlayMode {
	DEFAULT,
	LOOP,
	HOLD,
}

const EMPTY_ANIM = AssetCache.LoadAsset<AnimationClip>(
	"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/Airship_Empty.anim",
);
const DEFAULT_USE_FP = AssetCache.LoadAsset<AnimationClip>(
	"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Sword_Use.anim",
);
const BLOCK_IDLE_FP = AssetCache.LoadAsset<AnimationClip>(
	"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Block_Idle.anim",
);
const BLOCK_USE_FP = AssetCache.LoadAsset<AnimationClip>(
	"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Block_Place.anim",
);

export class CharacterAnimator {
	private worldmodelClips: Map<ItemAnimationId, AnimationClip[]> = new Map();
	private viewmodelClips: Map<ItemAnimationId, AnimationClip[]> = new Map();
	private currentItemMeta: ItemDef | undefined;
	private currentItemState: string = ItemAnimationId.IDLE;
	private currentEndEventConnection = -1;

	private defaultIdleAnimFP = AssetCache.LoadAsset<AnimationClip>(
		"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Generic_Idle.anim",
	);
	private defaultIdleAnimFPUnarmed = AssetCache.LoadAsset<AnimationClip>(
		"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/Airship_Empty.anim",
	);
	private defaultIdleAnimTP = AssetCache.LoadAsset<AnimationClip>(
		"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/Airship_Empty.anim",
	);

	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly worldmodelAnimancerComponent: AnimancerComponent;
	public readonly defaultTransitionTime: number = 0.15;

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

	protected viewModelEnabled = false;

	private footstepAudioBundle: AudioClipBundle | undefined;
	private slideAudioBundle: AudioClipBundle | undefined;
	private steppedOnBlockType = 0;
	private lastFootstepSoundTime = 0;
	private deathVfx?: GameObject;

	public baseFootstepVolumeScale = 0.1;

	private itemAnimStates: AnimancerState[] = [];

	//private camera: Camera;

	public constructor(public readonly character: Character) {
		const animator = character.movement.animator;
		this.worldmodelAnimancerComponent = animator.worldmodelAnimancer;
		this.isFlashing = false;
		this.viewModelEnabled = this.character.IsLocalCharacter();

		//AUDIO
		if (RunUtil.IsClient()) {
			this.footstepAudioBundle = new AudioClipBundle([]);
			this.footstepAudioBundle.volumeScale = this.baseFootstepVolumeScale;
			this.footstepAudioBundle.soundOptions.maxDistance = 15;
			this.footstepAudioBundle.spacialMode = character.IsLocalCharacter()
				? AudioBundleSpacialMode.GLOBAL
				: AudioBundleSpacialMode.SPACIAL;

			// this.slideAudioBundle = new AudioClipBundle(this.refs.slideSoundPaths);
			// this.slideAudioBundle.volumeScale = 0.2;
			// this.slideAudioBundle.useFullPath = true;
			// this.slideAudioBundle.playMode = AudioBundlePlayMode.RANDOM_TO_LOOP;
			// this.slideAudioBundle.spacialMode = character.IsLocalCharacter()
			// 	? AudioBundleSpacialMode.GLOBAL
			// 	: AudioBundleSpacialMode.SPACIAL;

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
		// const animConn = this.refs.animationEvents.OnEntityAnimationEvent((data) => {
		// 	// if (data !== 0) {
		// 	// 	print("Animation Event: " + data + " On Entity: " + this.entity.id);
		// 	// }
		// 	this.OnAnimationEvent(data);
		// });
		// this.bin.Add(() => {
		// 	Bridge.DisconnectEvent(animConn);
		// });

		// todo: is this needed?
		this.character.gameObject.SetActive(true);
	}

	private Log(message: string) {
		return;
		print("Animator " + this.character.id + ": " + message);
	}

	public SetFirstPerson(isFirstPerson: boolean) {
		this.isFirstPerson = isFirstPerson;

		this.ClearItemAnimations();
		if (RunUtil.IsClient()) {
			// this.viewmodelAnimancerComponent.enabled = isFirstPerson;
		}
		// this.worldmodelAnimancerComponent.enabled = !isFirstPerson;

		this.character.animationHelper.SetFirstPerson(isFirstPerson);
		this.LoadNewItemResources(this.currentItemMeta);
		this.StartItemIdleAnim(true);
	}

	public PlayTakeDamage(position: Vector3, characterModel: GameObject | undefined) {
		const isFirstPerson =
			RunUtil.IsClient() &&
			this.character.IsLocalCharacter() &&
			Dependency<LocalEntityController>().IsFirstPerson();

		this.PlayDamageFlash();

		//Animate flinch
		const flinchClip = isFirstPerson ? this.flinchClipFPS : this.flinchClipTP;
		if (flinchClip) {
			this.PlayItemAnimationInWorldmodel(flinchClip, CharacterAnimationLayer.LAYER_2, undefined, {
				fadeInDuration: 0.01,
			});
			if (this.IsViewModelEnabled()) {
				this.PlayItemAnimationInViewmodel(flinchClip, CharacterAnimationLayer.LAYER_2, undefined, {
					fadeInDuration: 0.01,
				});
			}
		}

		//Don't render some effects if we are in first person
		if (isFirstPerson) {
			return;
		}

		//Play specific effects for different damage types like fire attacks or magic damage
		let vfxTemplate = this.damageEffectTemplate;
		if (vfxTemplate) {
			const go = EffectsManager.SpawnGameObjectAtPosition(vfxTemplate, position, undefined, 2);
			if (characterModel) {
				go.transform.SetParent(characterModel.transform);
			}
		}
	}

	public PlayItemAnimationInWorldmodel(
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
	): AnimancerState | undefined {
		if (this.character.IsLocalCharacter() && this.isFirstPerson) return undefined;

		let animState: AnimancerState;
		if ((config?.autoFadeOut === undefined || config?.autoFadeOut) && !clip.isLooping) {
			//Play once then fade away
			animState = AnimancerBridge.PlayOnceOnLayer(
				this.worldmodelAnimancerComponent,
				clip,
				layer,
				config?.fadeInDuration ?? this.defaultTransitionTime,
				config?.fadeOutDuration ?? this.defaultTransitionTime,
				config?.fadeMode ?? FadeMode.FromStart,
				config?.wrapMode ?? WrapMode.Default,
			);
		} else {
			//Play permenantly on player
			animState = AnimancerBridge.PlayOnLayer(
				this.worldmodelAnimancerComponent,
				clip,
				layer,
				config?.fadeInDuration ?? this.defaultTransitionTime,
				config?.fadeMode ?? FadeMode.FromStart,
				config?.wrapMode ?? WrapMode.Default,
			);
		}

		if (onEnd !== undefined) {
			this.currentEndEventConnection = animState.Events.OnEndTS(() => {
				Bridge.DisconnectEvent(this.currentEndEventConnection);
				onEnd();
			});
		}
		this.itemAnimStates.push(animState);
		return animState;
	}

	public PlayItemAnimationInViewmodel(
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
	): AnimancerState | undefined {
		if (!RunUtil.IsClient()) {
			return error("Tried to play viewmodel animation on server.");
		}
		if (!this.isFirstPerson) return undefined;

		let animState: AnimancerState;
		if ((config?.autoFadeOut === undefined || config?.autoFadeOut) && !clip.isLooping) {
			//Play once then fade away
			animState = AnimancerBridge.PlayOnceOnLayer(
				Dependency<ViewmodelController>().animancer,
				clip,
				layer,
				config?.fadeInDuration ?? this.defaultTransitionTime,
				config?.fadeOutDuration ?? this.defaultTransitionTime,
				config?.fadeMode ?? FadeMode.FromStart,
				config?.wrapMode ?? WrapMode.Default,
			);
		} else {
			//Play permenantly on player
			animState = AnimancerBridge.PlayOnLayer(
				Dependency<ViewmodelController>().animancer,
				clip,
				layer,
				config?.fadeInDuration ?? this.defaultTransitionTime,
				config?.fadeMode ?? FadeMode.FromStart,
				config?.wrapMode ?? WrapMode.Default,
			);
		}

		if (onEnd !== undefined) {
			this.currentEndEventConnection = animState.Events.OnEndTS(() => {
				Bridge.DisconnectEvent(this.currentEndEventConnection);
				onEnd();
			});
		}
		this.itemAnimStates.push(animState);
		return animState;
	}

	public ClearItemAnimations(): void {
		for (let animState of this.itemAnimStates) {
			if (animState.IsValid && animState.IsPlaying) {
				animState.StartFade(0, 0.15);
			}
		}
		this.itemAnimStates.clear();
	}

	private LoadNewItemResources(itemMeta: ItemDef | undefined) {
		this.Log("Loading Item: " + itemMeta?.itemType);
		this.currentItemMeta = itemMeta;
		// this.itemLayer.DestroyStates();
		//Load the animation clips for the new item

		this.ClearItemAnimations();

		this.worldmodelClips.clear();
		this.viewmodelClips.clear();

		if (itemMeta) {
			/***** Viewmodel ******/
			if (itemMeta.holdConfig?.viewmodel?.equipAnim) {
				this.viewmodelClips.set(
					ItemAnimationId.EQUIP,
					itemMeta.holdConfig.viewmodel?.equipAnim.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					}),
				);
			}
			if (itemMeta.holdConfig?.viewmodel?.idleAnim) {
				this.viewmodelClips.set(
					ItemAnimationId.IDLE,
					itemMeta.holdConfig.viewmodel?.idleAnim.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					}),
				);
			} else if (itemMeta.block) {
				this.viewmodelClips.set(ItemAnimationId.IDLE, [BLOCK_IDLE_FP]);
			}

			if (itemMeta.usable?.onUseAnimViewmodel) {
				this.viewmodelClips.set(
					ItemAnimationId.USE,
					itemMeta.usable.onUseAnimViewmodel.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					}),
				);
			} else if (itemMeta.block) {
				this.viewmodelClips.set(ItemAnimationId.USE, [BLOCK_USE_FP]);
			}

			/***** Worldmodel ******/
			if (itemMeta.holdConfig?.worldmodel?.equipAnim) {
				let clips = itemMeta.holdConfig.worldmodel?.equipAnim.mapFiltered((s) => {
					const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
					if (clip) return clip;
				});
				if (clips.size() > 0) {
					this.worldmodelClips.set(ItemAnimationId.EQUIP, clips);
				}
			}
			if (itemMeta.holdConfig?.worldmodel?.idleAnim) {
				let clips = itemMeta.holdConfig.worldmodel?.idleAnim.mapFiltered((s) => {
					const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
					if (clip) return clip;
				});
				if (clips.size() > 0) {
					this.worldmodelClips.set(ItemAnimationId.IDLE, clips);
				}
			}
			if (itemMeta.usable?.onUseAnimWorldmodel) {
				let clips = itemMeta.usable.onUseAnimWorldmodel.mapFiltered((s) => {
					const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
					if (clip) return clip;
				});
				if (clips.size() > 0) {
					this.worldmodelClips.set(ItemAnimationId.USE, clips);
				}
			}
		} else {
			//UNARMED
			this.viewmodelClips.set(ItemAnimationId.IDLE, [this.defaultIdleAnimFPUnarmed]);
		}
	}

	//When certain conditions are met, the items may want to play their own synced animations
	//This was used in testing to sync that
	//private HumanoidItemAnimEventData eventData = new ();
	private TriggerEvent(key: ItemAnimationId, index = 0) {
		this.Log("Trigger State: " + key + " index: " + index);
		this.currentItemState = key;
		/*eventData.eventKey = key;
		eventData.eventIndex = index;
		currentItem.OnAnimEvent(eventData);*/
	}

	public EquipItem(itemMeta: ItemDef | undefined) {
		this.LoadNewItemResources(itemMeta);
		this.StartItemIdleAnim(false);
	}

	public StartItemIdleAnim(instantTransition: boolean) {
		this.TriggerEvent(ItemAnimationId.IDLE);

		// if (this.currentItemMeta === undefined) {
		// 	this.PlayClip(EMPTY_ANIM);
		// 	return;
		// }

		if (this.IsViewModelEnabled()) {
			let clips = this.viewmodelClips.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimFP];
			const clip = RandomUtil.FromArray(clips);
			this.PlayItemAnimationInViewmodel(clip, CharacterAnimationLayer.LAYER_1, undefined, {
				fadeInDuration: instantTransition ? 0 : this.defaultTransitionTime,
			});
			// AnimancerBridge.GetLayer(this.viewmodelAnimancer, EntityAnimationLayer.LAYER_2).StartFade(0, 0.05);
		}
		let clips = this.worldmodelClips.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimTP];
		const clip = RandomUtil.FromArray(clips);
		this.PlayItemAnimationInWorldmodel(clip, CharacterAnimationLayer.LAYER_1, undefined, {
			fadeInDuration: instantTransition ? 0 : this.defaultTransitionTime,
		});
		// AnimancerBridge.GetLayer(this.worldmodelAnimancer, EntityAnimationLayer.LAYER_2).StartFade(0, 0.05);
	}

	public PlayItemUseAnim(
		useIndex = 0,
		config?: {
			fadeMode?: FadeMode;
			wrapMode?: WrapMode;
			fadeInDuration?: number;
			fadeOutDuration?: number;
			autoFadeOut?: boolean;
		},
	) {
		this.Log("Item Use Started: " + useIndex);
		this.TriggerEvent(ItemAnimationId.USE, useIndex);

		if (this.IsViewModelEnabled()) {
			let clips: AnimationClip[] | undefined = this.viewmodelClips.get(ItemAnimationId.USE);
			if (!clips || clips.isEmpty() || useIndex >= clips.size()) {
				this.StartItemIdleAnim(false);
				return;
			}
			this.PlayItemAnimationInViewmodel(clips[useIndex], CharacterAnimationLayer.LAYER_2, undefined, config);
		}

		let clips: AnimationClip[] | undefined = this.worldmodelClips.get(ItemAnimationId.USE);
		if (!clips || clips.isEmpty() || useIndex >= clips.size()) {
			this.StartItemIdleAnim(false);
			return;
		}
		this.PlayItemAnimationInWorldmodel(clips[useIndex], CharacterAnimationLayer.LAYER_2, undefined, config);
	}

	public PlayRandomItemUseAnim(config?: {
		fadeMode?: FadeMode;
		wrapMode?: WrapMode;
		transitionTime?: number;
		autoFadeOut?: boolean;
	}) {
		this.Log("Random Item Use Started");
		//In the animation array use animations are the 3rd index and beyond;

		if (this.IsViewModelEnabled()) {
			let clips = this.viewmodelClips.get(ItemAnimationId.USE);
			if (clips && clips.size() > 0) {
				this.PlayItemAnimationInViewmodel(
					RandomUtil.FromArray(clips),
					CharacterAnimationLayer.LAYER_2,
					undefined,
					config,
				);
			}
		}
		let clips: AnimationClip[] | undefined = this.worldmodelClips.get(ItemAnimationId.USE);
		if (clips && clips.size() > 0) {
			const clip = RandomUtil.FromArray(clips);
			this.PlayItemAnimationInWorldmodel(clip, CharacterAnimationLayer.LAYER_2, undefined, config);
		}
	}

	public PlayDeath() {
		//Play death animation
		let isFirstPerson = false;
		if (this.character.IsLocalCharacter()) {
			const localController = Dependency<LocalEntityController>();
			isFirstPerson = localController.IsFirstPerson();
			//Always play death animation in third person
			// localController.ForceFirstPersonMode(false);
			//Lock Inputs
			this.character.movement.disableInput = true;
		}
		const deathClip = this.deathClipTP; // isFirstPerson ? this.deathClipFPS : this.deathClipTP;
		if (deathClip) {
			this.PlayItemAnimationInWorldmodel(deathClip, CharacterAnimationLayer.LAYER_3);
		}
		//Spawn death particle
		// const inVoid = damageType === DamageType.VOID;
		let deathEffect = this.deathEffectTemplate;
		// if (inVoid && this.character.IsLocalCharacter()) {
		// 	deathEffect = undefined;
		// }
		if (deathEffect) {
			this.deathVfx = EffectsManager.SpawnGameObjectAtPosition(
				deathEffect,
				this.character.headBone.transform.position,
				undefined,
			);
			// if (!inVoid) {
			this.deathVfx.transform.SetParent(this.character.gameObject.transform);
			// }
		}

		Task.Delay(0.5, () => {
			this.character.gameObject.SetActive(false);
		});
	}

	private PlayDamageFlash() {
		if (this.character.IsDestroyed() || this.isFlashing) return;
		let allMeshes = this.character.accessoryBuilder.GetAllAccessoryMeshes();
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
		// if (this.character.) return;
		// let allMeshes = ArrayUtil.Combine(
		// 	CSArrayUtil.Convert(this.character.accessoryBuilder.GetAccessoryMeshes(AccessorySlot.Root)),
		// 	this.refs.meshes,
		// );
		// //TODO: Material property block AddColor doesn't seem to be working???
		// /* const propertyBlock: MaterialPropertyBlock = Bridge.MakeMaterialPropertyBlock();
		// propertyBlock.AddFloat("_RimPower", power);
		// propertyBlock.AddFloat("_RimIntensity", strength);
		// propertyBlock.AddColor("_RimColor", color); */
		// allMeshes.forEach((renderer) => {
		// 	if (renderer && renderer.enabled) {
		// 		const materials = renderer.materials;
		// 		for (let i = 0; i < materials.Length; i++) {
		// 			const mat = materials.GetValue(i);
		// 			mat.EnableKeyword("RIM_LIGHT_ON");
		// 			mat.SetColor("_RimColor", color);
		// 			mat.SetFloat("_RimPower", power);
		// 			mat.SetFloat("_RimIntensity", strength);
		// 			//renderer.SetPropertyBlock(propertyBlock);
		// 		}
		// 	}
		// });
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
		const blockId = this.character.movement.groundedBlockId;
		if (blockId === 0) return;

		if (!cameraPos) {
			cameraPos = Camera.main.transform.position;
		}
		if (cameraPos.sub(this.character.model.transform.position).magnitude > 20) {
			return;
		}

		// Finished checks. We are playing.
		this.lastFootstepSoundTime = os.clock();

		let itemType = ItemUtil.GetItemTypeFromBlockId(blockId);
		if (!itemType) {
			itemType = ItemType.STONE;
		}

		const itemMeta = ItemUtil.GetItemDef(itemType);

		// fallback to stone sounds.
		let stepSounds = itemMeta.block?.stepSound ?? ItemUtil.GetItemDef(ItemType.STONE).block?.stepSound;
		if (stepSounds === undefined) {
			stepSounds = [];
		}

		if (stepSounds.size() > 0 && this.footstepAudioBundle) {
			let soundPath = RandomUtil.FromArray(stepSounds);
			if (!StringUtils.includes(soundPath, ".")) {
				soundPath += ".ogg";
			}
			// let audioClip = AssetCache.LoadAsset<AudioClip>(soundPath);
			// let volume = this.baseFootstepVolumeScale * volumeScale;
			// this.refs.footstepAudioSource.PlayOneShot(audioClip, volume);
		}
	}

	private OnAnimationEvent(key: EntityAnimationEventKey) {
		switch (key) {
			case EntityAnimationEventKey.SLIDE_START:
				if (this.slideAudioBundle) {
					this.slideAudioBundle.spacialPosition = this.character.model.transform.position;
					this.slideAudioBundle.Stop();
					this.slideAudioBundle.PlayNext();
				}
				break;
			case EntityAnimationEventKey.SLIDE_END:
				this.slideAudioBundle?.Stop(1);
				break;
			case EntityAnimationEventKey.JUMP:
				// if (this.refs.jumpSound) {
				// 	if (this.character.IsLocalCharacter()) {
				// 		AudioManager.PlayClipGlobal(this.refs.jumpSound, {
				// 			volumeScale: 0.2,
				// 		});
				// 	} else {
				// 		AudioManager.PlayClipAtPosition(this.refs.jumpSound, this.character.model.transform.position, {
				// 			volumeScale: 0.2,
				// 		});
				// 	}
				// }
				break;
			case EntityAnimationEventKey.LAND:
				this.PlayFootstepSound(1.4);
				// if (this.refs.landSound) {
				// 	if (this.character.IsLocalCharacter()) {
				// 		AudioManager.PlayClipGlobal(this.refs.landSound, {
				// 			volumeScale: 0.2,
				// 		});
				// 	} else {
				// 		AudioManager.PlayClipAtPosition(this.refs.landSound, this.character.model.transform.position, {
				// 			volumeScale: 0.2,
				// 		});
				// 	}
				// }
				break;
		}
	}

	public IsFirstPerson(): boolean {
		return this.isFirstPerson;
	}

	public SetPlaybackSpeed(newSpeed: number) {
		AnimancerBridge.SetGlobalSpeed(this.worldmodelAnimancerComponent, newSpeed);
	}

	public IsViewModelEnabled(): boolean {
		return this.viewModelEnabled;
	}

	public Destroy(): void {
		if (this.deathVfx) {
			//TODO Move the transform off this entity so the effect can keep playing even after the body is gone
			EffectsManager.ReleaseGameObject(this.deathVfx);
		}
		this.bin.Clean();
	}
}
