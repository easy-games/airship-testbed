import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { SceneManager } from "@Easy/Core/Shared/SceneManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class CharacterSpawner extends AirshipBehaviour {
	public spawnPoint!: Transform;
	public delay = 0;

	private bin = new Bin();

	override Start(): void {
		Airship.loadingScreen.FinishLoading();
		Airship.characterCamera.SetCharacterCameraMode(CharacterCameraMode.Locked);
		if (Game.IsServer()) {
			this.bin.Add(
				Airship.players.ObservePlayers((player) => {
					print("spawn scene: " + SceneManager.GetActiveScene().name);
					this.SpawnCharacter(player);
					task.delay(0, () => {
						print("delay scene: " + SceneManager.GetActiveScene().name);
					});
				}),
			);

			this.bin.Add(
				Airship.characters.onCharacterDespawned.Connect(() => {
					print("despawn");
				}),
			);

			this.bin.Add(
				Airship.damage.onDeath.Connect((damageInfo) => {
					const character = damageInfo.gameObject.GetAirshipComponent<Character>();
					task.delay(1.5, () => {
						if (character?.player?.IsConnected()) {
							this.SpawnCharacter(character.player!);
						}
					});
				}),
			);
		}
	}

	public SpawnCharacter(player: Player): void {
		print("[spawner] spawning player");
		const character = player.SpawnCharacter(this.spawnPoint.position, {
			lookDirection: this.spawnPoint.forward,
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
