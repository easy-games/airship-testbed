import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { Game } from "Shared/Game";
import {
	BundleGroupNames,
	Bundle_Projectiles,
	Bundle_Projectiles_OnHitVFX,
} from "Shared/Util/ReferenceManagerResources";
import { SetTimeout } from "Shared/Util/Timer";
import { ItemUtil } from "../../../../../Shared/Item/ItemUtil";

@Controller({})
export class ProjectileEffectsController implements OnStart {
	constructor() {}

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

			const itemMeta = ItemUtil.GetItemMeta(event.projectile.itemType);
			if (!event.hitEntity && itemMeta.Ammo?.onHitGroundSoundId) {
				AudioManager.PlayAtPosition("ArrowLand/BowArrowHit", event.hitPosition, {
					volumeScale: 0.6,
				});
			}
		});

		ClientSignals.EntityDamage.Connect((event) => {
			if (
				Game.LocalPlayer.Character &&
				event.fromEntity === Game.LocalPlayer.Character &&
				event.damageType === DamageType.PROJECTILE
			) {
				AudioManager.PlayGlobal("HitSuccess", {
					volumeScale: 0.5,
				});
			}
		});
	}
}
