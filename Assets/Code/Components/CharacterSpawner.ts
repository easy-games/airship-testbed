import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";

export default class CharacterSpawner extends AirshipBehaviour {
	public spawnPoint!: Transform;
	public delay = 0;

	override Start(): void {
		Airship.loadingScreen.FinishLoading();
		Airship.characterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
		if (Game.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				task.delay(this.delay, () => {
					print("spawning character for player: " + player.username);
					this.SpawnCharacter(player);
				});
			});

			Airship.characters.onCharacterDespawned.Connect(() => {
				print("despawn");
			});

			Airship.damage.onDeath.Connect((damageInfo) => {
				const character = damageInfo.gameObject.GetAirshipComponent<Character>();
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
