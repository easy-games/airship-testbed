import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { SetTimeout } from "Shared/Util/Timer";

@Controller({})
export class ProjectileEffectsController implements OnStart {
	constructor() {}

	OnStart(): void {
		CoreClientSignals.ProjectileCollide.Connect((event) => {
			const itemMeta = ItemUtil.GetItemMeta(event.projectile.itemType);

			if (itemMeta.ammo?.onHitVFXTemplate) {
				const effect = EffectsManager.SpawnEffect(
					itemMeta.ammo?.onHitVFXTemplate,
					event.hitPosition,
					Vector3.zero,
				);
			}

			const trail = event.projectile.gameObject.transform.Find("Trail");
			if (trail) {
				const pos = trail.position;
				Bridge.SetParentToSceneRoot(trail);
				trail.position = pos;
				SetTimeout(1, () => {
					Object.Destroy(trail.gameObject);
				});
			}

			if (!event.hitEntity && itemMeta.ammo?.onHitGroundSoundId) {
				// Hit ground
				let volume = 0.6;
				if (itemMeta.ammo?.onHitGroundSoundVolume) {
					volume = itemMeta.ammo?.onHitGroundSoundVolume;
				}
				AudioManager.PlayAtPosition(itemMeta.ammo.onHitGroundSoundId, event.hitPosition, {
					volumeScale: volume,
				});
			} else if (event.hitEntity && itemMeta.ammo?.onHitEntitySoundId) {
				// Hit entity
				let volume = 0.6;
				if (itemMeta.ammo?.onHitEntitySoundVolume) {
					volume = itemMeta.ammo?.onHitEntitySoundVolume;
				}
				AudioManager.PlayGlobal(itemMeta.ammo.onHitEntitySoundId, {
					volumeScale: volume,
				});
			}
		});
	}
}
