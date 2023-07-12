import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { MatchState } from "Shared/Match/MatchState";
import { Task } from "Shared/Util/Task";
import { EntityService } from "../Global/Entity/EntityService";
import { LoadedMap } from "./Map/LoadedMap";
import { MapPosition } from "./Map/MapPosition";
import { MapService } from "./Map/MapService";
import { MatchService } from "./MatchService";

@Service({})
export class PreGameService implements OnStart {
	/** Loaded map. */
	private loadedMap: LoadedMap | undefined;

	private mapCenter = new Vector3(0, 0, 0);
	private spawnPosition: MapPosition | undefined;

	constructor(private readonly matchService: MatchService) {}

	OnStart(): void {
		Task.Spawn(() => {
			this.loadedMap = Dependency<MapService>().WaitForMapLoaded();
			this.spawnPosition = this.loadedMap.GetSpawnPlatform()[0];
			this.mapCenter = this.loadedMap.GetCenter()[0].Position ?? new Vector3(0, 0, 0);
			this.CreateSpawnPlatform(this.spawnPosition);
		});

		ServerSignals.EntityDeath.Connect((event) => {
			Task.Delay(0, () => {
				if (this.matchService.GetState() === MatchState.PRE && event.entity.player) {
					Dependency<EntityService>().SpawnEntityForPlayer(event.entity.player, EntityPrefabType.HUMAN);
				}
			});
		});

		ServerSignals.BeforeEntitySpawn.connect((event) => {
			if (this.matchService.GetState() === MatchState.PRE && event.player) {
				const pos = this.loadedMap?.GetSpawnPlatform()[0];
				if (pos) {
					event.spawnPosition = pos.Position.add(new Vector3(0, 0.2, 0)) ?? new Vector3(0, 20, 0);
				}
			}
		});
	}

	/** Creates spawn platform above map. */
	private CreateSpawnPlatform(spawnPlatformPosition: MapPosition | undefined): void {
		const camera = Camera.main;
		if (!camera) return;

		let pos = new Vector3(50, 50, 50);
		if (spawnPlatformPosition) {
			pos = spawnPlatformPosition.Position.add(new Vector3(-20, 20, -20));
			camera.transform.position = pos;
			camera.transform.LookAt(this.mapCenter);
		}
	}
}
