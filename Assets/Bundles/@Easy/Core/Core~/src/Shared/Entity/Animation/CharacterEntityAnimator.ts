﻿import { AssetCache } from "Shared/AssetCache/AssetCache";
import { ItemDef } from "Shared/Item/ItemDefinitionTypes";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { Entity, EntityReferences } from "../Entity";
import { EntityAnimationLayer } from "./EntityAnimationLayer";
import { EntityAnimator } from "./EntityAnimator";

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

export class CharacterEntityAnimator extends EntityAnimator {
	private currentItemClipMap: Map<ItemAnimationId, AnimationClip[]> = new Map();
	private currentItemMeta: ItemDef | undefined;
	private currentItemState: string = ItemAnimationId.IDLE;
	private currentEndEventConnection = -1;

	private defaultIdleAnimFP = AssetCache.LoadAsset<AnimationClip>(
		"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Generic_Idle.anim",
	);
	private defaultIdleAnimFPUnarmed = AssetCache.LoadAsset<AnimationClip>(
		"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Unarmed_Idle.anim",
	);
	private defaultIdleAnimTP = AssetCache.LoadAsset<AnimationClip>(
		"@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/Airship_Empty.anim",
	);

	//private camera: Camera;

	public constructor(entity: Entity, ref: EntityReferences) {
		super(entity, ref);
		//Initial animation setup
		// this.LoadNewItemResources(undefined);
		// this.SetFirstPerson(false);
	}

	private Log(message: string) {
		return;
		print("Animator " + this.entity.id + ": " + message);
	}

	public override SetFirstPerson(isFirstPerson: boolean) {
		super.SetFirstPerson(isFirstPerson);

		this.viewmodelAnimancer.enabled = isFirstPerson;
		this.worldmodelAnimancer.enabled = !isFirstPerson;

		this.entityRef.humanEntityAnimator.SetFirstPerson(isFirstPerson);
		this.LoadNewItemResources(this.currentItemMeta);
		this.StartIdleAnim(true);
	}

	public override PlayAnimationInWorldmodel(
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
	): AnimancerState {
		let animState: AnimancerState;
		if ((config?.autoFadeOut === undefined || config?.autoFadeOut) && !clip.isLooping) {
			//Play once then fade away
			animState = AnimancerBridge.PlayOnceOnLayer(
				this.worldmodelAnimancer,
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
				this.worldmodelAnimancer,
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
		return animState;
	}

	public override PlayAnimationInViewmodel(
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
	): AnimancerState {
		let animState: AnimancerState;
		if ((config?.autoFadeOut === undefined || config?.autoFadeOut) && !clip.isLooping) {
			//Play once then fade away
			animState = AnimancerBridge.PlayOnceOnLayer(
				this.viewmodelAnimancer,
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
				this.viewmodelAnimancer,
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
		return animState;
	}

	private LoadNewItemResources(itemMeta: ItemDef | undefined) {
		this.Log("Loading Item: " + itemMeta?.itemType);
		this.currentItemMeta = itemMeta;
		// this.itemLayer.DestroyStates();
		//Load the animation clips for the new item

		this.currentItemClipMap.clear();

		if (itemMeta) {
			if (this.isFirstPerson) {
				if (itemMeta.viewModel?.equipAnimFP) {
					let clips = itemMeta.viewModel.equipAnimFP.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.EQUIP, clips);
					}
				}
				if (itemMeta.viewModel?.idleAnimFP) {
					let clips = itemMeta.viewModel.idleAnimFP.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.IDLE, clips);
					}
				} else if (itemMeta.block) {
					this.currentItemClipMap.set(ItemAnimationId.IDLE, [BLOCK_IDLE_FP]);
				}
				if (itemMeta.usable?.onUseAnimFP) {
					let clips = itemMeta.usable.onUseAnimFP.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.USE, clips);
					}
				} else if (itemMeta.block) {
					this.currentItemClipMap.set(ItemAnimationId.USE, [BLOCK_USE_FP]);
				}
			} else {
				if (itemMeta.viewModel?.equipAnimTP) {
					let clips = itemMeta.viewModel.equipAnimTP.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.EQUIP, clips);
					}
				}
				if (itemMeta.viewModel?.idleAnimTP) {
					let clips = itemMeta.viewModel.idleAnimTP.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.IDLE, clips);
					}
				}
				if (itemMeta.usable?.onUseAnimTP) {
					let clips = itemMeta.usable.onUseAnimTP.mapFiltered((s) => {
						const clip = AssetCache.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.USE, clips);
					}
				}
			}
		} else {
			//UNARMED
			if (this.isFirstPerson) {
				this.currentItemClipMap.set(ItemAnimationId.IDLE, [this.defaultIdleAnimFPUnarmed]);
			}
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

	public override EquipItem(itemMeta: ItemDef | undefined) {
		this.LoadNewItemResources(itemMeta);
		this.StartIdleAnim(false);
	}

	public override StartIdleAnim(instantTransition: boolean) {
		this.TriggerEvent(ItemAnimationId.IDLE);

		// if (this.currentItemMeta === undefined) {
		// 	this.PlayClip(EMPTY_ANIM);
		// 	return;
		// }

		if (this.isFirstPerson) {
			let clips = this.currentItemClipMap.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimFP];
			const clip = RandomUtil.FromArray(clips);
			this.PlayAnimationInViewmodel(clip, EntityAnimationLayer.LAYER_1, undefined, {
				fadeInDuration: instantTransition ? 0 : this.defaultTransitionTime,
			});
			// AnimancerBridge.GetLayer(this.viewmodelAnimancer, EntityAnimationLayer.LAYER_2).StartFade(0, 0.05);
		} else {
			let clips = this.currentItemClipMap.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimTP];
			const clip = RandomUtil.FromArray(clips);
			this.PlayAnimationInWorldmodel(clip, EntityAnimationLayer.LAYER_1, undefined, {
				fadeInDuration: instantTransition ? 0 : this.defaultTransitionTime,
			});
			// AnimancerBridge.GetLayer(this.worldmodelAnimancer, EntityAnimationLayer.LAYER_2).StartFade(0, 0.05);
		}
	}

	public override PlayUseAnim(
		useIndex = 0,
		config?: {
			fadeMode?: FadeMode;
			wrapMode?: WrapMode;
			transitionTime?: number;
			autoFadeOut?: boolean;
		},
	) {
		this.Log("Item Use Started: " + useIndex);
		this.TriggerEvent(ItemAnimationId.USE, useIndex);

		let clips: AnimationClip[] | undefined = this.currentItemClipMap.get(ItemAnimationId.USE);
		if (!clips || clips.isEmpty() || useIndex >= clips.size()) {
			this.StartIdleAnim(false);
			return;
		}

		if (this.isFirstPerson) {
			this.PlayAnimationInViewmodel(clips[useIndex], EntityAnimationLayer.LAYER_2, undefined, config);
		} else {
			this.PlayAnimationInWorldmodel(clips[useIndex], EntityAnimationLayer.LAYER_2, undefined, config);
		}
	}

	public PlayRandomUseAnim(config?: {
		fadeMode?: FadeMode;
		wrapMode?: WrapMode;
		transitionTime?: number;
		autoFadeOut?: boolean;
	}) {
		this.Log("Random Item Use Started");
		//In the animation array use animations are the 3rd index and beyond;
		let clips: AnimationClip[] | undefined = this.currentItemClipMap.get(ItemAnimationId.USE);
		if (!clips || clips.isEmpty()) {
			return;
		}

		const clip = RandomUtil.FromArray(clips);
		if (this.isFirstPerson) {
			this.PlayAnimationInViewmodel(clip, EntityAnimationLayer.LAYER_2, undefined, config);
		} else {
			this.PlayAnimationInWorldmodel(clip, EntityAnimationLayer.LAYER_2, undefined, config);
		}
	}
}
