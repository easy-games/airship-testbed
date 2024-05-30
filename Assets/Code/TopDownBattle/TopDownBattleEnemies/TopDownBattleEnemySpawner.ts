import { Game } from "@Easy/Core/Shared/Game";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import TopDownBattleEnemy from "./TopDownBattleEnemy";

export default class TopDownBattleEnemySpawner extends AirshipBehaviour {
	@Header("Templates")
	public enemyTemplate!: GameObject;

	@Header("Variables")
	public minSpawnRadius = 10;
	public maxSpawnRadius = 35;
	public spawnDelayInSeconds = 10;
	public spawnQuantity = 5;

	private lastSpawnTime = 0;
	private isSpawning = false;
	private activeEnemies: TopDownBattleEnemy[] = [];

	//Ovveride update to run code every frame
	override Update() {
		//The server controls the actual spawning
		if (Game.IsServer() && this.isSpawning) {
			//Spawn enemies over time
			if (Time.time - this.lastSpawnTime > this.spawnDelayInSeconds) {
				//Save the time we are spawning
				this.lastSpawnTime = Time.time;
				for (let i = 0; i < this.spawnQuantity; i++) {
					this.SpawnEnemy();
				}
			}
		}
	}

	public Reset() {
		//Destroy every remaining enemy
		this.activeEnemies.forEach((enemy) => {
			//Make sure the enemy hasn't despawned
			if (enemy && enemy.gameObject) {
				NetworkUtil.Despawn(enemy.gameObject);
			}
		});
	}

	public ToggleSpawning(spawnOn: boolean) {
		//The server controls the actual spawning
		if (Game.IsServer()) {
			//Spawn enemies over time
			this.isSpawning = spawnOn;
			this.activeEnemies.forEach((enemy) => {
				//Make sure the enemy hasn't despawned
				if (enemy && enemy.gameObject) {
					enemy.SetEnabled(false);
				}
			});
		}
	}

	public SpawnEnemy() {
		//Get a valid spawn position and look towards the center of the map
		let newPos = this.GetEnemySpawnPosition();
		let newRot = Quaternion.LookRotation(newPos.mul(-1));

		//Spawn an enemy on the server
		let enemy = Object.Instantiate<GameObject>(
			this.enemyTemplate,
			newPos,
			newRot,
		).GetAirshipComponent<TopDownBattleEnemy>();
		if (!enemy) {
			error("Enemy prefab template is missing TopDownBattleEnemy Airship Component");
		}

		//Replicate the object for all players
		NetworkUtil.Spawn(enemy.gameObject);

		this.activeEnemies.push(enemy);
	}

	private GetEnemySpawnPosition() {
		//Keep a counter so we don't infinitly loop
		let count = 0;
		let newPos = Vector3.zero;
		do {
			//Randomly find a spawn point
			//Use a min radius so enemies don't spawn right next to your base
			newPos = new Vector3(
				MathUtil.RandomFloat(this.minSpawnRadius, this.maxSpawnRadius) * MathUtil.RandomSign(),
				0,
				MathUtil.RandomFloat(this.minSpawnRadius, this.maxSpawnRadius) * MathUtil.RandomSign(),
			);

			count++;
			if (count > 50) {
				error("Unable to find a valid spawn point");
			}
			//Make sure the space isn't occupied by a block
		} while (WorldAPI.GetMainWorld()?.IsBlockOccupiedAt(newPos));
		return newPos;
	}
}
