import { CameraController } from "@Easy/Core/Client/Controllers/Camera/CameraController";
import { StaticCameraMode } from "@Easy/Core/Client/Controllers/Camera/DefaultCameraModes/StaticCameraMode";
import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class GameManager extends AirshipBehaviour {
	public spawnPosition!: Transform;

	public override OnAwake(): void {
		print("GameManager.OnAwake");
	}

	override OnStart(): void {
		print("GameManager.OnStart");
		if (RunUtil.IsServer()) {
			Dependency<PlayerService>().ObservePlayers((player) => {
				Dependency<EntityService>().SpawnPlayerEntity(
					player,
					EntityPrefabType.HUMAN,
					this.spawnPosition.position,
				);
			});
		}
		if (RunUtil.IsClient()) {
			Dependency<LocalEntityController>().SetFirstPerson(false);
			Dependency<LocalEntityController>().SetDefaultFirstPerson(false);
			Dependency<LoadingScreenController>().FinishLoading();
			Dependency<CameraController>().SetMode(new StaticCameraMode(new Vector3(), Quaternion.identity));
		}
	}

	override OnDestroy(): void {}
}
