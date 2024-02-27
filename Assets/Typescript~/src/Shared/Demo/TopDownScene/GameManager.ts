import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export default class GameManager extends AirshipBehaviour {
	@Header("References")
	public spawnPosition!: Transform;
	public testPrefab!: GameObject;

	@Header("Variables")
	public autoRespawn = true;
	public autoRespawnDelay = 0;

	override Start(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			Airship.damage.onDeath.Connect((event) => {
				if (!this.autoRespawn) return;
				const player = event.gameObject.GetAirshipComponent<Character>()?.player;
				if (player) {
					task.delay(this.autoRespawnDelay, () => {
						if (player.IsConnected()) {
							this.SpawnPlayer(player);
						}
					});
				}
			});
		}
		if (RunUtil.IsClient()) {
			Airship.loadingScreen.FinishLoading();
		}
	}

	public SpawnPlayer(player: Player): void {
		const character = player.SpawnCharacter(this.spawnPosition.position);
		character.inventory.AddItem(new ItemStack(CoreItemType.WOOD_SWORD));
	}
}
