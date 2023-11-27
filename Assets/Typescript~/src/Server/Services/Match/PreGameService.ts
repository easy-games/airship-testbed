import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { MatchState } from "Shared/Match/MatchState";
import { LoadedMap } from "./Map/LoadedMap";
import { WorldPosition } from "./Map/MapPosition";
import { MapService } from "./Map/MapService";
import { MatchService } from "./MatchService";

@Service({})
export class PreGameService implements OnStart {
	/** Loaded map. */
	private loadedMap: LoadedMap | undefined;

	private mapCenter = new Vector3(0, 0, 0);
	private spawnPosition: WorldPosition | undefined;

	constructor(private readonly matchService: MatchService) {}

	OnStart(): void {
		Task.Spawn(() => {
			this.loadedMap = Dependency<MapService>().WaitForMapLoaded();
			this.spawnPosition = this.loadedMap.GetSpawnPlatform();
			this.mapCenter = this.loadedMap.GetCenter().Position;
			this.CreateSpawnPlatform(this.spawnPosition);
		});

		CoreServerSignals.EntityDeath.Connect((event) => {
			event.respawnTime = 0;
			Task.Delay(0, () => {
				if (this.matchService.GetState() === MatchState.PRE && event.entity.player) {
					const entity = Dependency<EntityService>().SpawnEntityForPlayer(
						event.entity.player,
						EntityPrefabType.HUMAN,
					);
					entity.AddHealthbar();
				}
			});
		});

		CoreServerSignals.BeforeEntitySpawn.Connect((event) => {
			if (this.matchService.GetState() === MatchState.PRE && event.player) {
				const pos = this.loadedMap?.GetSpawnPlatform();
				if (pos) {
					event.spawnPosition = pos.Position.add(
						new Vector3(math.random() * 2 - 1, 0.2, math.random() * 2 - 1),
					);
				}
			}
		});

		CoreServerSignals.EntityDamage.Connect((event) => {
			if (this.matchService.GetState() === MatchState.PRE) {
				if (event.damageType === DamageType.VOID) return;

				event.SetCancelled(true);
			}
		});
	}

	/** Creates spawn platform above map. */
	private CreateSpawnPlatform(spawnPlatformPosition: WorldPosition | undefined): void {
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
