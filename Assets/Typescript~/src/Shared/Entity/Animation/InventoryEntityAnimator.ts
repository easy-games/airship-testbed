import { RunUtil } from "Shared/Util/RunUtil";
import { BundleReferenceManager } from "../../Util/BundleReferenceManager";
import { MathUtil } from "../../Util/MathUtil";
import { BundleGroupNames } from "../../Util/ReferenceManagerResources";
import { Entity, EntityReferences } from "../Entity";
import { EntityAnimator } from "./EntityAnimator";

export enum ItemEventKeys {
	NONE = -1,
	IDLE,
	EQUIP,
	UN_EQUIP,
	USE,
}

export enum ItemPlayMode {
	DEFAULT,
	LOOP,
	HOLD,
}

export class InventoryEntityAnimator extends EntityAnimator {
	private readonly itemLayerIndex: number = 2;
	private itemLayer: AnimancerLayer;
	private spineClampAngle = 15;
	private neckClampAngle = 35;

	private currentItemClips: Array<AnimationClip> = [];
	private bundleIndex = 0;
	private currentBundleName: BundleGroupNames = BundleGroupNames.NONE;
	private currentItemState: ItemEventKeys = ItemEventKeys.NONE;
	private isFirstPerson = false;

	//private camera: Camera;

	public constructor(entity: Entity, anim: AnimancerComponent, ref: EntityReferences) {
		super(entity, anim, ref);
		this.itemLayer = AnimancerBridge.GetLayer(this.anim, this.itemLayerIndex);
		//Initial animation setup
		this.LoadNewItemResources(BundleGroupNames.ItemUnarmed);
		this.SetFirstPerson(false);
	}

	public LateUpdate() {
		if (!this.isFirstPerson && RunUtil.IsClient()) {
			this.ForceLookForward();
		}
	}

	private Log(message: string) {
		return;
		print("Animator " + this.entity.id + ": " + message);
	}

	//Always keep the character looking where the player is looking
	private ForceLookForward() {
		this.ClampRotation(this.entityRef.spineBone1, this.spineClampAngle);
		this.ClampRotation(this.entityRef.spineBone2, this.spineClampAngle);
		//this.ClampRotation(this.entityRef.spineBone3, this.spineClampAngle);
		this.ClampRotation(this.entityRef.neckBone, this.neckClampAngle);
	}

	private ClampRotation(spine: Transform, maxAngle: number) {
		//Take the world look and convert to this spines local space
		let targetLocalRot = Quaternion.Inverse(spine.parent.rotation).mul(this.entityRef.root.rotation);

		//Clamp the rotation so the spine doesn't appear broken
		let rotY = MathUtil.ClampAngle(targetLocalRot.eulerAngles.y, -maxAngle, maxAngle);
		spine.localEulerAngles = new Vector3(spine.localEulerAngles.x, rotY, spine.localEulerAngles.z);
	}

	public SetFirstPerson(isFirstPerson: boolean) {
		this.isFirstPerson = isFirstPerson;
		this.bundleIndex = isFirstPerson ? 0 : 1;
		if (this.currentBundleName !== BundleGroupNames.NONE) {
			//First person and third person use different animation bundles
			//So we need to load the item resources again
			this.LoadNewItemResources(this.currentBundleName);
			this.StartItemIdle();
		}
	}

	private Play(clipKey: ItemEventKeys, onEnd?: Callback, wrapMode: WrapMode = WrapMode.Default) {
		let clip = this.currentItemClips[clipKey];
		if (clip === undefined) {
			//No animation for this event
			this.itemLayer.StartFade(0, this.defaultTransitionTime);
			return;
		}
		this.Log("Playing Item Anim: " + clipKey);
		this.itemLayer.StartFade(1, this.defaultTransitionTime);
		const lastState = this.itemLayer.CurrentState;
		if (lastState) {
			//Clear the last states end event since we are now starting a new animation
			lastState.Events.ClearEndTSEvent();
		}
		const animState = this.PlayAnimation(clip, this.itemLayerIndex, wrapMode);
		if (onEnd !== undefined) {
			animState.Events.OnEndTS(onEnd);
		}
	}

	private LoadNewItemResources(nextItemId: BundleGroupNames) {
		this.Log("Loading Item: " + nextItemId);
		this.currentBundleName = nextItemId;
		this.itemLayer.DestroyStates();
		//Load the animation clips for the new item
		this.currentItemClips = BundleReferenceManager.LoadResources<AnimationClip>(nextItemId, this.bundleIndex);
	}

	//When certain conditions are met, the items may want to play their own synced animations
	//This was used in testing to sync that
	//private HumanoidItemAnimEventData eventData = new ();
	private TriggerEvent(key: ItemEventKeys, index = 0) {
		this.Log("Trigger State: " + key + " index: " + index);
		this.currentItemState = key;
		/*eventData.eventKey = key;
        eventData.eventIndex = index;
        currentItem.OnAnimEvent(eventData);*/
	}

	public EquipItem(itemId: BundleGroupNames) {
		//Have to animate out the current item before the new item can be added
		this.StartUnEquipAnim(itemId);
	}

	private StartUnEquipAnim(nextItemId: BundleGroupNames) {
		//Right now we are ignoring unequipped and loading the new item instantly
		this.LoadNewItemResources(nextItemId);
		this.StartItemEquipAnim();

		/*
		//Play the un-equip animation
		this.TriggerEvent(ItemEventKeys.UN_EQUIP);
		this.Play(ItemEventKeys.UN_EQUIP, () => {
			//Load the resources for the next item
			//this.LoadNewItemResources(nextItemId);
			this.StartItemEquipAnim();
		});
		*/
	}

	private StartItemEquipAnim() {
		this.TriggerEvent(ItemEventKeys.EQUIP);
		this.Play(ItemEventKeys.EQUIP, () => {
			this.StartItemIdle();
		});
	}

	public StartItemIdle() {
		this.TriggerEvent(ItemEventKeys.IDLE);
		this.Play(ItemEventKeys.IDLE);
	}

	public PlayItemUse(useIndex = 0, itemPlayMode: ItemPlayMode = 0) {
		this.Log("Item Use Started: " + useIndex);
		//In the animation array use animations are the 3rd index and beyond;
		let i = useIndex + 3;
		if (i >= 0 && i < this.currentItemClips.size()) {
			this.TriggerEvent(ItemEventKeys.USE, useIndex);
			this.Play(i, () => {
				if (itemPlayMode === ItemPlayMode.DEFAULT) {
					this.StartItemIdle();
				} else if (itemPlayMode === ItemPlayMode.LOOP) {
					this.PlayItemUse(useIndex, ItemPlayMode.LOOP);
				}
			});
		} else {
			warn("Trying to play animation that doesn't exist: use " + useIndex);
		}
	}
}
