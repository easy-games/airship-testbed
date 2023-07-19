import { Controller, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ClientSignals } from "Client/ClientSignals";
import { Entity } from "Shared/Entity/Entity";
import { ItemType } from "Shared/Item/ItemType";
import { Projectile } from "Shared/Projectile/Projectile";
import { LayerUtil } from "Shared/Util/LayerUtil";
import { ProjectileCollideClientSignal } from "./ProjectileCollideClientSignal";
import { ProjectileLaunchedClientSignal } from "./ProjectileLaunchedClientSignal";
import { ItemUtil } from "../../../../../Shared/Item/ItemUtil";

@Controller({})
export class ProjectileController implements OnStart {
	private prefabInfoByItemType = new Map<ItemType, { gameObject: GameObject; rigidbody: Rigidbody }>();

	constructor() {
		for (const itemTypeStr of Object.keys(ItemType)) {
			const itemType = itemTypeStr as ItemType;
			const itemMeta = ItemUtil.GetItemMeta(itemType);

			if (itemMeta.Ammo) {
				const projPrefab = AssetBridge.LoadAssetIfExists(
					`Shared/Resources/Prefabs/Projectiles/Ammo/${itemType}.prefab`,
				) as GameObject;

				if (!projPrefab) {
					print(`Unable to find asset for ammoItemType: ${itemType}`);
					continue;
				}

				const rigidbody = projPrefab.GetComponent<Rigidbody>();

				this.prefabInfoByItemType.set(itemType, { gameObject: projPrefab, rigidbody: rigidbody });
			}
		}
	}

	public OnStart(): void {
		ProjectileManager.Instance.onProjectileLaunched((easyProjectile, shooterGO) => {
			const shooterEntity = Entity.FindByGameObject(shooterGO);
			const itemType = ItemUtil.GetItemTypeFromItemId(easyProjectile.itemTypeId);
			if (!itemType) {
				Debug.LogError("Failed to find itemType with id " + easyProjectile.itemTypeId);
				return;
			}
			const projectile = new Projectile(easyProjectile, itemType, shooterEntity);
			ClientSignals.ProjectileLaunched.Fire(new ProjectileLaunchedClientSignal(projectile));
		});
	}

	public HandleCollision(
		projectile: Projectile,
		collider: Collider,
		hitPoint: Vector3,
		normal: Vector3,
		velocity: Vector3,
	): boolean {
		const ammoMeta = ItemUtil.GetItemMeta(projectile.itemType).Ammo!;
		const hitEntity = Entity.FindByCollider(collider);

		// Check if it should be colliding with us.
		if (!LayerUtil.LayerIsInMask(collider.gameObject.layer, ammoMeta.projectileHitLayerMask)) {
			return false;
		}

		const projectileHitSignal = new ProjectileCollideClientSignal(
			projectile,
			hitPoint,
			normal,
			velocity,
			hitEntity,
		);
		ClientSignals.ProjectileCollide.Fire(projectileHitSignal);

		return true;
	}
}
