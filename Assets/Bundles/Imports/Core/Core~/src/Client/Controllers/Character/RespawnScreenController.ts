import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { EntityDeathClientSignal } from "Client/Signals/EntityDeathClientSignal";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { SetInterval } from "Shared/Util/Timer";

@Controller({})
export class RespawnScreenController implements OnStart {
	private respawnBin = new Bin();

	OnStart(): void {
		CoreClientSignals.EntityDeath.Connect((event) => {
			if (event.entity.IsLocalCharacter() && event.respawnTime > 0) {
				this.ShowRespawnScreen(event);
			}
		});

		CoreClientSignals.EntitySpawn.Connect((event) => {
			if (event.entity.IsLocalCharacter()) {
				this.HideRespawnScreen();
			}
		});
	}

	public ShowRespawnScreen(deathSignal: EntityDeathClientSignal): void {
		this.respawnBin.Clean();

		const go = GameObjectUtil.Instantiate(
			AssetBridge.Instance.LoadAsset("Imports/Core/Shared/Resources/Prefabs/UI/DeathScreen.prefab"),
		);
		const refs = go.GetComponent<GameObjectReferences>();
		const topText = refs.GetValue("UI", "TopText") as TMP_Text;
		const bottomText = refs.GetValue("UI", "BottomText") as TMP_Text;

		if (deathSignal.fromEntity) {
			topText.text = ColorUtil.ColoredText(Theme.Red, `Killed by ${deathSignal.fromEntity.GetDisplayName()}`);
		} else {
			topText.text = ColorUtil.ColoredText(Theme.Red, "You Died!");
		}

		const respawnTime = Time.time + deathSignal.respawnTime;
		const UpdateTimer = () => {
			const remaining = math.max(respawnTime - Time.time, 0);
			bottomText.text =
				ColorUtil.ColoredText(Theme.Red, "Respawning in ") +
				ColorUtil.ColoredText(Theme.Aqua, string.format("%.1f", remaining)) +
				ColorUtil.ColoredText(Theme.Red, "s");
		};
		UpdateTimer();
		this.respawnBin.Add(
			SetInterval(0.03, () => {
				UpdateTimer();
			}),
		);

		this.respawnBin.Add(() => {
			GameObjectUtil.Destroy(go);
		});
	}

	public HideRespawnScreen(): void {
		this.respawnBin.Clean();
	}
}
