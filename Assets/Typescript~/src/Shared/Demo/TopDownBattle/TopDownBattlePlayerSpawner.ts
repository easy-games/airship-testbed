import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class TopDownBattlePlayerSpawner extends AirshipBehaviour {
	@Header("Templates")
	public characterOutfit?: AccessoryOutfit;

	@Header("References")
	public spawnPosition!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (Game.IsServer()) {
			//When a player joins, create a character
			Airship.players.ObservePlayers((player) => {
				print("Spawning new joined player: " + player.userId);
				this.SpawnCharacter(player);
			});

			this.bin.Add(
				//When a character dies, respawn it
				Airship.damage.onDeath.Connect((info) => {
					print("Character died!");
					const character = info.gameObject.GetAirshipComponent<Character>();
					//Respawn after 4 seconds
					task.delay(4, () => {
						if (character?.player) {
							print("Respawning character on death: " + character.player.userId);
							this.SpawnCharacter(character.player);
						}
					});
				}),
			);
		}
		if (Game.IsClient()) {
			Airship.characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
				event.jump = false;
				event.sprinting = false;
				event.crouchOrSlide = false;
			});

			//When a character is spawned
			Airship.characters.ObserveCharacters((character) => {
				//when the characters outfit is loaded
				CoreNetwork.ServerToClient.Character.ChangeOutfit.client.OnServerEvent((characterId) => {
					if (character.id === characterId) {
						if (this.characterOutfit) {
							//Manually replace some accessorys
							character.accessoryBuilder.EquipAccessoryOutfit(this.characterOutfit, true);
						}
					}
				});
			});

			//Turn off the core loading screen
			Airship.loadingScreen.FinishLoading();
		}
	}

	private SpawnCharacter(player: Player) {
		player.SpawnCharacter(this.spawnPosition.transform.position);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
