import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { ChargingAbilityEndedState } from "@Easy/Core/Shared/Abilities/Ability";
import { AbilityChargeEndEvent, AbilityLogic } from "@Easy/Core/Shared/Abilities/AbilityLogic";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { Tween } from "@Easy/Core/Shared/Tween/Tween";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SpringTween } from "@Easy/Core/Shared/Util/SpringTween";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { Dependency } from "@easy-games/flamework-core";
import { BWSpawnService } from "Server/Services/Match/BW/BWSpawnService";

const RECALL_TRIG_PREFAB_PATH = "@Easy/Core/Shared/Resources/VFX/Yos/Prefab/Recall_trigger.prefab";
const RECALL_LOOP_PREFAB_PATH = "@Easy/Core/Shared/Resources/VFX/Yos/Prefab/Recall_loop.prefab";

export default class RecallAbility extends AbilityLogic {
	private chargeBin = new Bin();

	public override OnEnabled(): void {
		print("Recall ability enabled for", this.entity.GetDisplayName());
	}

	public override OnDisabled(): void {
		print("Recall ability disabled for", this.entity.GetDisplayName());
	}

	public override OnServerTriggered(): void {
		const player = this.entity.player;
		if (player) {
			// Simple tp to spawn :-)
			Dependency<BWSpawnService>().TeleportPlayerToSpawn(player);
		}
	}

	override OnClientChargeBegan(): void {
		{
			const triggerPrefab = AssetBridge.Instance.LoadAsset(RECALL_TRIG_PREFAB_PATH) as Object;
			const effectGo = GameObjectUtil.Instantiate(triggerPrefab);
			effectGo.transform.position = this.entity.GetPosition();
			GameObjectUtil.Destroy(effectGo, 0.3);
		}

		let pitch = 1;
		AudioManager.PlayAtPosition(
			"@Easy/Core/Shared/Resources/Sound/Abilities/Kill_SpiritOrb_Pull_01.ogg",
			this.entity.GetPosition(),
			{
				pitch: pitch,
			},
		);

		// TODO: Ask ben for an actual sound rather than this hacky thing LOL
		const tick = 2;
		let elapsed = 0;
		const soundTween = Tween.Linear(this.configuration.charge!.chargeTimeSeconds, (delta) => {
			elapsed += delta;
			if (elapsed >= tick) {
				elapsed = 0;

				AudioManager.PlayAtPosition(
					"@Easy/Core/Shared/Resources/Sound/Abilities/Kill_SpiritOrb_Pull_01.ogg",
					this.entity.GetPosition(),
					{
						pitch: (pitch += (1 / this.configuration.charge!.chargeTimeSeconds) * 0.03),
					},
				);
			}
		}).Play();

		this.chargeBin.Add(
			SetTimeout(this.configuration.charge!.chargeTimeSeconds, () => {
				soundTween.Cancel();
			}),
		);

		this.chargeBin.Add(() => soundTween.Cancel());

		this.chargeBin.Add(
			SetTimeout(0.25, () => {
				const loopPrefab = AssetBridge.Instance.LoadAsset(RECALL_LOOP_PREFAB_PATH) as Object;
				const effectGo = GameObjectUtil.Instantiate(loopPrefab);
				effectGo.transform.position = this.entity.GetPosition();

				this.chargeBin.Add(() => {
					GameObjectUtil.Destroy(effectGo);
				});
			}),
		);
	}

	override OnClientChargeEnded(event: AbilityChargeEndEvent): void {
		this.chargeBin.Clean(); // cleanup effects

		if (event.endState === ChargingAbilityEndedState.Finished) {
			const triggerPrefab = AssetBridge.Instance.LoadAsset(RECALL_TRIG_PREFAB_PATH) as Object;
			const effectGo = GameObjectUtil.Instantiate(triggerPrefab);
			effectGo.transform.position = this.entity.GetPosition();
			GameObjectUtil.Destroy(effectGo, 0.3);

			this.chargeBin.Add(() => {
				GameObjectUtil.Destroy(effectGo);
			});
		}
	}

	override OnClientTriggered(): void {
		print("client trigger for recall");
	}
}
