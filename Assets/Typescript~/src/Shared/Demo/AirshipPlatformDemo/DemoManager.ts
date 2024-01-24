import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			this.bin.Add(
				Airship.damage.onDeath.Connect((damageInfo) => {
					const player = damageInfo.gameObject.GetComponent<Character>()?.player;
					if (player) {
						this.SpawnPlayer(player);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			Dependency<LoadingScreenController>().FinishLoading();
		}
	}

	public SpawnPlayer(player: Player): void {
		const character = player.SpawnCharacter(this.spawnPosition.transform.position);
		// const inv = entity.GetInventory();
		// inv.AddItem(new ItemStack(ItemType.STONE_SWORD));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
