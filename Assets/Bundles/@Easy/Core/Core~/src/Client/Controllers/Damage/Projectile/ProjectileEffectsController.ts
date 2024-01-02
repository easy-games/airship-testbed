import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { DamageType } from "Shared/Damage/DamageType";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { SetTimeout } from "Shared/Util/Timer";

@Controller({})
export class ProjectileEffectsController implements OnStart {
	constructor() {}

	OnStart(): void {
		CoreClientSignals.ProjectileCollide.Connect((event) => {
			const itemMeta = ItemUtil.GetItemDef(event.projectile.ItemType);

			if (itemMeta.projectile?.onHitVFXTemplate) {
				const effect = EffectsManager.SpawnBundleEffectById(
					itemMeta.projectile?.onHitVFXTemplate,
					event.hitPosition,
					Vector3.zero,
				);
			}

			const trail = event.projectile.GameObject.transform.Find("Trail");
			if (trail) {
				const pos = trail.position;
				Bridge.SetParentToSceneRoot(trail);
				trail.position = pos;
				SetTimeout(itemMeta.projectile?.destroyTrailImmediately ? 0 : 1, () => {
					Object.Destroy(trail.gameObject);
				});
			}

			// if (event.hitEntity && itemMeta.projectile?.onHitEntitySound) {
			// 	// Hit entity
			// 	let sound = RandomUtil.FromArray(itemMeta.projectile.onHitEntitySound);
			// 	AudioManager.PlayGlobal(sound.path, sound);
			// } else if (itemMeta.projectile?.onHitGroundSound) {
			// 	// Hit ground
			// 	let sound = RandomUtil.FromArray(itemMeta.projectile.onHitGroundSound);
			// 	AudioManager.PlayAtPosition(sound.path, event.hitPosition, sound);
			// }

			// Hit ground
			if (itemMeta.projectile?.onHitGroundSound) {
				let sound = RandomUtil.FromArray(itemMeta.projectile.onHitGroundSound);
				AudioManager.PlayAtPosition(sound.path, event.hitPosition, sound);
			}
		});

		CoreClientSignals.EntityDamage.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			if (event.damageType === DamageType.PROJECTILE && event.fromEntity?.IsLocalCharacter()) {
				AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/Items/Projectiles/BowArrowHitSuccess", {
					volumeScale: 0.3,
				});
			}
		});
	}
}
