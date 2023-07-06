import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { Task } from "Shared/Util/Task";
import { SetTimeout } from "Shared/Util/Timer";
import { World } from "Shared/VoxelWorld/World";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

@Service({})
export class LobbyWorldService implements OnStart {
	constructor(private readonly entityService: EntityService) {
		ServerSignals.PlayerJoin.connect((event) => {
			Task.Spawn(() => {
				this.SpawnPlayer(event.player);
			});
		});

		ServerSignals.EntityDeath.Connect((event) => {
			const player = event.entity.player;
			if (!player) return;

			SetTimeout(1, () => {
				if (player.IsConnected()) {
					this.SpawnPlayer(player);
				}
			});
		});

		const world = WorldAPI.GetMainWorld();
		// const worldBinaryFile = AssetBridge.LoadAsset<VoxelBinaryFile>("Server/Resources/Worlds/to4_sanctum.asset");
		const blockDefines = AssetBridge.LoadAsset<TextAsset>("Shared/Resources/VoxelWorld/BlockDefines.xml");
		// world.LoadWorldFromVoxelBinaryFile(worldBinaryFile, blockDefines);

		world.LoadEmptyWorld(blockDefines, World.SKYBOX);

		const width = 12;
		for (let x = 200; x <= 200 + width; x++) {
			for (let z = 200; z <= 200 + width; z++) {
				const pos = new Vector3(x, 10, z);
				world.PlaceBlock(pos, ItemType.GRASS);
			}
		}
	}

	private GetSpawnPosition(): Vector3 {
		return new Vector3(206, 11, 206);
		// return new Vector3(math.round(107.5 + math.random() * 2 - 1.5), 26, 21.5 + math.random() * 2 - 1.5);
	}

	private SpawnPlayer(player: Player): void {
		this.entityService.SpawnEntityForPlayer(player, EntityPrefabType.HUMAN, this.GetSpawnPosition());
	}

	OnStart(): void {
		print("LobbyWorldService.OnStart");
	}
}
