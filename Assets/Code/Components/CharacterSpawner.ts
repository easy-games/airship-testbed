import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CharacterCameraMode } from "@Easy/Core/Shared/Character/LocalCharacter/CharacterCameraMode";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

/**
 * A character spawner with multi-scene support.
 */
export default class CharacterSpawner extends AirshipBehaviour {
	public spawnPoint!: Transform;
	public delay = 0;

	private bin = new Bin();

	override Start(): void {
		Airship.Camera.SetMode(CharacterCameraMode.Locked);
		if (Game.IsServer()) {
			this.bin.Add(
				Airship.Players.onPlayerJoined.Connect((player) => {
					this.SpawnCharacter(player);
				}),
			);

			// this.bin.Add(
			// 	SceneManager.onClientPresenceChangeEnd.Connect(async (clientId, sceneName, added) => {
			// 		if (sceneName !== this.gameObject.scene.name) return;

			// 		let player = await Airship.Players.WaitForPlayerByConnectionId(clientId);
			// 		if (!player) return;

			// 		if (added) {
			// 			// Added to scene
			// 			this.SpawnCharacter(player);
			// 		} else {
			// 			// Removed from scene
			// 			if (player.character) {
			// 				print(`Despawning ${player.username} in scene ${this.gameObject.scene.name}`);
			// 				player.character.Despawn();
			// 			}
			// 		}
			// 	}),
			// );

			this.bin.Add(
				Airship.Damage.onDeath.Connect((damageInfo) => {
					const character = damageInfo.gameObject.GetAirshipComponent<Character>();
					if (character?.gameObject.scene !== this.gameObject.scene) return;

					task.delay(this.delay, () => {
						if (
							character?.player?.IsConnected() &&
							character.player.IsInScene(this.gameObject.scene.name)
						) {
							this.SpawnCharacter(character.player!);
						}
					});
				}),
			);
		}
	}

	protected Update(dt: number): void {
		Airship.Characters.GetCharacters().forEach((character) => {
			if (character.transform.position.y < -25) {
				character.Teleport(this.spawnPoint.transform.position);
			}
		});
	}

	public SpawnCharacter(player: Player): void {
		print(`Spawning ${player.username} in scene ${this.gameObject.scene.name}`);
		player.SpawnCharacter(this.spawnPoint.position, {
			lookDirection: this.spawnPoint.forward,
		});
	}

	override OnDestroy(): void {
		this.bin.Clean();

		for (let player of Airship.Players.GetPlayers()) {
			if (player.character?.gameObject.scene.name === this.gameObject.scene.name) {
				print(`Despawning ${player.username} in scene ${this.gameObject.scene.name}`);
				player.character.Despawn();
			}
		}
	}
}
