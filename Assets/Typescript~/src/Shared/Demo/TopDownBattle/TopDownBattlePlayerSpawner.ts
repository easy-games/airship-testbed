import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import TopDownBattleCharacter from "./TopDownBattleCharacter";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class TopDownBattlePlayerSpawner extends AirshipBehaviour {
	public static gameOverEvent: Signal<boolean> = new Signal<boolean>();

	@Header("Templates")
	public characterOutfit?: AccessoryOutfit;

	@Header("References")
	public spawnPosition!: GameObject;

	private bin = new Bin();

	private charactersAlive = 0;

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
					print("Dead GO: " + info.gameObject.name);
					const battleCharacter = info.gameObject.GetAirshipComponent<TopDownBattleCharacter>();

					if (battleCharacter && battleCharacter.character.player) {
						let clientId = battleCharacter.character.player.clientId;
						let livesLeft = TopDownBattleCharacter.extraLives.get(clientId) ?? -1;
						//Check extra lives
						if (livesLeft > 1) {
							print("Character using extra life");

							//Use up an extra life
							TopDownBattleCharacter.extraLives.set(clientId, livesLeft - 1);

							//Respawn after 4 seconds
							task.delay(4, () => {
								print("Character respawn delay");
								if (battleCharacter.character.player) {
									print("Respawning character on death: " + battleCharacter.character.player.userId);
									this.SpawnCharacter(battleCharacter.character.player);
								}
							});
						} else {
							print("Character died!");
							//The character is dead
							this.charactersAlive--;
							//Are all characters dead?
							if (this.charactersAlive <= 0) {
								print("All characters are dead");
								//Trigger the game over state
								task.delay(2, () => {
									TopDownBattlePlayerSpawner.gameOverEvent.Fire(true);
								});
							}
						}
					} else {
						error("Missing TopDownBattleCharacter on character who died");
					}
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
		this.charactersAlive++;
		player.SpawnCharacter(this.spawnPosition.transform.position);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
