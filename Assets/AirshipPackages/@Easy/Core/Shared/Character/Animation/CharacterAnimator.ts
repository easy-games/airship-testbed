﻿import { AudioBundleSpacialMode, AudioClipBundle } from "@Easy/Core/Shared/Audio/AudioClipBundle";
import Character from "@Easy/Core/Shared/Character/Character";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import StringUtils from "@Easy/Core/Shared/Types/StringUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { AirshipCharacterCameraSingleton } from "../../Camera/AirshipCharacterCameraSingleton";
import { ItemDef } from "../../Item/ItemDefinitionTypes";
import { CharacterAnimationLayer } from "./CharacterAnimationLayer";
import { Game } from "../../Game";

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

export default class CharacterAnimator extends AirshipBehaviour {
	@Header("References")
	public character!: Character;
	public flinchClip?: AnimationClip;
	public flinchClipViewModel?: AnimationClip;

	@Header("Variables")
	public baseFootstepVolumeScale = 0.1;

	private worldmodelClips: Map<ItemAnimationId, AnimationClip[]> = new Map();
	private viewmodelClips: Map<ItemAnimationId, AnimationClip[]> = new Map();
	private currentItemMeta: ItemDef | undefined;
	private currentItemState: string = ItemAnimationId.IDLE;
	private currentEndEventConnection = -1;

	private readonly flashTransitionDuration = 0.035;
	private readonly flashOnTime = 0.07;
	public readonly defaultTransitionTime: number = 0.15;

	protected bin = new Bin();
	private deathClipFPS?: AnimationClip;
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

	private itemAnimStates: AnimancerState[] = [];

	public Start() {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
		this.isFlashing = false;

		if (Game.IsClient()) {
			//AUDIO
			this.footstepAudioBundle = new AudioClipBundle([]);
			this.footstepAudioBundle.volumeScale = this.baseFootstepVolumeScale;
			this.footstepAudioBundle.soundOptions.maxDistance = 15;
			this.footstepAudioBundle.spacialMode = this.character.IsLocalCharacter()
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
			this.bin.Add(this.character.onHealthChanged.Connect((newHealth, oldHealth)=>{
				if(newHealth < oldHealth){
					this.PlayTakeDamage();
				}
			}));

			//VFX
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
		this.gameObject.SetActive(true);
	}

	public SetViewModelEnabled(enabled: boolean): void {
		this.viewModelEnabled = enabled;
	}

	private Log(message: string) {
		// return;
		// print("Animator " + this.character.id + ": " + message);
	}

	public SetFirstPerson(isFirstPerson: boolean) {
		this.isFirstPerson = isFirstPerson;

		this.ClearItemAnimations();
		if (Game.IsClient()) {
			// this.viewmodelAnimancerComponent.enabled = isFirstPerson;
		}
		// this.worldmodelAnimancerComponent.enabled = !isFirstPerson;

		this.character.animationHelper.SetFirstPerson(isFirstPerson);
		this.LoadNewItemResources(this.currentItemMeta);
		this.StartItemIdleAnim(true);
	}

	public PlayTakeDamage() {
		const isFirstPerson =
			Game.IsClient() &&
			this.character.IsLocalCharacter() &&
			Dependency<AirshipCharacterCameraSingleton>().IsFirstPerson();

		//this.PlayDamageFlash();

		//Animate flinch
		let foundFlinchClip = this.isFirstPerson ? this.flinchClipViewModel : this.flinchClip;
		if(foundFlinchClip){
			this.character.animationHelper.PlayOneShotSimple(foundFlinchClip);
		}

		//Don't render some effects if we are in first person
		if (isFirstPerson) {
			return;
		}
	}

	public PlayItemAnimationInWorldmodel(
		clip: AnimationClip,
		layer: CharacterAnimationLayer = CharacterAnimationLayer.LAYER_1,
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

		// let animState: AnimancerState;
		// if ((config?.autoFadeOut === undefined || config?.autoFadeOut) && !clip.isLooping) {
		// 	//Play once then fade away
		// 	animState = AnimancerBridge.PlayOnceOnLayer(
		// 		this.worldmodelAnimancerComponent,
		// 		clip,
		// 		layer,
		// 		config?.fadeInDuration ?? this.defaultTransitionTime,
		// 		config?.fadeOutDuration ?? this.defaultTransitionTime,
		// 		config?.fadeMode ?? FadeMode.FromStart,
		// 		config?.wrapMode ?? WrapMode.Default,
		// 	);
		// } else {
		// 	//Play permenantly on player
		// 	animState = AnimancerBridge.PlayOnLayer(
		// 		this.worldmodelAnimancerComponent,
		// 		clip,
		// 		layer,
		// 		config?.fadeInDuration ?? this.defaultTransitionTime,
		// 		config?.fadeMode ?? FadeMode.FromStart,
		// 		config?.wrapMode ?? WrapMode.Default,
		// 	);
		// }

		// if (onEnd !== undefined) {
		// 	this.currentEndEventConnection = animState.Events.OnEndTS(() => {
		// 		Bridge.DisconnectEvent(this.currentEndEventConnection);
		// 		onEnd();
		// 	});
		// }
		// this.itemAnimStates.push(animState);
		// return animState;
		return undefined;
	}

	public PlayItemAnimationInViewmodel(
		clip: AnimationClip,
		layer: CharacterAnimationLayer = CharacterAnimationLayer.LAYER_1,
		onEnd?: Callback,
		config?: {
			fadeMode?: FadeMode;
			wrapMode?: WrapMode;
			fadeInDuration?: number;
			fadeOutDuration?: number;
			autoFadeOut?: boolean;
		},
	): AnimancerState | undefined {
		// if (!Game.IsClient()) {
		// 	return error("Tried to play viewmodel animation on server.");
		// }
		// assert(clip, "PlayItemAnimationInViewmodel failed: AnimationClip is undefined");
		// if (!this.isFirstPerson) return undefined;

		// let animState: AnimancerState;
		// if ((config?.autoFadeOut === undefined || config?.autoFadeOut) && !clip.isLooping) {
		// 	//Play once then fade away
		// 	animState = AnimancerBridge.PlayOnceOnLayer(
		// 		CameraReferences.viewmodel!.animancer,
		// 		clip,
		// 		layer,
		// 		config?.fadeInDuration ?? this.defaultTransitionTime,
		// 		config?.fadeOutDuration ?? this.defaultTransitionTime,
		// 		config?.fadeMode ?? FadeMode.FromStart,
		// 		config?.wrapMode ?? WrapMode.Default,
		// 	);
		// } else {
		// 	//Play permenantly on player
		// 	animState = AnimancerBridge.PlayOnLayer(
		// 		CameraReferences.viewmodel!.animancer,
		// 		clip,
		// 		layer,
		// 		config?.fadeInDuration ?? this.defaultTransitionTime,
		// 		config?.fadeMode ?? FadeMode.FromStart,
		// 		config?.wrapMode ?? WrapMode.Default,
		// 	);
		// }

		// if (onEnd !== undefined) {
		// 	this.currentEndEventConnection = animState.Events.OnEndTS(() => {
		// 		Bridge.DisconnectEvent(this.currentEndEventConnection);
		// 		onEnd();
		// 	});
		// }
		// this.itemAnimStates.push(animState);
		// return animState;
		return undefined;
	}

	public ClearItemAnimations(): void {
		for (let animState of this.itemAnimStates) {
			if (animState.IsValid && animState.IsPlaying) {
				animState.StartFade(0, 0.15);
			}
		}
		this.itemAnimStates.clear();
	}

	private LoadNewItemResources(itemDef: ItemDef | undefined) {
		this.Log("Loading Item: " + itemDef?.itemType);
		this.currentItemMeta = itemDef;
		// this.itemLayer.DestroyStates();
		//Load the animation clips for the new item

		// this.ClearItemAnimations();

		// this.worldmodelClips.clear();
		// this.viewmodelClips.clear();

		// if (itemDef) {
		// 	/***** Viewmodel ******/
		// 	if (itemDef.holdConfig?.viewmodel?.equipAnim) {
		// 		const equipAnims = itemDef.holdConfig.viewmodel?.equipAnim.mapFiltered((s) => {
		// 			const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
		// 			if (clip) {
		// 				return clip;
		// 			} else {
		// 				warn(`Couldn't find animation asset for ${itemDef.displayName}: ${s}`);
		// 			}
		// 		});

		// 		if (equipAnims.size() > 0) {
		// 			this.viewmodelClips.set(ItemAnimationId.EQUIP, equipAnims);
		// 		}
		// 	}
		// 	if (itemDef.holdConfig?.viewmodel?.idleAnim) {
		// 		const idleAnims = itemDef.holdConfig.viewmodel?.idleAnim.mapFiltered((s) => {
		// 			const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
		// 			if (clip) {
		// 				return clip;
		// 			} else {
		// 				warn(`Couldn't find animation asset for ${itemDef.displayName}: ${s}`);
		// 			}
		// 		});

		// 		if (idleAnims.size() > 0) {
		// 			this.viewmodelClips.set(ItemAnimationId.IDLE, idleAnims);
		// 		}
		// 	}
		// 	// else if (itemDef.block) {
		// 	// 	this.viewmodelClips.set(ItemAnimationId.IDLE, [BLOCK_IDLE_FP]);
		// 	// }

		// 	if (itemDef.usable?.onUseAnimViewmodel) {
		// 		const useAnims = itemDef.usable.onUseAnimViewmodel.mapFiltered((s) => {
		// 			const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
		// 			if (clip) {
		// 				return clip;
		// 			} else {
		// 				warn(`Couldn't find animation asset for ${itemDef.displayName}: ${s}`);
		// 			}
		// 		});

		// 		if (useAnims.size() > 0) {
		// 			this.viewmodelClips.set(ItemAnimationId.USE, useAnims);
		// 		}
		// 	}
		// 	// else if (itemDef.block) {
		// 	// 	this.viewmodelClips.set(ItemAnimationId.USE, [BLOCK_USE_FP]);
		// 	// }

		// 	/***** Worldmodel ******/
		// 	if (itemDef.holdConfig?.worldmodel?.equipAnim) {
		// 		let clips = itemDef.holdConfig.worldmodel?.equipAnim.mapFiltered((s) => {
		// 			const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
		// 			if (clip) return clip;
		// 			else warn(`Couldn't find animation asset for ${itemDef.displayName}: ${s}`);
		// 		});
		// 		if (clips.size() > 0) {
		// 			this.worldmodelClips.set(ItemAnimationId.EQUIP, clips);
		// 		}
		// 	}
		// 	if (itemDef.holdConfig?.worldmodel?.idleAnim) {
		// 		let clips = itemDef.holdConfig.worldmodel?.idleAnim.mapFiltered((s) => {
		// 			const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
		// 			if (clip) return clip;
		// 			else warn(`Couldn't find animation asset for ${itemDef.displayName}: ${s}`);
		// 		});
		// 		if (clips.size() > 0) {
		// 			this.worldmodelClips.set(ItemAnimationId.IDLE, clips);
		// 		}
		// 	}
		// 	if (itemDef.usable?.onUseAnimWorldmodel) {
		// 		let clips = itemDef.usable.onUseAnimWorldmodel.mapFiltered((s) => {
		// 			const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
		// 			if (clip) return clip;
		// 			else warn(`Couldn't find animation asset for ${itemDef.displayName}: ${s}`);
		// 		});
		// 		if (clips.size() > 0) {
		// 			this.worldmodelClips.set(ItemAnimationId.USE, clips);
		// 		}
		// 	}
		// } else {
		// 	//UNARMED
		// 	this.viewmodelClips.set(ItemAnimationId.IDLE, [this.defaultIdleAnimFPUnarmed]);
		// }
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

	public EquipItem(itemDef: ItemDef | undefined) {
		this.Log("Equip: " + itemDef?.displayName);
		this.LoadNewItemResources(itemDef);
		this.StartItemIdleAnim(false);
	}

	public StartItemIdleAnim(instantTransition: boolean) {
		this.TriggerEvent(ItemAnimationId.IDLE);

		// if (this.currentItemMeta === undefined) {
		// 	this.PlayClip(EMPTY_ANIM);
		// 	return;
		// }

		// if (this.IsViewModelEnabled()) {
		// 	let clips = this.viewmodelClips.get(ItemAnimationId.IDLE) ?? [
		// 		this.currentItemMeta !== undefined ? this.defaultIdleItemAnimFP : this.defaultIdleEmptyAnimFP,
		// 	];
		// 	const clip = RandomUtil.FromArray(clips);
		// 	this.PlayItemAnimationInViewmodel(clip, CharacterAnimationLayer.LAYER_1, undefined, {
		// 		fadeInDuration: instantTransition ? 0 : this.defaultTransitionTime,
		// 	});
		// 	// AnimancerBridge.GetLayer(
		// 	// 	Dependency<ViewmodelController>().animancer,
		// 	// 	CharacterAnimationLayer.LAYER_2,
		// 	// ).StartFade(0, 0.05);
		// }
		// let clips = this.worldmodelClips.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimTP];
		// const clip = RandomUtil.FromArray(clips);
		// this.PlayItemAnimationInWorldmodel(clip, CharacterAnimationLayer.LAYER_1, undefined, {
		// 	fadeInDuration: instantTransition ? 0 : this.defaultTransitionTime,
		// });
		// AnimancerBridge.GetLayer(this.worldmodelAnimancerComponent, CharacterAnimationLayer.LAYER_2).StartFade(0, 0.05);
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

		// if (this.IsViewModelEnabled()) {
		// 	let clips: AnimationClip[] | undefined = this.viewmodelClips.get(ItemAnimationId.USE);
		// 	if (!clips || clips.isEmpty() || useIndex >= clips.size()) {
		// 		this.StartItemIdleAnim(false);
		// 		return;
		// 	}
		// 	this.PlayItemAnimationInViewmodel(clips[useIndex], CharacterAnimationLayer.LAYER_2, undefined, config);
		// }

		// let clips: AnimationClip[] | undefined = this.worldmodelClips.get(ItemAnimationId.USE);
		// if (!clips || clips.isEmpty() || useIndex >= clips.size()) {
		// 	this.StartItemIdleAnim(false);
		// 	return;
		// }
		// this.PlayItemAnimationInWorldmodel(clips[useIndex], CharacterAnimationLayer.LAYER_2, undefined, config);
	}

	public PlayRandomItemUseAnim(config?: {
		fadeMode?: FadeMode;
		wrapMode?: WrapMode;
		transitionTime?: number;
		autoFadeOut?: boolean;
	}) {
		this.Log("Random Item Use Started");
		//In the animation array use animations are the 3rd index and beyond;

		// if (this.IsViewModelEnabled()) {
		// 	let clips = this.viewmodelClips.get(ItemAnimationId.USE);
		// 	if (clips && clips.size() > 0) {
		// 		this.PlayItemAnimationInViewmodel(
		// 			RandomUtil.FromArray(clips),
		// 			CharacterAnimationLayer.LAYER_2,
		// 			undefined,
		// 			config,
		// 		);
		// 	}
		// }
		// let clips: AnimationClip[] | undefined = this.worldmodelClips.get(ItemAnimationId.USE);
		// if (clips && clips.size() > 0) {
		// 	const clip = RandomUtil.FromArray(clips);
		// 	this.PlayItemAnimationInWorldmodel(clip, CharacterAnimationLayer.LAYER_2, undefined, config);
		// }
	}

	public PlayDeath() {
		//Play death animation
		let isFirstPerson = false;
		if (this.character.IsLocalCharacter()) {
			const cameraSingleton = Dependency<AirshipCharacterCameraSingleton>();
			isFirstPerson = cameraSingleton.IsFirstPerson();
			//Always play death animation in third person
			// localController.ForceFirstPersonMode(false);
			//Lock Inputs
			this.character.movement.disableInput = true;
		}
		const deathClip = this.deathClipTP; // isFirstPerson ? this.deathClipFPS : this.deathClipTP;
		if (deathClip) {
			this.PlayItemAnimationInWorldmodel(deathClip, CharacterAnimationLayer.LAYER_3);
		}
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
			itemType = CoreItemType.STONE;
		}

		const itemMeta = ItemUtil.GetItemDef(itemType);

		// fallback to stone sounds.
		let stepSounds = itemMeta.block?.stepSound ?? ItemUtil.GetItemDef(CoreItemType.STONE).block?.stepSound;
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
		this.character.animator.SetPlaybackSpeed(newSpeed);
	}

	public IsViewModelEnabled(): boolean {
		return this.viewModelEnabled;
	}

	public Destroy(): void {
		this.bin.Clean();
	}
}
