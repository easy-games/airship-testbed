import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";

@Service({})
export class LobbyWorldService implements OnStart {
	public SpawnPos = new Vector3(0, 0, 0);
	public SpawnPosRot = Quaternion.identity;

	constructor(private readonly entityService: EntityService) {
		CoreServerSignals.PlayerJoin.Connect((event) => {
			Task.Spawn(() => {
				this.SpawnPlayer(event.player);
			});
		});

		CoreServerSignals.EntityDeath.Connect((event) => {
			const player = event.entity.Player;
			if (!player) return;

			SetTimeout(1, () => {
				if (player.IsConnected()) {
					this.SpawnPlayer(player);
				}
			});
		});

		const world = WorldAPI.GetMainWorld();
		const worldBinaryFile = AssetBridge.Instance.LoadAsset<WorldSaveFile>("Server/Resources/Worlds/Lobby.asset");
		world!.LoadWorldFromSaveFile(worldBinaryFile);

		const mapObjects = worldBinaryFile.GetMapObjects();
		for (let i = 0; i < mapObjects.Length; i++) {
			const mapObj = mapObjects.GetValue(i);
			if (mapObj.name === "spawn") {
				this.SpawnPos = mapObj.position;
				this.SpawnPosRot = mapObj.rotation;
			}
		}
	}

	private SpawnPlayer(player: Player): void {
		this.entityService.SpawnPlayerEntity(player, EntityPrefabType.HUMAN, this.SpawnPos);
	}

	OnStart(): void {}
}
