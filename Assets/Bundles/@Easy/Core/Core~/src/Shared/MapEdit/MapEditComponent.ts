import { Dependency, Flamework } from "@easy-games/flamework-core";
import { LoadingScreenController } from "Client/Controllers/Loading/LoadingScreenController";
import { EntityService } from "Server/Services/Entity/EntityService";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { RunUtil } from "Shared/Util/RunUtil";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

export default class MapEditComponent extends AirshipBehaviour {
	public spawnPosition!: Transform;

	public OnAwake(): void {
		print("MapEdit.OnAwake");
		const world = WorldAPI.GetMainWorld()!;
		if (RunUtil.IsServer()) {
			world.LoadWorldFromSaveFile(world.voxelWorld.voxelWorldFile);
			Flamework.Ignite();
		} else {
			// world.LoadEmptyWorld(World.SKYBOX);
			Flamework.Ignite();
			Dependency<LoadingScreenController>().FinishLoading();
		}

		if (RunUtil.IsServer()) {
			Dependency<PlayerService>().ObservePlayers((p) => {
				Dependency<EntityService>().SpawnPlayerEntity(
					p,
					EntityPrefabType.HUMAN,
					this.spawnPosition.position,
					this.spawnPosition.rotation,
				);
			});
		}
	}

	public OnEnabled(): void {
		print("MapEdit.OnEnabled");
	}

	override OnStart(): void {
		print("MapEdit.OnStart");

		// const world = WorldAPI.GetMainWorld()!;
		// if (RunUtil.IsServer()) {
		// 	world.LoadWorldFromSaveFile(world.voxelWorld.voxelWorldFile);
		// 	Flamework.Ignite();
		// } else {
		// 	world.LoadEmptyWorld(World.SKYBOX);
		// 	Flamework.Ignite();
		// 	Dependency<LoadingScreenController>().FinishLoading();
		// }
		print("Finished MapEdit setup.");
	}

	override OnDestroy(): void {}
}
