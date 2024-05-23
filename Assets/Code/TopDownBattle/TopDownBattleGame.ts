import { Game } from "@Easy/Core/Shared/Game";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import TopDownBattleEnemySpawner from "./TopDownBattleEnemies/TopDownBattleEnemySpawner";
import { TopDownBattleEvents } from "./TopDownEvents";

export enum GameMode {
	IDLE,
	GAME,
	GAME_OVER,
}

export default class TopDownBattleGame extends AirshipBehaviour {
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
	}

	override Start(): void {
		if (Game.IsServer()) {
			//The server listens to see when a client interacts with the start button
			TopDownBattleEvents.gameModeEvent.server.OnClientEvent((player, mode) => {
				this.SetGameMode(mode);
			});
		}

		//The client listens to button clicks
		if (Game.IsClient()) {
			//Listen to the game modes sent from the server
			TopDownBattleEvents.gameModeEvent.client.OnServerEvent((mode) => {
				this.SetGameMode(mode);
			});

			CanvasAPI.OnClickEvent(this.startBtn.gameObject, () => {
				//The client tells the server to start the game on click
				TopDownBattleEvents.gameModeEvent.client.FireServer(GameMode.GAME);
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

			if (!Game.IsClient()) {
				//When the server enters a new state, tell ALL clients the new game mode
				TopDownBattleEvents.gameModeEvent.server.FireAllClients(gameMode);
			}
		}
		if (Game.IsClient()) {
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

		//Fire on server
		TopDownBattleEvents.gameModeSignal.Fire(gameMode);
	}
}
