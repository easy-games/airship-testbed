import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { Crosshair } from "Shared/Crosshair/Crosshair";
import { EntityAnimationLayer } from "Shared/Entity/Animation/EntityAnimationLayer";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AmmoMeta, ItemMeta, SoundMeta } from "Shared/Item/ItemMeta";
import { ProjectileUtil } from "Shared/Projectile/ProjectileUtil";
import { Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";
import { RunUtil } from "Shared/Util/RunUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { Task } from "Shared/Util/Task";
import { OnLateUpdate } from "Shared/Util/Timer";
import { AudioManager } from "../../../Audio/AudioManager";
import { ItemUtil } from "../../ItemUtil";
import { HeldItem } from "../HeldItem";

const defaultChargeAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
	AllBundleItems.ItemThrowable_FirstPerson_Charge,
);
const defaultChargeAnimTP = AssetBridge.Instance.LoadAsset<AnimationClip>(
	AllBundleItems.ItemThrowable_ThirdPerson_Charge,
);
const defaultThrowAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
	AllBundleItems.ItemThrowable_FirstPerson_Throw,
);
const defaultThrowAnimTP = AssetBridge.Instance.LoadAsset<AnimationClip>(
	AllBundleItems.ItemThrowable_ThirdPerson_Throw,
);

export class ProjectileLauncherHeldItem extends HeldItem {
	private chargeBin = new Bin();
	private startHoldTimeSec = 0;
	private processChargeAfterCooldown = false;
	private chargeAudioSource: AudioSource | undefined;
	private projectileTrajectoryRenderer =
		GameObject.Find("ProjectileTrajectoryRenderer").GetComponent<ProjectileTrajectoryRenderer>();
	private chargeAnimFP: AnimationClip[] = [];
	private chargeAnimTP: AnimationClip[] = [];
	private throwAnimFP: AnimationClip[] = [];
	private throwAnimTP: AnimationClip[] = [];

	override OnEquip(): void {
		super.OnEquip();
	}

	override OnLoadAssets(): void {
		super.OnLoadAssets();

		//Charge animations
		if (this.itemMeta?.projectileLauncher?.chargeAnimFP !== "none") {
			if (this.itemMeta?.projectileLauncher?.chargeAnimFP) {
				this.chargeAnimFP = this.itemMeta.projectileLauncher.chargeAnimFP.map((path) =>
					AssetBridge.Instance.LoadAsset(path),
				);
			} else {
				this.chargeAnimFP = [defaultChargeAnimFP];
			}
		}

		if (this.itemMeta?.projectileLauncher?.chargeAnimTP !== "none") {
			if (this.itemMeta?.projectileLauncher?.chargeAnimTP) {
				this.chargeAnimTP = this.itemMeta.projectileLauncher.chargeAnimTP.map((path) =>
					AssetBridge.Instance.LoadAsset(path),
				);
			} else {
				this.chargeAnimTP = [defaultChargeAnimTP];
			}
		}

		//Throw animations
		if (this.itemMeta?.projectileLauncher?.throwAnimFP !== "none") {
			if (this.itemMeta?.projectileLauncher?.throwAnimFP) {
				this.throwAnimFP = this.itemMeta.projectileLauncher.throwAnimFP.map((path) =>
					AssetBridge.Instance.LoadAsset(path),
				);
			} else {
				this.throwAnimFP = [defaultThrowAnimFP];
			}
		}

		if (this.itemMeta?.projectileLauncher?.throwAnimTP !== "none") {
			if (this.itemMeta?.projectileLauncher?.throwAnimTP) {
				this.throwAnimTP = this.itemMeta.projectileLauncher.throwAnimTP.map((path) =>
					AssetBridge.Instance.LoadAsset(path),
				);
			} else {
				this.throwAnimTP = [defaultThrowAnimTP];
			}
		}
	}

	protected override OnCooldownReset() {
		if (this.processChargeAfterCooldown) {
			this.processChargeAfterCooldown = false;
			this.OnChargeStart();
		}
	}

	protected override OnChargeStart(): void {
		if (!this.itemMeta?.projectileLauncher) return;
		if (!this.HasRequiredAmmo()) return;

		if (RunUtil.IsClient()) {
			if (CanvasAPI.IsPointerOverUI()) return;
		}

		// Don't start charging if on cooldown, but we'll auto-charge after cooldown has passed period
		if (this.GetRemainingCooldownTime() > 0) {
			this.processChargeAfterCooldown = true;
			if (this.itemMeta?.usable) {
				Task.Delay(this.itemMeta.usable.cooldownSeconds + 0.01, () => {
					this.OnCooldownReset();
				});
			}
			this.Log("OnChargeStartAwaitCooldown");
			return;
		}

		super.OnChargeStart();

		//Play the draw sound
		//TODO need to make bundles string accessible for when you dont know the exact bundle you are loading

		let sound: SoundMeta | undefined = undefined;
		if (this.itemMeta.projectileLauncher.chargeSound) {
			sound = RandomUtil.FromArray(this.itemMeta.projectileLauncher.chargeSound);
		}

		if (sound) {
			if (this.entity.IsLocalCharacter()) {
				AudioManager.PlayFullPathGlobal(sound.path, sound);
			} else {
				this.chargeAudioSource = AudioManager.PlayFullPathAtPosition(
					sound.path,
					this.entity.model.transform.position,
					sound,
				);
			}
		}

		//Play Charge Animation
		const chargeAnimState = this.entity.animator?.PlayAnimation(
			this.entity.animator.IsFirstPerson()
				? RandomUtil.FromArray(this.chargeAnimFP)
				: RandomUtil.FromArray(this.chargeAnimTP),
			EntityAnimationLayer.ITEM_ACTION,
			undefined,
			{ autoFadeOut: false },
		);

		if (RunUtil.IsClient() && this.entity.IsLocalCharacter()) {
			const ammoItemMeta = ItemUtil.GetItemMeta(this.itemMeta.projectileLauncher.ammoItemType);
			const ammoMeta = ammoItemMeta.projectile!;

			this.chargeBin.Add(Crosshair.AddDisabler());

			this.isCharging = true;

			this.startHoldTimeSec = os.clock();

			const mouse = new Mouse();
			const localEntityController = Dependency<LocalEntityController>();
			this.chargeBin.Add(
				OnLateUpdate.ConnectWithPriority(SignalPriority.NORMAL, (deltaTime) => {
					if (this.isCharging) {
						const chargeSec = os.clock() - this.startHoldTimeSec;

						const launchPos = ProjectileUtil.GetLaunchPosition(
							this.activeAccessories[0].rootTransform,
							this.entity,
							localEntityController.IsFirstPerson(),
						);
						const launchData = this.GetLaunchData(this.entity, mouse, this.itemMeta!, chargeSec, launchPos);

						const powerMul = this.itemMeta?.projectileLauncher?.powerMultiplier ?? 1;
						this.projectileTrajectoryRenderer.UpdateInfo(
							launchPos,
							launchData.velocity,
							0,
							ammoMeta.gravity / powerMul,
						);
					}
				}),
			);
			this.chargeBin.Add(() => {
				mouse.Destroy();
			});
		}

		if (RunUtil.IsServer() || this.entity.IsLocalCharacter()) {
			this.chargeBin.Add(
				this.entity.OnAdjustMove.Connect((moveModifier) => {
					moveModifier.blockSprint = true;
					moveModifier.speedMultiplier *= 0.4;
				}),
			);
		}
	}

	private HasRequiredAmmo(): boolean {
		if (!this.entity.IsAlive() || !(this.entity instanceof CharacterEntity)) {
			return false;
		}

		const inventory = this.entity.GetInventory();
		const launcherItemMeta = inventory.GetHeldItem()?.GetMeta();
		const nullableProjectileLauncherMeta = launcherItemMeta?.projectileLauncher;

		if (nullableProjectileLauncherMeta) {
			const launcherMeta = nullableProjectileLauncherMeta!;

			if (inventory.HasItemType(launcherMeta.ammoItemType)) {
				return true;
			}
		}

		return false;
	}

	protected override OnChargeEnd(): void {
		this.processChargeAfterCooldown = false;
		super.OnChargeEnd();
		this.entity.animator?.StartIdleAnim(false);
		this.CancelChargeSound();
		this.chargeBin.Clean();
		this.projectileTrajectoryRenderer.SetDrawingEnabled(false);
	}

	private CancelChargeSound() {
		if (this.entity.IsLocalCharacter()) {
			AudioManager.StopGlobalAudio();
		} else if (this.chargeAudioSource) {
			this.chargeAudioSource.Stop();
		}
	}

	protected override OnUseClient(useIndex: number): void {
		this.CancelChargeSound();
		this.OnChargeEnd();
		if (!this.HasRequiredAmmo()) {
			return;
		}

		super.OnUseClient(useIndex);
		print("On use: " + useIndex);

		//Play the throw animation
		let throwAnimState: AnimancerState | undefined;
		if (this.entity.animator.IsFirstPerson()) {
			if (this.throwAnimFP.size() > 0) {
				throwAnimState = this.entity.animator.PlayAnimation(
					RandomUtil.FromArray(this.throwAnimFP),
					EntityAnimationLayer.ITEM_ACTION,
				);
			}
		} else {
			if (this.throwAnimTP.size() > 0) {
				throwAnimState = this.entity.animator.PlayAnimation(
					RandomUtil.FromArray(this.throwAnimTP),
					EntityAnimationLayer.ITEM_ACTION,
				);
			}
		}

		//Play the items animation  (bow shoot)
		this.entity.animator.PlayUseAnim(0);

		if (!this.entity.IsLocalCharacter()) return;

		if (CanvasAPI.IsPointerOverUI()) {
			return;
		}

		const chargeSec = os.clock() - this.startHoldTimeSec;

		/*
		 * All checks passed. Time to FIRE!
		 */
		this.startHoldTimeSec = -1;

		const mouse = new Mouse();
		const launchPos = ProjectileUtil.GetLaunchPosition(
			this.activeAccessories[0].rootTransform,
			this.entity,
			Dependency<LocalEntityController>().IsFirstPerson(),
		);
		const launchData = this.GetLaunchData(this.entity, mouse, this.itemMeta!, chargeSec, launchPos);
		this.entity.LaunchProjectile(
			this.itemMeta!.itemType,
			this.itemMeta!.projectileLauncher!.ammoItemType,
			launchData.launchPos,
			launchData.velocity,
		);
	}

	public override OnCallToActionEnd(): void {
		super.OnCallToActionEnd();
		this.chargeBin.Clean();
		this.projectileTrajectoryRenderer.SetDrawingEnabled(false);
	}

	private GetLaunchData(
		entity: Entity,
		mouse: Mouse,
		launcherItemMeta: ItemMeta,
		chargeSec: number,
		launchPos: Vector3,
	): {
		direction: Vector3;
		launchPos: Vector3;
		velocity: Vector3;
	} {
		const launcherMeta = launcherItemMeta.projectileLauncher!;
		const ammoItemMeta = ItemUtil.GetItemMeta(launcherMeta.ammoItemType);
		const ammoMeta = ammoItemMeta.projectile!;

		const aimVector = this.GetAimVector(mouse, launchPos, ammoMeta);

		const launchForceData = ProjectileUtil.GetLaunchForceData(launcherItemMeta, aimVector, chargeSec);

		return {
			direction: launchForceData.direction,
			launchPos: launchPos,
			velocity: launchForceData.initialVelocity,
		};
	}

	private GetAimVector(mouse: Mouse, launchPosition: Vector3, ammoMeta: AmmoMeta) {
		// Note: We could probably get more advanced with this calculation but this constant works pretty well.
		// Alternatively, we could calculate the "distance" of the path and choose X percent along that distance.
		const aimDistance = 100;

		const ray = Camera.main.ScreenPointToRay(mouse.GetLocation());
		const scaledDirection = ray.direction.add(new Vector3(0, ammoMeta.yAxisAimAdjust, 0)).mul(aimDistance);
		const targetPoint = ray.origin.add(scaledDirection);

		const adjustedDir = targetPoint.sub(launchPosition);

		return adjustedDir;
	}
}
