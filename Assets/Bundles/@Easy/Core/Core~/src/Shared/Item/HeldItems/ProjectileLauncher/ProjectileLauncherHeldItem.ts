// import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
// import { Entity } from "@Easy/Core/Shared/Entity/Entity";
// import { Dependency } from "Shared/Flamework";
// import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
// import { CrosshairController } from "Client/Controllers/Crosshair/CrosshairController";
// import { AmmoDef, ItemDef, SoundDef } from "Shared/Item/ItemDefinitionTypes";
// import { Mouse } from "Shared/UserInput";
// import { Bin } from "Shared/Util/Bin";
// import { CanvasAPI } from "Shared/Util/CanvasAPI";
// import { RandomUtil } from "Shared/Util/RandomUtil";
// import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";
// import { RunUtil } from "Shared/Util/RunUtil";
// import { SignalPriority } from "Shared/Util/Signal";
// import { Task } from "Shared/Util/Task";
// import { OnLateUpdate } from "Shared/Util/Timer";
// import { AudioManager } from "../../../Audio/AudioManager";
// import { ItemUtil } from "../../ItemUtil";
// import { HeldItem } from "../HeldItem";

// const defaultChargeAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
// 	AllBundleItems.ItemThrowable_FirstPerson_Charge,
// );
// const defaultChargeAnimTP = AssetBridge.Instance.LoadAsset<AnimationClip>(
// 	AllBundleItems.ItemThrowable_ThirdPerson_Charge,
// );
// const defaultThrowAnimFP = AssetBridge.Instance.LoadAsset<AnimationClip>(
// 	AllBundleItems.ItemThrowable_FirstPerson_Throw,
// );
// const defaultThrowAnimTP = AssetBridge.Instance.LoadAsset<AnimationClip>(
// 	AllBundleItems.ItemThrowable_ThirdPerson_Throw,
// );

// export class ProjectileLauncherHeldItem extends HeldItem {
// 	private chargeBin = new Bin();
// 	private startHoldTimeSec = 0;
// 	private processChargeAfterCooldown = false;
// 	private chargeAudioSource: AudioSource | undefined;
// 	private projectileTrajectoryRenderer =
// 		GameObject.Find("ProjectileTrajectoryRenderer").GetComponent<ProjectileTrajectoryRenderer>()!;

// 	protected override OnCooldownReset() {
// 		if (this.processChargeAfterCooldown) {
// 			this.processChargeAfterCooldown = false;
// 			this.OnChargeStart();
// 		}
// 	}

// 	protected override OnChargeStart(): void {
// 		if (!this.itemMeta?.projectileLauncher) return;
// 		if (!this.HasRequiredAmmo()) return;

// 		if (RunUtil.IsClient()) {
// 			if (CanvasAPI.IsPointerOverUI()) return;
// 		}

// 		// Don't start charging if on cooldown, but we'll auto-charge after cooldown has passed period
// 		const cooldownTime = this.GetRemainingCooldownTime();
// 		if (cooldownTime > 0) {
// 			if (!this.processChargeAfterCooldown) {
// 				this.processChargeAfterCooldown = true;
// 				if (this.itemMeta?.usable) {
// 					Task.Delay(cooldownTime + 0.01, () => {
// 						this.OnCooldownReset();
// 					});
// 				}
// 				this.Log("OnChargeStartAwaitCooldown");
// 			}
// 			return;
// 		}

// 		super.OnChargeStart();

// 		//Play the draw sound
// 		//TODO need to make bundles string accessible for when you dont know the exact bundle you are loading

// 		let sound: SoundDef | undefined = undefined;
// 		if (this.itemMeta.projectileLauncher.chargeSound) {
// 			sound = RandomUtil.FromArray(this.itemMeta.projectileLauncher.chargeSound);
// 		}

// 		if (sound) {
// 			if (this.character.IsLocalCharacter()) {
// 				this.chargeAudioSource = AudioManager.PlayFullPathGlobal(sound.path, sound);
// 			} else {
// 				this.chargeAudioSource = AudioManager.PlayFullPathAtPosition(
// 					sound.path,
// 					this.character.model.transform.position,
// 					sound,
// 				);
// 			}
// 		}

// 		//Play Charge Animation
// 		this.character.animator.PlayItemUseAnim(0, { autoFadeOut: false });
// 		this.PlayAnimationOnItem(0, true); //ie bow draw string

// 		if (RunUtil.IsClient() && this.character.IsLocalCharacter()) {
// 			const ammoItemMeta = ItemUtil.GetItemDef(this.itemMeta.projectileLauncher.ammoItemType);
// 			const ammoMeta = ammoItemMeta.projectile!;

// 			this.chargeBin.Add(Dependency(CrosshairController).AddDisabler());

// 			this.isCharging = true;

// 			this.startHoldTimeSec = os.clock();

// 			const mouse = new Mouse();
// 			const localEntityController = Dependency<LocalEntityController>();
// 			this.chargeBin.Add(
// 				OnLateUpdate.ConnectWithPriority(SignalPriority.NORMAL, (deltaTime) => {
// 					if (this.isCharging) {
// 						const chargeSec = os.clock() - this.startHoldTimeSec;

// 						const isFirstPerson = localEntityController.IsFirstPerson();
// 						let launcherAccessory = isFirstPerson
// 							? this.activeAccessoriesViewmodel[0]
// 							: this.activeAccessoriesWorldmodel[0];

// 						const launchPos = ProjectileUtil.GetLaunchPosition(
// 							launcherAccessory.rootTransform,
// 							this.character,
// 							isFirstPerson,
// 						);
// 						const launchData = this.GetLaunchData(
// 							this.character,
// 							mouse,
// 							this.itemMeta!,
// 							chargeSec,
// 							launchPos,
// 						);

// 						const powerMul = this.itemMeta?.projectileLauncher?.powerMultiplier ?? 1;
// 						this.projectileTrajectoryRenderer.UpdateInfo(
// 							launchPos,
// 							launchData.velocity,
// 							0,
// 							ammoMeta.gravity / powerMul,
// 						);
// 					}
// 				}),
// 			);
// 			this.chargeBin.Add(() => {
// 				mouse.Destroy();
// 			});
// 		}

// 		if (RunUtil.IsServer() || this.character.IsLocalCharacter()) {
// 			this.chargeBin.Add(
// 				this.character.onAdjustMove.Connect((moveModifier) => {
// 					moveModifier.blockSprint = true;
// 					moveModifier.speedMultiplier *= 0.4;
// 				}),
// 			);
// 		}
// 	}

// 	private HasRequiredAmmo(): boolean {
// 		if (!this.character.IsAlive() || !(this.character instanceof CharacterEntity)) {
// 			return false;
// 		}

// 		const inventory = this.character.GetInventory();
// 		const launcherItemMeta = inventory.GetHeldItem()?.GetMeta();
// 		const nullableProjectileLauncherMeta = launcherItemMeta?.projectileLauncher;

// 		if (nullableProjectileLauncherMeta) {
// 			const launcherMeta = nullableProjectileLauncherMeta!;

// 			if (inventory.HasItemType(launcherMeta.ammoItemType)) {
// 				return true;
// 			}
// 		}

// 		return false;
// 	}

// 	protected override OnChargeEnd(): void {
// 		this.processChargeAfterCooldown = false;
// 		super.OnChargeEnd();
// 		this.character.animator?.StartItemIdleAnim(false);
// 		this.CancelChargeSound();
// 		this.chargeBin.Clean();
// 		this.projectileTrajectoryRenderer.SetDrawingEnabled(false);
// 	}

// 	private CancelChargeSound() {
// 		this.chargeAudioSource?.Stop();
// 	}

// 	protected override OnUseClient(useIndex: number): void {
// 		this.OnChargeEnd();
// 		// if (!this.HasRequiredAmmo()) {
// 		// 	this.OnChargeEnd();
// 		// 	return;
// 		// }

// 		super.OnUseClient(useIndex);

// 		//Play the use animation
// 		this.character.animator.PlayItemUseAnim(1, { fadeInDuration: 0 });

// 		//Play the items animation  (bow shoot)
// 		this.PlayAnimationOnItem(1);

// 		if (!this.character.IsLocalCharacter()) return;

// 		if (CanvasAPI.IsPointerOverUI()) {
// 			return;
// 		}

// 		const chargeSec = os.clock() - this.startHoldTimeSec;

// 		/*
// 		 * All checks passed. Time to FIRE!
// 		 */
// 		this.startHoldTimeSec = -1;

// 		const mouse = new Mouse();
// 		const isFirstPerson = false;
// 		let launcherAccessory = this.activeAccessoriesWorldmodel[0];
// 		if (RunUtil.IsClient() && Dependency<LocalEntityController>().IsFirstPerson()) {
// 			launcherAccessory = this.activeAccessoriesViewmodel[0];
// 		}
// 		const launchPos = ProjectileUtil.GetLaunchPosition(
// 			launcherAccessory.rootTransform,
// 			this.character,
// 			Dependency<LocalEntityController>().IsFirstPerson(),
// 		);
// 		const launchData = this.GetLaunchData(this.character, mouse, this.itemMeta!, chargeSec, launchPos);
// 		this.character.LaunchProjectile(
// 			this.itemMeta!.itemType,
// 			this.itemMeta!.projectileLauncher!.ammoItemType,
// 			launchData.launchPos,
// 			launchData.velocity,
// 		);
// 	}

// 	public override OnCallToActionEnd(): void {
// 		super.OnCallToActionEnd();

// 		this.processChargeAfterCooldown = false;
// 		this.chargeBin.Clean();
// 		this.projectileTrajectoryRenderer.SetDrawingEnabled(false);
// 	}

// 	private GetLaunchData(
// 		entity: Entity,
// 		mouse: Mouse,
// 		launcherItemMeta: ItemDef,
// 		chargeSec: number,
// 		launchPos: Vector3,
// 	): {
// 		direction: Vector3;
// 		launchPos: Vector3;
// 		velocity: Vector3;
// 	} {
// 		const launcherMeta = launcherItemMeta.projectileLauncher!;
// 		const ammoItemMeta = ItemUtil.GetItemDef(launcherMeta.ammoItemType);
// 		const ammoMeta = ammoItemMeta.projectile!;

// 		const aimVector = this.GetAimVector(mouse, launchPos, ammoMeta);

// 		const launchForceData = ProjectileUtil.GetLaunchForceData(launcherItemMeta, aimVector, chargeSec);

// 		return {
// 			direction: launchForceData.direction,
// 			launchPos: launchPos,
// 			velocity: launchForceData.initialVelocity,
// 		};
// 	}

// 	private GetAimVector(mouse: Mouse, launchPosition: Vector3, ammoMeta: AmmoDef) {
// 		// Note: We could probably get more advanced with this calculation but this constant works pretty well.
// 		// Alternatively, we could calculate the "distance" of the path and choose X percent along that distance.
// 		const aimDistance = 100;

// 		const ray = Camera.main.ScreenPointToRay(mouse.GetLocation());
// 		const scaledDirection = ray.direction.add(new Vector3(0, ammoMeta.yAxisAimAdjust, 0)).mul(aimDistance);
// 		const targetPoint = ray.origin.add(scaledDirection);

// 		const adjustedDir = targetPoint.sub(launchPosition);

// 		return adjustedDir;
// 	}
// }
