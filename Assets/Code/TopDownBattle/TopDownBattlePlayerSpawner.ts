import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import TopDownBattleCharacter from "./TopDownBattleCharacter";
import TopDownBattleGame, { GameMode } from "./TopDownBattleGame";
import { TopDownBattleEvents } from "./TopDownEvents";
import { TopDownBattle } from "./TopDownEntryPoint";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";

export default class TopDownBattlePlayerSpawner extends AirshipBehaviour {
	@Header("Templates")
	public characterOutfit?: AccessoryOutfit;

	@Header("References")
	public spawnPosition!: GameObject;

	private bin = new Bin();

	private playersAlive = 0;

	public override Awake(): void {}

	override Start(): void {
		if (Game.IsServer()) {
			//Listen to game start event
			print("connecting to signal");
			TopDownBattleEvents.gameModeSignal.Connect((mode) => {
				print("Listening to new game mode: " + mode);
				if (mode === GameMode.GAME) {
					let players = Airship.players.GetPlayers();
					//Track how many players are playing
					this.playersAlive = players.size();
					//Spawn a character for each player
					for (let i = 0; i < this.playersAlive; i++) {
						this.SpawnCharacter(players[i]);
					}
				}
			});

			// Airship.players.onPlayerJoined.Connect((player) => {
			// 	if (player) {
			// 		this.SpawnCharacter(player);
			// 	}
			// });

			this.bin.Add(
				//When a character dies, respawn it
				Airship.damage.onDeath.Connect((info) => {
					print("Dead GO: " + info.gameObject.name);
					const battleCharacter = info.gameObject.GetAirshipComponent<TopDownBattleCharacter>();

					if (battleCharacter) {
						//Use up an extra life
						battleCharacter.LoseLife();

						//If has lives left
						if (battleCharacter.GetRemainingLives() >= 0) {
							//Character used up an extra life

							//Respawn after 4 seconds
							task.delay(4, () => {
								if (battleCharacter.character.player) {
									this.SpawnCharacter(battleCharacter.character.player);
								}
							});
						} else {
							//The player is dead
							this.playersAlive--;
							print("player died. Players remaining: " + this.playersAlive);
							//Are all characters dead?
							if (this.playersAlive <= 0) {
								print("ALL PLAYERS ARE DEAD");
								//All characters are dead
								//Trigger the game over state
								task.delay(2, () => {
									print("Triggering GAME OVER");
									TopDownBattle.LoseGame();
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
				character.inventory.AddItem(new ItemStack("Weapon01"));
			});

			//Turn off the core loading screen
			Airship.loadingScreen.FinishLoading();
		}
	}

	private SpawnCharacter(player: Player) {
		print("spawning character: " + this.playersAlive);
		player.SpawnCharacter(this.spawnPosition.transform.position);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
