import { OnStart, Service } from "@easy-games/flamework-core";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { Game } from "Shared/Game";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { EntityService } from "../Entity/EntityService";
import { PlayerService } from "../Player/PlayerService";

@Service({})
export class MapEditService implements OnStart {
	private spawnPos = new Vector3(0, 30, 0);
	constructor(private readonly playerService: PlayerService, private readonly entityService: EntityService) {}

	OnStart(): void {
		if (Game.startingScene !== "MapEdit") {
			return;
		}
		this.playerService.ObservePlayers((p) => {
			this.entityService.SpawnPlayerEntity(p, EntityPrefabType.HUMAN, this.spawnPos);
		});

		this.LoadWorld();
	}

	private LoadWorld(): void {
		const world = WorldAPI.GetMainWorld();
		if (!world || !world.voxelWorld.voxelWorldFile) return;
		world.LoadWorld();

		const mapObjects = world.voxelWorld.voxelWorldFile.GetMapObjects();
		for (let i = 0; i < mapObjects.Length; i++) {
			const mapObj = mapObjects.GetValue(i);
			if (mapObj.name === "spawn" || mapObj.name === "1_spawn") {
				this.spawnPos = mapObj.position;
			}
		}
	}
}
