import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";

export default class CharacterSpawner extends AirshipBehaviour {
	public spawnPoint!: Transform;

	override Start(): void {
		Airship.loadingScreen.FinishLoading();
		if (Game.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnCharacter(player);
			});

			Airship.damage.onDeath.Connect((damageInfo) => {
				const character = damageInfo.gameObject.GetAirshipComponent<Character>();
				print("onDeath!");
				task.delay(1.5, () => {
					if (character?.player?.IsConnected()) {
						this.SpawnCharacter(character.player!);
					}
				});
			});
		}
	}

	public SpawnCharacter(player: Player): void {
		const character = player.SpawnCharacter(this.spawnPoint.position, {
			lookDirection: this.spawnPoint.rotation,
		});
	}

	override OnDestroy(): void {}
}
