import { AudioManager } from "Shared/Audio/AudioManager";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { Entity } from "../../Entity/Entity";
import { BundleGroup, BundleGroupNames, ReferenceManagerAssets } from "../../Util/ReferenceManagerResources";
import { RunUtil } from "../../Util/RunUtil";
import { TimeUtil } from "../../Util/TimeUtil";
import { ItemMeta } from "../ItemMeta";

export class HeldItem {
	private serverOffsetMargin = 0.025;
	protected readonly meta: ItemMeta;
	protected readonly entity: Entity;
	protected readonly bundles: BundleGroup | undefined;
	private lastUsedTime = 0;
	private chargeStartTime = 0;
	private isCharging = false;

	constructor(entity: Entity, newMeta: ItemMeta) {
		this.entity = entity;
		this.meta = newMeta;

		//Load the asset references
		if (this.meta.itemAssets?.assetBundleId) {
			this.bundles = ReferenceManagerAssets.bundleGroups.get(this.meta.itemAssets.assetBundleId);
		}
	}

	protected Log(message: string) {
		// return;
		let fullMessage = "Entity: " + this.entity.id + " Item: " + this.meta.displayName + " " + message;
		print(fullMessage);
	}

	public OnEquip() {
		this.Log("OnEquip");
		//Load that items animations and play equip animation
		this.entity.anim?.EquipItem(this.meta.itemAssets?.assetBundleId ?? BundleGroupNames.ItemUnarmed);
	}

	public OnUnEquip() {
		this.Log("OnUnEquip");
	}

	public OnCallToActionStart() {
		this.Log("OnCallToActionStart");
		if (this.HasChargeTime()) {
			this.OnChargeStart();
		} else {
			this.TryUse();
		}
	}

	public OnCallToActionEnd() {
		this.Log("OnCallToActionEnd");
		if (this.isCharging) {
			this.TryChargeUse();
		}
	}

	protected OnChargeStart() {
		this.Log("OnChargeStart");
		this.isCharging = true;
		this.chargeStartTime = TimeUtil.GetServerTime();
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
		}
		return false;
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
		this.entity.anim?.PlayItemUse(useIndex);
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

	/** Runs when an item is used, server authorized
	 * return true if you can use the item */
	protected OnUseServer(useIndex: number) {
		this.Log("OnUse Server");
		//Update visual state to match client
		this.OnUseClient(useIndex);
	}

	public IsCooledDown(): boolean {
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
		let chargeUpMin = this.meta.itemMechanics.minChargeSeconds;
		this.Log("chargeUpMin: " + chargeUpMin);
		//no charge up
		if (chargeUpMin <= 0) return true;

		//If we've charged up enough
		return TimeUtil.GetServerTime() - this.chargeStartTime - this.serverOffsetMargin > chargeUpMin;
	}

	public HasChargeTime(): boolean {
		return this.meta.itemMechanics.minChargeSeconds > 0;
	}
}
