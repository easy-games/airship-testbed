import { Game } from "@Easy/Core/Shared/Game";
import { NetworkChannel } from "@Easy/Core/Shared/Network/NetworkAPI";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import TopDownBattleEnemySpawner from "./TopDownBattleEnemies/TopDownBattleEnemySpawner";

export enum GameMode {
	IDLE,
	GAME,
	GAME_OVER,
}

export default class TopDownBattleGame extends AirshipBehaviour {
	//There is only one game class so expose it for anyone to access
	public static instance: TopDownBattleGame;

	//Trigger new game modes over the network
	public static gameModeEvent = new RemoteEvent<[gameMode: GameMode]>(NetworkChannel.Reliable, "GameModeEvent");
	//Notify local scripts of game mode changes
	public static gameModeSignal = new Signal<[gameMode: GameMode]>();

	@Header("References")
	public startBtn!: Button;
	public gameOverScreen!: GameObject;

	@Header("Variables")
	public gameDurationInSeconds = 300;

	private enemySpawner!: TopDownBattleEnemySpawner;
	private endGameThread?: thread;
	private currentGameMode: GameMode = GameMode.IDLE;

	public override Awake(): void {
		this.enemySpawner = this.gameObject.GetAirshipComponent<TopDownBattleEnemySpawner>()!;
		TopDownBattleGame.instance = this;
	}

	override Start(): void {
		if (Game.IsServer()) {
			//The server listens to see when a client interacts with the start button
			TopDownBattleGame.gameModeEvent.server.OnClientEvent((player, mode) => {
				this.SetGameMode(mode);
			});
		}

		//The client listens to button clicks
		if (Game.IsClient()) {
			//Listen to the game modes sent from the server
			TopDownBattleGame.gameModeEvent.client.OnServerEvent((mode) => {
				this.SetGameMode(mode);
			});

			CanvasAPI.OnClickEvent(this.startBtn.gameObject, () => {
				//The client tells the server to start the game on click
				TopDownBattleGame.gameModeEvent.client.FireServer(GameMode.GAME);
			});
		}
	}

	//Let other classes determine if a lose condition happens
	public LoseGame() {
		if (this.currentGameMode === GameMode.GAME) {
			this.SetGameMode(GameMode.GAME_OVER);
		}
	}

	private SetGameMode(gameMode: GameMode) {
		print("Entering Game Mode: " + gameMode);
		this.currentGameMode = gameMode;
		if (Game.IsServer()) {
			//The server controls the actual game state
			switch (gameMode) {
				case GameMode.IDLE:
					//RESET THE GAME
					//Clear any remaining enemies
					this.enemySpawner.Reset();
					break;
				case GameMode.GAME:
					//Start spawning enemies
					this.enemySpawner.ToggleSpawning(true);
					//End the game after a set duration
					this.endGameThread = task.delay(this.gameDurationInSeconds, () => {
						this.endGameThread = undefined;
						this.SetGameMode(GameMode.GAME_OVER);
					});
					break;
				case GameMode.GAME_OVER:
					//Cancel the game timeout
					if (this.endGameThread) {
						task.cancel(this.endGameThread);
						this.endGameThread = undefined;
					}
					//Stop Spawning
					this.enemySpawner.ToggleSpawning(false);

					//Reset after 10 seconds
					task.delay(10, () => {
						this.SetGameMode(GameMode.IDLE);
					});
					break;
			}

			//When the server enters a new state, tell ALL clients the new game mode
			TopDownBattleGame.gameModeEvent.server.FireAllClients(gameMode);
		} else if (Game.IsClient()) {
			//Client updates its visual state to match the game mode
			switch (gameMode) {
				case GameMode.IDLE:
					this.startBtn.gameObject.SetActive(true);
					this.gameOverScreen.gameObject.SetActive(false);
					break;
				case GameMode.GAME:
					this.startBtn.gameObject.SetActive(false);
					this.gameOverScreen.gameObject.SetActive(false);
					break;
				case GameMode.GAME_OVER:
					this.startBtn.gameObject.SetActive(false);
					this.gameOverScreen.gameObject.SetActive(true);
					break;
			}
		}

		//Notify other classes about new game mode
		print("notifying game mode: " + gameMode + " count: " + TopDownBattleGame.gameModeSignal.GetConnectionCount());

		TopDownBattleGame.gameModeSignal.Fire(gameMode);
	}
}
