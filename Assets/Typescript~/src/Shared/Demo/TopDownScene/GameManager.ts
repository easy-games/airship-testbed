import { CharacterCameraMode } from "@Easy/Core/Client/Controllers/Character/CharacterCameraMode";
import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
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
			Dependency<LocalEntityController>().SetFirstPerson(true);
			Dependency<LocalEntityController>().SetDefaultFirstPerson(true);
			Dependency<LocalEntityController>().SetCharacterCameraMode(CharacterCameraMode.LOCKED);
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
		const character = player.SpawnCharacter(this.spawnPosition.position);
		character.inventory.AddItem(new ItemStack(ItemType.WOOD_SWORD));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
