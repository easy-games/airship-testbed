import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

const spawnCubeRemote = new NetworkSignal("SpawnCube");

export default class CubeSpawner extends AirshipBehaviour {
	public serverOwnedCubePrefab: GameObject;

	private bin = new Bin();

	override OnEnable(): void {
		this.bin.Add(
			Keyboard.OnKeyDown(Key.J, (event) => {
				if (event.uiProcessed) return;

				if (Game.IsClient()) {
					spawnCubeRemote.client.FireServer();
				}
			}),
		);

		if (Game.IsServer()) {
			this.bin.Add(
				spawnCubeRemote.server.OnClientEvent((player) => {
					const headPos = player.character!.rig.head.position;
					const lookDir = player.character!.movement!.GetLookVector();
					const cube = Object.Instantiate(
						this.serverOwnedCubePrefab,
						headPos.add(lookDir),
						Quaternion.identity,
					);
					cube.transform.LookAt(cube.transform.position.add(lookDir));
					const rb = cube.GetComponent<Rigidbody>()!;
					rb.velocity = cube.transform.forward.add(new Vector3(0, 2, 0)).mul(2.5);
					NetworkServer.Spawn(cube);
				}),
			);
		}
	}

	override OnDisable(): void {
		this.bin.Clean();
	}
}
