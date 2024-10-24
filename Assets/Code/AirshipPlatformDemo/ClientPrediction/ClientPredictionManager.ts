import { Game } from "@Easy/Core/Shared/Game";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { PredictionEvents } from "./ClientPredictionEvents";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class ClientPredictionManager extends AirshipBehaviour {
	@Header("Templates")
	public rigidbodyTemplate: GameObject;

	@Header("References")
	public hillSpawnPoint: Transform;
	public bowlSpawnPoint: Transform;

	@Header("Variables")
	public hillRandomVariance = 1;
	public bowlRadius = 5;

	private spawnedBalls: GameObject[] = [];

	private bin = new Bin();

	public Start(): void {
		if (Game.IsClient()) {
			this.bin.Add(
				Keyboard.OnKeyDown(Key.F, (event) => {
					PredictionEvents.OnTestPrediction.client.FireServer(0);
				}),
			);
			this.bin.Add(
				Keyboard.OnKeyDown(Key.G, (event) => {
					PredictionEvents.OnTestPrediction.client.FireServer(1);
				}),
			);
			this.bin.Add(
				Keyboard.OnKeyDown(Key.H, (event) => {
					PredictionEvents.OnTestPrediction.client.FireServer(2);
				}),
			);
		}

		if (Game.IsServer()) {
			this.bin.Add(
				PredictionEvents.OnTestPrediction.server.OnClientEvent((player, i) => {
					switch (math.round(i)) {
						case 0:
							this.DestroyBall();
							break;
						case 1:
							this.SpawnBallOnHill();
							break;
						case 2:
							this.SpawnBallInBowl();
							break;
					}
				}),
			);
		}
	}

	protected OnDestroy(): void {
		this.bin.Clean();
	}

	private SpawnBallOnHill() {
		let go = this.SpawnBall(this.hillSpawnPoint);
		go.transform.position = this.hillSpawnPoint.position.add(
			new Vector3(MathUtil.RandomFloat(-1, 1), 0, MathUtil.RandomFloat(-1, 1)).mul(this.hillRandomVariance),
		);
	}

	private SpawnBallInBowl() {
		let go = this.SpawnBall(this.bowlSpawnPoint);
		go.transform.position = this.bowlSpawnPoint.position.add(
			new Vector3(MathUtil.RandomFloat(-1, 1), 0, MathUtil.RandomFloat(-1, 1)).normalized.mul(this.bowlRadius),
		);
	}

	private SpawnBall(parent: Transform) {
		let go = Instantiate(this.rigidbodyTemplate, parent);
		NetworkServer.Spawn(go);
		this.spawnedBalls.push(go);
		return go;
	}

	private DestroyBall() {
		if (this.spawnedBalls.size() === 0) {
			return;
		}
		Destroy(this.spawnedBalls[0]);
		this.spawnedBalls.remove(0);
	}
}
