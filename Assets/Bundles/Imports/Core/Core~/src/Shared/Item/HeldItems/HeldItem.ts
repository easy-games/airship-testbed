import { AudioManager } from "Shared/Audio/AudioManager";
import { Bin } from "Shared/Util/Bin";
import { CSArrayUtil } from "Shared/Util/CSArrayUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SetInterval } from "Shared/Util/Timer";
import { Entity } from "../../Entity/Entity";
import {
	Bundle_ItemUnarmed,
	Bundle_ItemUnarmed_SFX,
	BundleGroup,
	BundleGroupNames,
	ReferenceManagerAssets,
} from "../../Util/ReferenceManagerResources";
import { RunUtil } from "../../Util/RunUtil";
import { TimeUtil } from "../../Util/TimeUtil";
import { ItemMeta } from "../ItemMeta";
import { ItemType } from "../ItemType";
import { ItemUtil } from "../ItemUtil";

export class HeldItem {
	private serverOffsetMargin = 0.025;
	protected readonly meta: ItemMeta;
	protected readonly entity: Entity;
	protected readonly bundles: BundleGroup | undefined;
	private lastUsedTime = 0;
	private chargeStartTime = 0;
	protected isCharging = false;
	protected currentItemGOs: GameObject[] = [];
	protected currentItemAnimations: Animator[] = [];
	private holdingDownBin = new Bin();
	private holdingDown = false;

	constructor(entity: Entity, newMeta: ItemMeta) {
		this.entity = entity;
		this.meta = newMeta;

		//Load the animation references
		if (this.meta.itemAssets?.assetBundleId) {
			this.bundles = ReferenceManagerAssets.bundleGroups.get(this.meta.itemAssets.assetBundleId);
		}
	}

	protected Log(message: string) {
		return;
		let fullMessage = "Entity: " + this.entity.id + " Item: " + this.meta.displayName + " " + message;
		print(fullMessage);
	}

	public OnEquip() {
		this.Log("OnEquip");
		//Load that items animations and play equip animation
		this.entity.anim?.EquipItem(this.meta.itemAssets?.assetBundleId ?? BundleGroupNames.ItemUnarmed);

		//Play the equip sound
		//TODO need to make bundles string accessible for when you dont know the exact bundle you are loading
		if (this.meta.itemType !== ItemType.DEFAULT) {
			let equipPath = this.bundles?.bundles?.get(3)?.filePaths.get(0);
			if (!equipPath) {
				//Load a default equip sound
				equipPath = ReferenceManagerAssets.ItemUnarmed.bundles
					.get(Bundle_ItemUnarmed.SFX)
					?.filePaths.get(Bundle_ItemUnarmed_SFX.Equip);
			}
			if (equipPath) {
				if (this.entity.IsLocalCharacter()) {
					AudioManager.PlayFullPathGlobal(equipPath, {
						volumeScale: 0.5,
					});
				} else {
					AudioManager.PlayFullPathAtPosition(equipPath, this.entity.model.transform.position, {
						volumeScale: 0.2,
					});
				}
			} else {
				error("No default equip sound found");
			}
		}

		//Spawn the accessories graphics
		const accessories = ItemUtil.GetAccessoriesForItemType(this.meta.itemType);

		this.currentItemAnimations = [];
		this.currentItemGOs = [];
		this.entity.accessoryBuilder.RemoveAccessorySlot(AccessorySlot.LeftHand);
		this.entity.accessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand);

		let j = 0;
		for (const accessory of accessories) {
			let added = this.entity.accessoryBuilder.SetAccessory(accessory);
			//Load the animator for the held item if one exists
			for (let go of CSArrayUtil.Convert(added.gameObjects)) {
				this.currentItemGOs[j] = go;
				j++;
				const anim = go.GetComponent<Animator>();
				if (anim) {
					this.currentItemAnimations.push(anim);
				}
			}
		}
	}

	public OnUnEquip() {
		this.Log("OnUnEquip");
		this.holdingDownBin.Clean();
		this.currentItemAnimations = [];
		this.currentItemGOs = [];
		this.OnChargeEnd();
	}

	public OnCallToActionStart() {
		this.Log("OnCallToActionStart");
		if (this.HasChargeTime()) {
			this.OnChargeStart();
		} else {
			this.TryUse();
			this.HoldDownAction();
		}
	}

	private HoldDownAction() {
		if (this.meta.itemMechanics?.cooldownSeconds && !this.holdingDown) {
			this.holdingDown = true;
			if (this.meta.itemMechanics.canHoldToUse) {
				this.holdingDownBin.Add(
					SetInterval(this.meta.itemMechanics.cooldownSeconds, () => {
						this.TryUse();
					}),
				);
			}
			this.holdingDownBin.Add(() => {
				this.holdingDown = false;
			});
		}
	}

	public OnCallToActionEnd() {
		this.Log("OnCallToActionEnd");
		this.holdingDownBin.Clean();
		if (this.isCharging) {
			this.TryChargeUse();
		}
	}

	public OnSecondaryActionStart() {
		this.OnChargeEnd();
	}

	public OnSecondaryActionEnd() {}

	protected OnChargeStart() {
		this.Log("OnChargeStart");
		this.isCharging = true;
		this.chargeStartTime = TimeUtil.GetServerTime();
	}

	protected OnChargeEnd() {
		this.Log("OnChargeEnd");
		this.isCharging = false;
		this.chargeStartTime = 0;
	}

	protected TryUse() {
		this.Log("TryUse IsCooledDown: " + this.IsCooledDown());
		if (this.IsCooledDown()) {
			this.TriggerUse(0);
			return true;
		}
		return false;
	}

	protected TryChargeUse() {
		this.Log("TryChargeUse IsChargedUp: " + this.IsChargedUp());
		if (this.IsChargedUp()) {
			this.TriggerUse(1);
			return true;
		} else {
			this.OnChargeEnd();
			return false;
		}
	}

	protected TriggerUse(useIndex: number) {
		this.Log("TriggerUse");

		//Play the use locally
		if (RunUtil.IsClient()) {
			this.OnUseClient(useIndex);
		} else if (RunUtil.IsServer()) {
			this.OnUseServer(useIndex);
		}
	}

	/** Runs when an item is used. Runs on every client.*/
	protected OnUseClient(useIndex: number) {
		this.Log("OnUse Client");
		this.lastUsedTime = TimeUtil.GetServerTime();
		this.isCharging = false;

		//Play the use locally
		this.entity.anim.PlayUseAnim(useIndex);
		if (this.meta.itemAssets?.onUseSound) {
			if (this.entity.IsLocalCharacter()) {
				AudioManager.PlayGlobal(RandomUtil.FromArray(this.meta.itemAssets.onUseSound), {
					volumeScale: this.meta.itemAssets.onUseSoundVolume ?? 1,
				});
			} else {
				AudioManager.PlayAtPosition(
					RandomUtil.FromArray(this.meta.itemAssets.onUseSound),
					this.entity.model.transform.position,
					{
						volumeScale: this.meta.itemAssets.onUseSoundVolume ?? 1,
					},
				);
			}
		}
	}

	protected PlayItemAnimation(index: number, hold: boolean) {
		for (let i = 0; i < this.currentItemAnimations.size(); i++) {
			let anim = this.currentItemAnimations[i];
			if (index >= 0) {
				anim.Play("Base Layer.Use" + index);
			} else {
				anim.Play("Idle");
			}
			anim.SetBool("Hold", hold);
		}
	}

	protected StopItemAnimation() {
		this.PlayItemAnimation(-1, false);
	}

	protected SetItemAnimationHold(hold: boolean) {
		for (let i = 0; i < this.currentItemAnimations.size(); i++) {
			this.currentItemAnimations[i].SetBool("Hold", hold);
		}
	}

	/** Runs when an item is used, server authorized
	 * return true if you can use the item */
	protected OnUseServer(useIndex: number) {
		this.Log("OnUse Server");
		//Update visual state to match client
		this.OnUseClient(useIndex);
	}

	public IsCooledDown(): boolean {
		if (!this.meta.itemMechanics) return true;

		let cooldown = this.meta.itemMechanics.cooldownSeconds;
		this.Log(
			"Cooldown: " + cooldown + " Time: " + TimeUtil.GetServerTime() + " LastUsedTime: " + this.lastUsedTime,
		);
		//no cooldown no startup
		if (cooldown <= 0) return true;

		//If the cooldown is down
		return TimeUtil.GetServerTime() > this.lastUsedTime + cooldown - this.serverOffsetMargin;
	}

	public IsChargedUp(): boolean {
		if (!this.meta.itemMechanics) return false;

		let chargeUpMin = this.meta.itemMechanics.minChargeSeconds;
		this.Log("chargeUpMin: " + chargeUpMin);
		//no charge up time
		if (chargeUpMin <= 0) return true;

		//If we've charged up enough
		return (
			this.chargeStartTime > 0 &&
			TimeUtil.GetServerTime() - this.chargeStartTime - this.serverOffsetMargin > chargeUpMin
		);
	}

	public HasChargeTime(): boolean {
		if (!this.meta.itemMechanics) return false;

		return this.meta.itemMechanics.minChargeSeconds > 0;
	}
}
