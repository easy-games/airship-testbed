import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Player } from "@Easy/Core/Shared/Player/Player";

export default class GameManager extends AirshipBehaviour {
	@Header("References")
	public spawnPosition!: Transform;
	public testPrefab!: GameObject;

	@Header("Variables")
	public autoRespawn = true;
	public autoRespawnDelay = 0;

	override Start(): void {
		if (Game.IsServer()) {
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
		if (Game.IsClient()) {
			Airship.loadingScreen.FinishLoading();
		}
	}

	public SpawnPlayer(player: Player): void {
		const character = player.SpawnCharacter(this.spawnPosition.position);
		character.inventory.AddItem(new ItemStack("WoodSword"));
	}
}
