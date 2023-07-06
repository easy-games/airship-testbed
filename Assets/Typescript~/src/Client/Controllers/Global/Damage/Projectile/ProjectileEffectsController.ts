import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { EntityController } from "Client/Controllers/Global/Entity/EntityController";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { Network } from "Shared/Network";
import {
	BundleGroupNames,
	Bundle_Projectiles,
	Bundle_Projectiles_OnHitVFX,
} from "Shared/Util/ReferenceManagerResources";
import { SoundUtil } from "Shared/Util/SoundUtil";
import { SetTimeout } from "Shared/Util/Timer";
import { ProjectileController } from "./ProjectileController";

@Controller({})
export class ProjectileEffectsController implements OnStart {
	constructor(
		private readonly entityController: EntityController,
		private readonly projectileController: ProjectileController,
	) {}

	OnStart(): void {
		ClientSignals.ProjectileCollide.Connect((event) => {
			const effect = EffectsManager.SpawnBundleEffect(
				BundleGroupNames.Projectiles,
				Bundle_Projectiles.OnHitVFX,
				Bundle_Projectiles_OnHitVFX.Arrow,
				event.hitPosition,
				Vector3.zero,
			);

			const trail = event.projectile.gameObject.transform.Find("Trail");
			if (trail) {
				const pos = trail.position;
				Bridge.SetParentToSceneRoot(trail);
				trail.position = pos;
				SetTimeout(1, () => {
					Object.Destroy(trail.gameObject);
				});
			}

			const itemMeta = GetItemMeta(event.projectile.itemType);
			if (!event.hitEntity && itemMeta.Ammo?.onHitGroundSoundId) {
				SoundUtil.PlayAtPosition(itemMeta.Ammo.onHitGroundSoundId, event.hitPosition, {
					volumeScale: itemMeta.Ammo.onHitGroundSoundVolume ?? 1,
				});
			}
		});
		Network.ServerToClient.DebugProjectileHit.Client.OnServerEvent((pos) => {
			EffectsManager.SpawnBundleEffect(
				BundleGroupNames.Projectiles,
				Bundle_Projectiles.OnHitVFX,
				Bundle_Projectiles_OnHitVFX.Arrow,
				pos,
				Vector3.zero,
			);
		});
	}
}
