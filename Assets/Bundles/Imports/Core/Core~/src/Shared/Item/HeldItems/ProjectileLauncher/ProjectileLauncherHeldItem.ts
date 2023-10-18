import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { Crosshair } from "Shared/Crosshair/Crosshair";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AmmoMeta, ItemMeta, SoundMeta } from "Shared/Item/ItemMeta";
import { ProjectileUtil } from "Shared/Projectile/ProjectileUtil";
import { Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { OnLateUpdate } from "Shared/Util/Timer";
import { AudioManager } from "../../../Audio/AudioManager";
import { ItemUtil } from "../../ItemUtil";
import { HeldItem } from "../HeldItem";

export class ProjectileLauncherHeldItem extends HeldItem {
	private chargeBin = new Bin();
	private startHoldTimeSec = 0;
	private chargeAudioSource: AudioSource | undefined;
	private projectileTrajectoryRenderer =
		GameObject.Find("ProjectileTrajectoryRenderer").GetComponent<ProjectileTrajectoryRenderer>();
	private chargeAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
		"Imports/Core/Shared/Resources/Entity/HumanEntity/HumanAnimations/FP_Generic_Charge.anim",
	);
	private chargeAnimTP = this.chargeAnimFP;

	protected override OnChargeStart(): void {
		if (!this.meta.projectileLauncher) return;
		if (!this.HasRequiredAmmo()) return;

		if (RunUtil.IsClient()) {
			if (CanvasAPI.IsPointerOverUI()) return;
		}

		super.OnChargeStart();

		//Play the draw sound
		//TODO need to make bundles string accessible for when you dont know the exact bundle you are loading

		let sound: SoundMeta | undefined = undefined;
		if (this.meta.projectileLauncher.chargeSound) {
			sound = RandomUtil.FromArray(this.meta.projectileLauncher.chargeSound);
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

		//Play the items animation  (bow draw)
		// this.PlayItemAnimation(0, true);
		this.entity.anim?.PlayClip(this.entity.anim.IsFirstPerson() ? this.chargeAnimFP : this.chargeAnimTP);

		if (RunUtil.IsClient() && this.entity.IsLocalCharacter()) {
			const ammoItemMeta = ItemUtil.GetItemMeta(this.meta.projectileLauncher.ammoItemType);
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
							this.currentItemGOs,
							this.entity,
							localEntityController.IsFirstPerson(),
						);
						const launchData = this.GetLaunchData(this.entity, mouse, this.meta, chargeSec, launchPos);

						this.projectileTrajectoryRenderer.UpdateInfo(
							launchPos,
							launchData.velocity,
							0,
							ammoMeta.gravity,
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
		super.OnChargeEnd();
		this.entity.anim?.StartIdleAnim();
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

		//Play the items animation  (bow shoot)
		this.entity.anim.PlayUseAnim(0);

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
			this.currentItemGOs,
			this.entity,
			Dependency<LocalEntityController>().IsFirstPerson(),
		);
		const launchData = this.GetLaunchData(this.entity, mouse, this.meta, chargeSec, launchPos);
		this.entity.LaunchProjectile(
			this.meta.projectileLauncher!.ammoItemType,
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
