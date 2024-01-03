import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class GameManager extends AirshipBehaviour {
	public spawnPosition!: Transform;
	private bin = new Bin();

	public override Awake(): void {
		print("GameManager.OnAwake");
	}

	override Start(): void {
		print("GameManager.OnStart");
		if (RunUtil.IsServer()) {
			Dependency<PlayerService>().ObservePlayers((player) => {
				Dependency<EntityService>().SpawnPlayerEntity(
					player,
					EntityPrefabType.HUMAN,
					this.spawnPosition.position,
				);
			});
			this.bin.Add(
				CoreServerSignals.EntityDeath.Connect((event) => {
					event.respawnTime = 0;
					if (event.entity.player) {
						Dependency<EntityService>().SpawnPlayerEntity(
							event.entity.player,
							EntityPrefabType.HUMAN,
							this.spawnPosition.position,
						);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			Dependency<LocalEntityController>().SetFirstPerson(false);
			Dependency<LocalEntityController>().SetDefaultFirstPerson(false);
			Dependency<LoadingScreenController>().FinishLoading();
		}
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
