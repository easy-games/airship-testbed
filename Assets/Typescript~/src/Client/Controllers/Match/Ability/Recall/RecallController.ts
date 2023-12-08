import { EntityController } from "@Easy/Core/Client/Controllers/Entity/EntityController";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { ChargingAbilityEndedState } from "@Easy/Core/Shared/Abilities/Ability";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { AbilityRegistry } from "@Easy/Core/Shared/Strollers/Abilities/AbilityRegistry";
import { Tween } from "@Easy/Core/Shared/Tween/Tween";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { Controller, OnStart } from "@easy-games/flamework-core";
import { AbilityId } from "Shared/Abilities/AbilityType";

const RECALL_TRIG_PREFAB_PATH = "@Easy/Core/Shared/Resources/VFX/Yos/Prefab/Recall_trigger.prefab";
const RECALL_LOOP_PREFAB_PATH = "@Easy/Core/Shared/Resources/VFX/Yos/Prefab/Recall_loop.prefab";

@Controller({})
export class RecallController implements OnStart {
	constructor(
		private readonly entityController: EntityController,
		private readonly abilityRegistry: AbilityRegistry,
	) {}

	private chargeBin = new Bin();

	OnStart(): void {
		CoreClientSignals.AbilityChargeStarted.Connect((event) => {
			if (event.chargingAbilityDto.abilityId !== AbilityId.RECALL) return;
			const triggerPrefab = AssetBridge.Instance.LoadAsset(RECALL_TRIG_PREFAB_PATH) as Object;
			const effectGo = GameObjectUtil.Instantiate(triggerPrefab);
			const entity = this.entityController.GetEntityByClientId(event.clientId);
			if (!entity) return;
			effectGo.transform.position = entity.GetPosition();
			GameObjectUtil.Destroy(effectGo, 0.6);

			const soundGO = GameObject.Create("RecallAudioSource");
			soundGO.transform.position = entity.GetPosition();
			const sound = soundGO.AddComponent<AudioSource>();
			sound.clip = AssetBridge.Instance.LoadAsset<AudioClip>(
				"@Easy/Core/Shared/Resources/Sound/Abilities/Kill_SpiritOrb_Pull_01.ogg",
			);
			sound.loop = true;
			sound.spatialBlend = 1;
			sound.rolloffMode = AudioRolloffMode.Logarithmic;
			sound.maxDistance = 200;
			sound.Play();

			// TODO: Ask ben for an actual sound
			const tick = 0.022;
			let elapsed = 0;
			const soundTween = Tween.InElastic(event.chargingAbilityDto.length, (delta) => {
				elapsed += delta;
				if (elapsed >= tick) {
					elapsed = 0;

					if (sound) {
						sound.pitch = sound.pitch + 0.1;
					}
				}
			}).Play();

			this.chargeBin.Add(
				SetTimeout(event.chargingAbilityDto.length, () => {
					soundTween.Cancel();
				}),
			);

			this.chargeBin.Add(() => soundTween.Cancel());
			this.chargeBin.Add(() => {
				sound.Stop();
				GameObjectUtil.Destroy(soundGO);
			});

			this.chargeBin.Add(
				SetTimeout(0.25, () => {
					const loopPrefab = AssetBridge.Instance.LoadAsset(RECALL_LOOP_PREFAB_PATH) as Object;
					const effectGo = GameObjectUtil.Instantiate(loopPrefab);
					const entity = this.entityController.GetEntityByClientId(event.clientId);
					if (!entity) return;
					effectGo.transform.position = entity.GetPosition();

					this.chargeBin.Add(() => {
						GameObjectUtil.Destroy(effectGo);
					});
				}),
			);
		});

		CoreClientSignals.AbilityChargeEnded.Connect((event) => {
			if (event.chargingAbilityDto.abilityId !== AbilityId.RECALL) return;
			if (event.chargingAbilityDto.endState === ChargingAbilityEndedState.Finished) {
				const triggerPrefab = AssetBridge.Instance.LoadAsset(RECALL_TRIG_PREFAB_PATH) as Object;
				const effectGo = GameObjectUtil.Instantiate(triggerPrefab);
				const entity = this.entityController.GetEntityByClientId(event.clientId);
				if (!entity) return;
				effectGo.transform.position = entity.GetPosition();
				GameObjectUtil.Destroy(effectGo, 0.3);
			}

			this.chargeBin.Clean(); // cleanup effects
		});
	}
}
