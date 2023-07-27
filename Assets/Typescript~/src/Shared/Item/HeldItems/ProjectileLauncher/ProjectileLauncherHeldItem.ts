import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Global/Character/LocalEntityController";
import { Crosshair } from "CoreShared/Crosshair/Crosshair";
import { ItemPlayMode } from "Shared/Entity/Animation/InventoryEntityAnimator";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AmmoMeta, ItemMeta } from "Shared/Item/ItemMeta";
import { ProjectileUtil } from "Shared/Projectile/ProjectileUtil";
import { Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { RunUtil } from "Shared/Util/RunUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { OnLateUpdate } from "Shared/Util/Timer";
import { HeldItem } from "../HeldItem";
import { ItemUtil } from "../../ItemUtil";

export class ProjectileLauncherHeldItem extends HeldItem {
	private chargeBin = new Bin();
	private currentlyCharging = false;
	private startHoldTimeSec = 0;
	private projectileTrajectoryRenderer =
		GameObject.Find("ProjectileTrajectoryRenderer").GetComponent<ProjectileTrajectoryRenderer>();

	protected override OnChargeStart(): void {
		super.OnChargeStart();
		if (!this.meta.ProjectileLauncher) return;

		//Play the items animation  (bow draw)
		this.PlayItemAnimation(0, true);

		if (RunUtil.IsClient()) {
			if (!this.entity.IsLocalCharacter()) return;

			const ammoItemMeta = ItemUtil.GetItemMeta(this.meta.ProjectileLauncher.ammoItemType);
			const ammoMeta = ammoItemMeta.Ammo!;

			if (CanvasAPI.IsPointerOverUI()) return;

			if (!this.HasRequiredAmmo()) return;

			this.chargeBin.Add(Crosshair.AddDisabler());

			this.currentlyCharging = true;

			this.entity.anim?.PlayItemUse(0, ItemPlayMode.HOLD);

			this.startHoldTimeSec = os.clock();

			const mouse = new Mouse();
			const localEntityController = Dependency<LocalEntityController>();
			this.chargeBin.Add(
				OnLateUpdate.ConnectWithPriority(SignalPriority.NORMAL, (deltaTime) => {
					if (this.currentlyCharging) {
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

		this.chargeBin.Add(
			this.entity.OnAdjustMove.Connect((moveModifier) => {
				moveModifier.blockSprint = true;
				moveModifier.speedMultiplier *= 0.4;
			}),
		);
	}

	private HasRequiredAmmo(): boolean {
		if (!this.entity.IsAlive() || !(this.entity instanceof CharacterEntity)) {
			return false;
		}

		const inventory = this.entity.GetInventory();
		const launcherItemMeta = inventory.GetHeldItem()?.GetMeta();
		const nullableProjectileLauncherMeta = launcherItemMeta?.ProjectileLauncher;

		if (nullableProjectileLauncherMeta) {
			const launcherMeta = nullableProjectileLauncherMeta!;

			if (inventory.HasItemType(launcherMeta.ammoItemType)) {
				return true;
			}
		}

		return false;
	}

	protected override TryChargeUse() {
		if (super.TryChargeUse()) {
			return true;
		} else {
			//Not charged up all the way
			this.entity.anim?.StartItemIdle();
			return false;
		}
	}

	protected override OnUseClient(useIndex: number): void {
		super.OnUseClient(useIndex);
		print("On use: " + useIndex);
		if (!this.entity.IsLocalCharacter()) return;

		this.currentlyCharging = false;

		if (CanvasAPI.IsPointerOverUI()) {
			return;
		}

		if (!this.HasRequiredAmmo()) {
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
			this.meta.ProjectileLauncher!.ammoItemType,
			launchData.launchPos,
			launchData.velocity,
		);

		//Play the items animation  (bow shoot)
		this.PlayItemAnimation(1, false);
	}

	public override OnCallToActionEnd(): void {
		super.OnCallToActionEnd();
		this.currentlyCharging = false;
		this.chargeBin.Clean();
		this.projectileTrajectoryRenderer.SetDrawingEnabled(false);
	}

	public override OnUnEquip(): void {
		super.OnUnEquip();
		this.currentlyCharging = false;
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
		const launcherMeta = launcherItemMeta.ProjectileLauncher!;
		const ammoItemMeta = ItemUtil.GetItemMeta(launcherMeta.ammoItemType);
		const ammoMeta = ammoItemMeta.Ammo!;

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
