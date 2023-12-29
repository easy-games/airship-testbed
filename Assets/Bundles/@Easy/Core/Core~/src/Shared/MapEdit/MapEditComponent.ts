import { Dependency } from "@easy-games/flamework-core";
import { LoadingScreenController } from "Client/Controllers/Loading/LoadingScreenController";
import { EntityService } from "Server/Services/Entity/EntityService";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { RunUtil } from "Shared/Util/RunUtil";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

export default class MapEditComponent extends AirshipBehaviour {
	public spawnPosition!: Transform;

	public OnAwake(): void {
		const world = WorldAPI.GetMainWorld()!;
		if (RunUtil.IsServer()) {
			world.LoadWorldFromSaveFile(world.voxelWorld.voxelWorldFile);
			Dependency<PlayerService>().ObservePlayers((p) => {
				Dependency<EntityService>().SpawnPlayerEntity(
					p,
					EntityPrefabType.HUMAN,
					this.spawnPosition.position,
					this.spawnPosition.rotation,
				);
			});
		}

		if (RunUtil.IsClient()) {
			Dependency<LoadingScreenController>().FinishLoading();
		}
	}

	override OnDestroy(): void {}
}
