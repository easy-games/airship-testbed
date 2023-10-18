﻿import { ItemMeta } from "Shared/Item/ItemMeta";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { Entity, EntityReferences } from "../Entity";
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

export class CharacterEntityAnimator extends EntityAnimator {
	private itemLayer: AnimancerLayer;

	private currentItemClipMap: Map<ItemAnimationId, AnimationClip[]> = new Map();
	private currentItemMeta: ItemMeta | undefined;
	private currentItemState: string = ItemAnimationId.IDLE;
	private currentEndEventConnection = -1;

	private defaultIdleAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
		"Imports/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Generic_Idle.anim",
	);
	private defaultIdleAnimTP = this.defaultIdleAnimFP;

	private defaultUseAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
		"Imports/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Sword_Use.anim",
	);
	private defaultUseAnimTP = this.defaultUseAnimFP;

	//private camera: Camera;

	public constructor(entity: Entity, anim: AnimancerComponent, ref: EntityReferences) {
		super(entity, anim, ref);
		this.itemLayer = AnimancerBridge.GetLayer(this.anim, this.itemLayerIndex);
		//Initial animation setup
		this.LoadNewItemResources(undefined);
		this.SetFirstPerson(false);
	}

	private Log(message: string) {
		return;
		print("Animator " + this.entity.id + ": " + message);
	}

	public override SetFirstPerson(isFirstPerson: boolean) {
		super.SetFirstPerson(isFirstPerson);
		this.entityRef.humanEntityAnimator.SetFirstPerson(isFirstPerson);
		if (this.currentItemMeta !== undefined) {
			//First person and third person use different animation bundles
			//So we need to load the item resources again
			this.LoadNewItemResources(this.currentItemMeta);
			this.StartIdleAnim();
		}
	}

	public override PlayClip(clip: AnimationClip, onEnd?: Callback, wrapMode: WrapMode = WrapMode.Default) {
		// this.Log("Playing Item Anim: " + animationId);
		this.itemLayer.StartFade(1, this.defaultTransitionTime);
		if (this.currentEndEventConnection !== -1) {
			Bridge.DisconnectEvent(this.currentEndEventConnection);
			this.currentEndEventConnection = -1;
		}

		const animState = this.PlayAnimation(clip, this.itemLayerIndex, wrapMode);
		if (onEnd !== undefined) {
			this.currentEndEventConnection = animState.Events.OnEndTS(() => {
				Bridge.DisconnectEvent(this.currentEndEventConnection);
				onEnd();
			});
		}
	}

	private LoadNewItemResources(itemMeta: ItemMeta | undefined) {
		this.Log("Loading Item: " + itemMeta?.itemType);
		this.currentItemMeta = itemMeta;
		this.itemLayer.DestroyStates();
		//Load the animation clips for the new item

		this.currentItemClipMap.clear();

		if (itemMeta?.viewModel) {
			if (this.isFirstPerson) {
				if (itemMeta.viewModel.equipAnimFP) {
					let clips = itemMeta.viewModel.equipAnimFP.mapFiltered((s) => {
						const clip = AssetBridge.Instance.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.EQUIP, clips);
					}
				}
				if (itemMeta.viewModel.idleAnimFP) {
					let clips = itemMeta.viewModel.idleAnimFP.mapFiltered((s) => {
						const clip = AssetBridge.Instance.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.IDLE, clips);
					}
				}
				if (itemMeta.usable?.onUseAnimFP) {
					let clips = itemMeta.usable.onUseAnimFP.mapFiltered((s) => {
						const clip = AssetBridge.Instance.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.USE, clips);
					}
				}
			} else {
				if (itemMeta.viewModel.equipAnimTP) {
					let clips = itemMeta.viewModel.equipAnimTP.mapFiltered((s) => {
						const clip = AssetBridge.Instance.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.EQUIP, clips);
					}
				}
				if (itemMeta.viewModel.idleAnimTP) {
					let clips = itemMeta.viewModel.idleAnimTP.mapFiltered((s) => {
						const clip = AssetBridge.Instance.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.IDLE, clips);
					}
				}
				if (itemMeta.usable?.onUseAnimTP) {
					let clips = itemMeta.usable.onUseAnimTP.mapFiltered((s) => {
						const clip = AssetBridge.Instance.LoadAssetIfExists<AnimationClip>(s);
						if (clip) return clip;
					});
					if (clips.size() > 0) {
						this.currentItemClipMap.set(ItemAnimationId.USE, clips);
					}
				}
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

	public override EquipItem(itemMeta: ItemMeta) {
		this.LoadNewItemResources(itemMeta);
		this.StartIdleAnim();
	}

	public override StartIdleAnim() {
		this.TriggerEvent(ItemAnimationId.IDLE);

		let clips: AnimationClip[] | undefined;
		if (this.isFirstPerson) {
			clips = this.currentItemClipMap.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimFP];
		} else {
			clips = this.currentItemClipMap.get(ItemAnimationId.IDLE) ?? [this.defaultIdleAnimFP];
		}
		const clip = RandomUtil.FromArray(clips);
		this.PlayClip(clip);
	}

	public override PlayUseAnim(useIndex = 0, itemPlayMode: ItemPlayMode = ItemPlayMode.DEFAULT) {
		this.Log("Item Use Started: " + useIndex);
		//In the animation array use animations are the 3rd index and beyond;

		this.TriggerEvent(ItemAnimationId.USE, useIndex);

		let clips: AnimationClip[] | undefined = this.currentItemClipMap.get(ItemAnimationId.USE);
		if (!clips || clips.isEmpty()) {
			return;
		}

		const clip = RandomUtil.FromArray(clips);
		this.PlayClip(clip, () => {
			if (itemPlayMode === ItemPlayMode.DEFAULT) {
				this.StartIdleAnim();
			} else if (itemPlayMode === ItemPlayMode.LOOP) {
				this.PlayUseAnim(useIndex, ItemPlayMode.LOOP);
			}
		});
	}
}
