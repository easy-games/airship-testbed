import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class GameManager extends AirshipBehaviour {
	public spawnPosition!: Transform;
	public testPrefab!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (RunUtil.IsServer()) {
			this.bin.Add(
				Airship.players.ObservePlayers((player) => {
					this.SpawnPlayer(player);
				}),
			);
			this.bin.Add(
				Airship.damage.onDeath.Connect((event) => {
					const player = event.gameObject.GetComponent<Character>()?.player;
					if (player) {
						this.SpawnPlayer(player);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			Dependency<LocalEntityController>().SetFirstPerson(false);
			Dependency<LocalEntityController>().SetDefaultFirstPerson(false);
			Dependency<LoadingScreenController>().FinishLoading();
		}

		// if (RunUtil.IsServer()) {
		// 	for (let i = 0; i < 50; i++) {
		// 		const go = Object.Instantiate<GameObject>(this.testPrefab);
		// 		NetworkUtil.Spawn(go);
		// 	}
		// }
	}

	public SpawnPlayer(player: Player): void {
		player.SpawnCharacter(this.spawnPosition.position);
		// const inv = entity.GetInventory();
		// inv.AddItem(new ItemStack(ItemType.STONE_SWORD));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
