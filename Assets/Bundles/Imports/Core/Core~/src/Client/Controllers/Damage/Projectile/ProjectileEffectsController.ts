import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { Game } from "Shared/Game";
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

			let hitSoundName = "";
			if (!event.hitEntity && itemMeta.ammo?.onHitGroundSoundId) {
				hitSoundName = itemMeta.ammo?.onHitGroundSoundId;
			} else if (event.hitEntity && itemMeta.ammo?.onHitEntitySoundId) {
				hitSoundName = itemMeta.ammo?.onHitEntitySoundId;
			}

			if (hitSoundName !== "") {
				let volume = 0.6;
				const hitSoundPath = `Imports/Core/Shared/Resources/Sound/Items/Projectiles/${hitSoundName}`;
				if (itemMeta.ammo?.onHitSoundVolume) {
					volume = itemMeta.ammo?.onHitSoundVolume;
				}
				if (Game.LocalPlayer.Character && event.projectile.shooter === Game.LocalPlayer.Character) {
					AudioManager.PlayGlobal(hitSoundPath, {
						volumeScale: volume,
					});
				} else {
					AudioManager.PlayAtPosition(hitSoundPath, event.hitPosition, {
						volumeScale: volume,
					});
				}
			}
		});
	}
}
