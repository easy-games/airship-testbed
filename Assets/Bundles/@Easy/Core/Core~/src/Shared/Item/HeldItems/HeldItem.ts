import { ViewmodelController } from "Client/Controllers/Viewmodel/ViewmodelController";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import Character from "@Easy/Core/Shared/Character/Character";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { SetInterval } from "@Easy/Core/Shared/Util/Timer";
import { TimeUtil } from "../../Util/TimeUtil";
import { ItemDef } from "../ItemDefinitionTypes";
import { ItemUtil } from "../ItemUtil";
import { Game } from "../../Game";

export class HeldItem {
	private readonly serverOffsetMargin = 0.025;
	protected readonly itemMeta: ItemDef | undefined;

	/** Undefined when holding nothing */
	public readonly character: Character;

	/**
	 * The look vector for the latest action.
	 *
	 * It's recommended to use this instead of `entity.GetLookVector()` as it has higher precision.
	 * This vector will match the exact direction the entity was facing during the frame they clicked (as opposed to the tick they clicked).
	 */
	protected lookVector: Vector3 = new Vector3();
	protected clickBufferMargin = 0.2;
	protected isCharging = false;
	protected activeAccessoriesWorldmodel: ActiveAccessory[] = [];
	protected activeAccessoriesViewmodel: ActiveAccessory[] = [];
	protected currentItemGOs: GameObject[] = [];
	protected currentItemAnimations: Animator[] = [];
	protected viewmodelAccessoryBuilder: AccessoryBuilder | undefined;
	protected audioPitchShift = 1;
	protected playEffectsOnUse = true;

	private holdingDownBin = new Bin();
	private holdingDown = false;
	private bufferingUse = -1;
	private lastUsedTime = 0;
	private chargeStartTime = 0;

	protected Log(message: string) {
		//print("[HeldItem]: " + message);
	}

	constructor(character: Character, newMeta: ItemDef | undefined) {
		this.character = character;
		this.itemMeta = newMeta;
	}

	/**
	 * Internally used to update the current look vector.
	 */
	public SetLookVector(vec: Vector3): void {
		this.lookVector = vec;
	}

	/**
	 * Called when the HeldItem's art assets (such as animations) should be loaded.
	 */
	public OnLoadAssets(): void {}

	/**
	 * Returns an array of ActiveAccessories.
	 * If the character is in first person, these will be the viewmodel accessories. Otherwise, they are the worldmodel accessories.
	 *
	 * @returns ActiveAccessories that are enabled in the scene.
	 */
	public GetActiveAccessories(): ActiveAccessory[] {
		if (this.character.IsLocalCharacter() && this.character.animator.IsFirstPerson()) {
			return this.activeAccessoriesViewmodel;
		}
		return this.activeAccessoriesWorldmodel;
	}

	public OnEquip() {
		this.Log("OnEquip");
		//Load that items animations and play equip animation
		// todo: equip item
		this.character.animator?.EquipItem(this.itemMeta);

		//Play the equip sound
		//TODO need to make bundles string accessible for when you dont know the exact bundle you are loading
		if (this.itemMeta !== undefined) {
			let equipPath = "@Easy/Core/Shared/Resources/Sound/Items/Equip/Equip_Generic.ogg";
			if (this.itemMeta.holdConfig?.equipSound) {
				equipPath = RandomUtil.FromArray(this.itemMeta.holdConfig.equipSound);
			}
			if (equipPath !== "") {
				if (this.character.IsLocalCharacter()) {
					AudioManager.PlayFullPathGlobal(equipPath, {
						volumeScale: 0.5,
					});
				} else {
					AudioManager.PlayFullPathAtPosition(equipPath, this.character.model.transform.position, {
						volumeScale: 0.2,
					});
				}
			} else {
				error("No default equip sound found");
			}
		}

		//Spawn the accessories graphics
		let accessoryTemplates: AccessoryComponent[] = [];
		if (this.itemMeta) {
			accessoryTemplates = [...ItemUtil.GetAccessoriesForItemType(this.itemMeta.itemType)];
		}

		this.currentItemAnimations = [];
		this.currentItemGOs = [];
		this.character.accessoryBuilder.RemoveAccessorySlot(AccessorySlot.LeftHand, false);
		this.character.accessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand, false);
		if (this.character.IsLocalCharacter()) {
			this.viewmodelAccessoryBuilder = Dependency<ViewmodelController>().accessoryBuilder;
			this.viewmodelAccessoryBuilder.RemoveAccessorySlot(AccessorySlot.LeftHand, false);
			this.viewmodelAccessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand, false);
		}

		// const firstPerson = this.character.animator.IsFirstPerson();
		// let layer = firstPerson ? Layer.FIRST_PERSON : Layer.CHARACTER;
		let i = 0;
		this.activeAccessoriesWorldmodel.clear();
		this.activeAccessoriesViewmodel.clear();
		for (const accessoryTemplate of accessoryTemplates) {
			this.activeAccessoriesWorldmodel[i] = this.character.accessoryBuilder.AddSingleAccessory(
				accessoryTemplate,
				false,
			);
			if (this.viewmodelAccessoryBuilder) {
				this.activeAccessoriesViewmodel[i] = this.viewmodelAccessoryBuilder.AddSingleAccessory(
					accessoryTemplate,
					false,
				);
			}

			//Load the animator for the held item if one exists
			const go = this.activeAccessoriesWorldmodel[i].rootTransform.gameObject;
			this.currentItemGOs.push(go);
			const anim = go.GetComponent<Animator>();
			if (anim) {
				this.currentItemAnimations.push(anim);
			}
			i++;
		}

		// this.entity.accessoryBuilder.TryCombineMeshes();
		this.character.accessoryBuilder.UpdateAccessoryLayers();
		if (this.character.IsLocalCharacter()) {
			Dependency<ViewmodelController>().accessoryBuilder.UpdateAccessoryLayers();
		}
	}

	public OnUnEquip() {
		this.Log("OnUnEquip");
		this.holdingDownBin.Clean();
		this.bufferingUse = -1;
		this.currentItemAnimations = [];
		this.currentItemGOs = [];
		this.OnChargeEnd();
	}

	public OnNewActionState(stateIndex: number, isActive: boolean) {
		this.Log("Use " + stateIndex + " isActive: " + isActive);
		//Default Action behaviour
		switch (stateIndex) {
			case 0:
				//Primary Action
				if (isActive) {
					if (this.HasChargeTime()) {
						this.OnChargeStart();
					} else {
						this.TryUse();
						this.HoldDownAction();
					}
				} else {
					this.bufferingUse = -1;
					this.holdingDownBin.Clean();
					if (this.isCharging) {
						this.TryChargeUse();
					}
				}
				break;
			case 1:
				//Secondary Action
				if (isActive) {
					if (this.HasChargeTime()) {
						this.OnChargeEnd();
					} else {
						this.TryUse(1);
						this.HoldDownAction(1);
					}
				} else {
					this.bufferingUse = -1;
					this.holdingDownBin.Clean();
				}
				break;
		}
	}

	private HoldDownAction(useIndex = 0) {
		if (this.itemMeta?.usable && !this.holdingDown) {
			this.holdingDown = true;
			if (this.itemMeta.usable?.canHoldToUse) {
				const holdCooldown = this.itemMeta.usable.holdToUseCooldownInSeconds;
				const cooldown = this.itemMeta.usable.cooldownSeconds;
				this.holdingDownBin.Add(
					SetInterval(holdCooldown && holdCooldown > cooldown ? holdCooldown : cooldown, () => {
						this.TryUse(useIndex);
					}),
				);
			}
			this.holdingDownBin.Add(() => {
				this.holdingDown = false;
			});
		}
	}

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

	private TryUse(index = 0) {
		this.Log("TryUse");
		this.bufferingUse = -1;

		if (!this.CanUse(index)) {
			return false;
		}

		const remainingTime = this.GetRemainingCooldownTime();
		if (remainingTime === 0) {
			this.TriggerUse(index);
			return true;
		} else if (remainingTime < this.clickBufferMargin) {
			this.bufferingUse = index;
		}
		return false;
	}

	private TryChargeUse() {
		this.Log("TryChargeUse IsChargedUp: " + this.IsChargedUp());
		this.bufferingUse = -1;

		if (!this.CanCharge()) {
			return false;
		}

		const remainingTime = this.GetRemainingCooldownTime();
		if (remainingTime > 0) {
			// can't charge on cooldown
			return false;
		}

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
		this.bufferingUse = -1;

		//Play the use locally
		if (Game.IsClient()) {
			this.OnUseClient(useIndex);
		}
		if (Game.IsServer()) {
			this.OnUseServer(useIndex);
		}

		//Invoke function when cooldown should be up
		if (this.itemMeta?.usable) {
			task.delay(this.itemMeta.usable.cooldownSeconds + 0.01, () => {
				this.OnCooldownReset();
			});
		}
	}

	protected OnCooldownReset() {
		this.Log("OnCooldownReset: " + this.bufferingUse);
		if (this.bufferingUse >= 0) {
			this.TriggerUse(this.bufferingUse);
		}
	}

	/** Runs when an item is used. Runs on every client.*/
	protected OnUseClient(useIndex: number) {
		this.Log("OnUse Client");
		this.lastUsedTime = TimeUtil.GetServerTime();
		this.isCharging = false;

		//Play the use locally
		if (this.playEffectsOnUse) {
			// todo: play use anim
			this.character.animator.PlayItemUseAnim(useIndex);
			this.PlayItemSound();
		}
	}

	/** Runs when an item is used, server authorized
	 * return true if you can use the item */
	protected OnUseServer(useIndex: number) {
		this.Log("OnUse Server");
		//Update visual state to match client
		// this.OnUseClient(useIndex);
	}

	protected PlayItemSound() {
		if (this.itemMeta === undefined) return;
		if (this.itemMeta.usable?.onUseSound) {
			if (this.character.IsLocalCharacter()) {
				AudioManager.PlayGlobal(RandomUtil.FromArray(this.itemMeta.usable.onUseSound), {
					volumeScale: this.itemMeta.usable.onUseSoundVolume ?? 1,
				});
			} else {
				AudioManager.PlayAtPosition(
					RandomUtil.FromArray(this.itemMeta.usable.onUseSound),
					this.character.model.transform.position,
					{
						volumeScale: this.itemMeta.usable.onUseSoundVolume ?? 1,
					},
				);
			}
		}
	}

	protected PlayAnimationOnItem(index: number, pauseOnEndFrame = false) {
		for (let i = 0; i < this.currentItemAnimations.size(); i++) {
			let anim = this.currentItemAnimations[i];
			if (index >= 0) {
				anim.Play("Base Layer.Use" + index);
			} else {
				anim.Play("Idle");
			}
			anim.SetBool("Hold", pauseOnEndFrame);
		}
	}

	protected StopAnimationOnItem() {
		for (let i = 0; i < this.currentItemAnimations.size(); i++) {
			this.currentItemAnimations[i].Play("Idle");
		}
	}

	protected SetItemAnimationPauseOnEndFrame(pauseOnEndFrame: boolean) {
		for (let i = 0; i < this.currentItemAnimations.size(); i++) {
			this.currentItemAnimations[i].SetBool("Hold", pauseOnEndFrame);
		}
	}

	public GetRemainingCooldownTime(): number {
		if (!this.itemMeta?.usable) return 0;

		let cooldown = this.itemMeta.usable.cooldownSeconds;
		this.Log(
			"Cooldown: " + cooldown + " Time: " + TimeUtil.GetServerTime() + " LastUsedTime: " + this.lastUsedTime,
		);
		//no cooldown no startup
		if (cooldown <= 0) return 0;

		//If the cooldown is down
		return math.max(0, cooldown + this.serverOffsetMargin - (TimeUtil.GetServerTime() - this.lastUsedTime));
	}

	public IsChargedUp(): boolean {
		if (!this.itemMeta?.usable) return false;

		let chargeUpMin = this.itemMeta.usable.minChargeSeconds ?? 0;
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
		if (!this.itemMeta?.usable) return false;

		return (this.itemMeta.usable.maxChargeSeconds ?? 0) > 0;
	}

	protected CanUse(index = 0) {
		return true;
	}

	protected CanCharge() {
		return true;
	}
}
