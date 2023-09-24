import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SetTimeout } from "Shared/Util/Timer";

@Controller({})
export class ProjectileEffectsController implements OnStart {
	constructor() {}

	OnStart(): void {
		CoreClientSignals.ProjectileCollide.Connect((event) => {
			const itemMeta = ItemUtil.GetItemMeta(event.projectile.itemType);

			if (itemMeta.projectile?.onHitVFXTemplate) {
				const effect = EffectsManager.SpawnEffect(
					itemMeta.projectile?.onHitVFXTemplate,
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

			if ((!event.hitEntity || !itemMeta.projectile?.onHitEntitySound) && itemMeta.projectile?.onHitGroundSound) {
				// Hit ground
				let sound = RandomUtil.FromArray(itemMeta.projectile.onHitGroundSound);
				AudioManager.PlayAtPosition(sound.path, event.hitPosition, sound);
			} else if (
				event.hitEntity &&
				itemMeta.projectile?.onHitEntitySound &&
				event.projectile.shooter?.IsLocalCharacter()
			) {
				// Hit entity
				let sound = RandomUtil.FromArray(itemMeta.projectile.onHitEntitySound);
				AudioManager.PlayGlobal(sound.path, sound);
			}
		});
	}
}
