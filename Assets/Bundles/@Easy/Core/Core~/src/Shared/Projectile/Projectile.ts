import { Dependency } from "@easy-games/flamework-core";
import { ProjectileController } from "Client/Controllers/Damage/Projectile/ProjectileController";
import { ProjectileService } from "Server/Services/Damage/Projectile/ProjectileService";
import { Entity } from "Shared/Entity/Entity";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Bin } from "Shared/Util/Bin";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal } from "Shared/Util/Signal";
import { SetTimeout } from "Shared/Util/Timer";
import { ProjectileSharedImpl } from "./ProjectileSharedImpl";

export interface ProjectileDto {
	nobId: number;
	itemType: ItemType;
	shooterEntityId?: number;
}

export class Projectile {
	public readonly gameObject: GameObject;
	public readonly itemType: ItemType;
	public readonly shooter: Entity | undefined;
	private destroyed = false;
	private bin = new Bin();

	public readonly OnDestroy = new Signal<void>();
	/**
	 * Fired when the projectile hits something that will destroy it.
	 *
	 * For additional collide information, you should instead listen to either `ClientSignals.ProjectileHit` or `ServerSignals.ProjectileHit`
	 */
	public readonly OnHit = new Signal<[hitPoint: Vector3, collider: Collider]>();

	constructor(private easyProjectile: EasyProjectile, itemType: ItemType, shooter: Entity | undefined) {
		this.gameObject = easyProjectile.gameObject;
		this.itemType = itemType;
		this.shooter = shooter;

		const itemDef = ItemUtil.GetItemMeta(itemType);

		this.bin.Add(
			this.OnDestroy.Connect(() => {
				this.destroyed = true;
			}),
		);

		const onHitConn = easyProjectile.OnHit((event) => {
			const raycastHit = event.raycastHit;
			let hitPoint = raycastHit.point;
			let normal = raycastHit.normal;
			let collider = raycastHit.collider;
			const velocity = event.velocity;

			const ignored = ProjectileSharedImpl.ShouldIgnoreCollision(this, hitPoint, normal, collider);
			if (ignored) return;
			this.OnHit.Fire(hitPoint, collider);

			if (RunUtil.IsServer()) {
				Dependency<ProjectileService>().HandleCollision(this, collider, hitPoint, normal, velocity);
			} else {
				Dependency<ProjectileController>().HandleCollision(this, collider, hitPoint, normal, velocity);
			}
		});
		this.bin.Add(() => Bridge.DisconnectEvent(onHitConn));

		const dw = this.gameObject.GetComponent<DestroyWatcher>();
		const destroyedConn = dw.OnDestroyedEvent(() => {
			this.OnDestroy.Fire();
			this.bin.Clean();
		});
		this.bin.Add(() => {
			Bridge.DisconnectEvent(destroyedConn);
		});

		SetTimeout(itemDef.projectile?.lifetimeSec ?? 60, () => {
			if (!this.destroyed) {
				this.Destroy();
			}
		});
	}

	/**
	 * Get the item type of what launched this projectile
	 */
	public GetLauncherItemType() {
		// launcherItemType being -1 here should return undefined
		return ItemUtil.GetItemTypeFromItemId(this.easyProjectile.launcherItemTypeId);
	}

	public Destroy(): void {
		if (this.destroyed) return;
		this.destroyed = true;
		this.bin.Clean();
		this.OnDestroy.DisconnectAll();
		this.OnHit.DisconnectAll();

		Object.Destroy(this.gameObject);
	}
}
