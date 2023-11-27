import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { Entity } from "Shared/Entity/Entity";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Projectile } from "Shared/Projectile/Projectile";
import { ProjectileCollideClientSignal } from "./ProjectileCollideClientSignal";
import { ProjectileLaunchedClientSignal } from "./ProjectileLaunchedClientSignal";

@Controller({})
export class ProjectileController implements OnStart {
	private prefabInfoByItemType = new Map<ItemType, { gameObject: GameObject }>();

	constructor() {
		for (const itemTypeStr of ItemUtil.GetItemTypes()) {
			const itemType = itemTypeStr as ItemType;
			const itemMeta = ItemUtil.GetItemMeta(itemType);

			if (itemMeta.projectile) {
				const [, id] = ItemUtil.GetItemTypeComponents(itemType);

				const projPrefab = AssetBridge.Instance.LoadAssetIfExists(
					`Shared/Resources/Prefabs/Projectiles/Ammo/${id}.prefab`,
				) as GameObject;

				if (!projPrefab) {
					print(`Unable to find asset for ammoItemType: ${itemType}`);
					continue;
				}

				// const rigidbody = projPrefab.GetComponent<Rigidbody>();

				this.prefabInfoByItemType.set(itemType, { gameObject: projPrefab });
			}
		}
	}

	public OnStart(): void {
		ProjectileManager.Instance.OnProjectileLaunched((easyProjectile, shooterGO) => {
			const shooterEntity = Entity.FindByGameObject(shooterGO);
			const itemType = ItemUtil.GetItemTypeFromItemId(easyProjectile.itemTypeId);
			if (!itemType) {
				Debug.LogError("Failed to find itemType with id " + easyProjectile.itemTypeId);
				return;
			}
			const projectile = new Projectile(easyProjectile, itemType, shooterEntity);
			CoreClientSignals.ProjectileLaunched.Fire(new ProjectileLaunchedClientSignal(projectile));
		});
	}

	public HandleCollision(
		projectile: Projectile,
		collider: Collider,
		hitPoint: Vector3,
		normal: Vector3,
		velocity: Vector3,
	): boolean {
		const ammoMeta = ItemUtil.GetItemMeta(projectile.itemType).projectile!;
		const hitEntity = Entity.FindByCollider(collider);

		const projectileHitSignal = new ProjectileCollideClientSignal(
			projectile,
			hitPoint,
			normal,
			velocity,
			hitEntity,
		);
		CoreClientSignals.ProjectileCollide.Fire(projectileHitSignal);

		return true;
	}
}
