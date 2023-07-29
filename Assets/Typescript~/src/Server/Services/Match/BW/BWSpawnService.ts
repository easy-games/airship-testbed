import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { DenyRegionService } from "Server/Services/Global/Block/DenyRegionService";
import { EntityService } from "Server/Services/Global/Entity/EntityService";
import { PlayerService } from "Server/Services/Global/Player/PlayerService";
import { TeamService } from "Server/Services/Global/Team/TeamService";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { Player } from "Shared/Player/Player";
import { MathUtil } from "Shared/Util/MathUtil";
import { Task } from "Shared/Util/Task";
import { LoadedMap } from "../Map/LoadedMap";
import { MapService } from "../Map/MapService";
import { MatchService } from "../MatchService";
import { BWService } from "./BWService";

/** Spawn delay on join in seconds. */
const SPAWN_DELAY_ON_JOIN = 1;
/** Spawn platform height offset. */
const SPAWN_PLATFORM_HEIGHT_OFFSET = new Vector3(0, 0, 0);

@Service({})
export class BWSpawnService implements OnStart {
	/** Loaded map data. */
	private loadedMap: LoadedMap | undefined;

	constructor(
		private readonly bwService: BWService,
		private readonly playerService: PlayerService,
		private readonly mapService: MapService,
		private readonly matchService: MatchService,
		private readonly entityService: EntityService,
	) {
		ServerSignals.MapLoad.connect((event) => {
			const position = event.LoadedMap.GetSpawnPlatform();
			this.entityService.SpawnEntityForPlayer(
				undefined,
				EntityPrefabType.HUMAN,
				position.Position.add(new Vector3(-3, 2, 3)),
			);
		});

		ServerSignals.MapLoad.connect((event) => {
			for (const team of Dependency<TeamService>().GetTeams()) {
				const spawnPos = this.mapService.GetLoadedMap()?.GetWorldPosition(team.id + "_spawn");
				if (spawnPos) {
					Dependency<DenyRegionService>().CreateDenyRegion(
						MathUtil.FloorVec(spawnPos.Position),
						new Vector3(3, 3, 3),
					);
				}
			}
		});
	}

	OnStart(): void {
		Task.Spawn(() => {
			this.loadedMap = this.mapService.WaitForMapLoaded();
			/* Spawn entity on join. */
			ServerSignals.PlayerJoin.Connect((event) => {
				Task.Delay(SPAWN_DELAY_ON_JOIN, () =>
					Dependency<EntityService>().SpawnEntityForPlayer(event.player, EntityPrefabType.HUMAN),
				);
			});

			/* Listen for entity death, respawn if applicable. */
			ServerSignals.EntityDeath.Connect((event) => {
				if (!this.matchService.IsRunning()) return;
				if (event.entity instanceof CharacterEntity && !this.bwService.winnerDeclared) {
					Task.Delay(event.respawnTime, () => {
						if (event.entity.player && !this.bwService.IsPlayerEliminated(event.entity.player)) {
							Dependency<EntityService>().SpawnEntityForPlayer(
								event.entity.player,
								EntityPrefabType.HUMAN,
							);
						}
					});
				}
			});

			/* Listen for match start and teleport players. */
			ServerSignals.MatchStart.connect(() => {
				this.playerService.GetPlayers().forEach((player) => {
					this.TeleportPlayerOnMatchStart(player);
				});
			});
		});

		ServerSignals.BeforeEntitySpawn.connect((event) => {
			if (this.matchService.IsRunning() && event.player) {
				const team = event.player.GetTeam();
				if (!team) return;
				const teamSpawnPosition = this.mapService.GetLoadedMap()?.GetWorldPosition(team.id + "_spawn");
				if (teamSpawnPosition) {
					const pos = teamSpawnPosition.Position.add(new Vector3(0, 0.2, 0));
					event.spawnPosition = pos;
				}
			}
		});
	}

	/** Teleports player to match spawn location on match start. */
	private TeleportPlayerOnMatchStart(player: Player): void {
		/* Teleport to team spawn location. */
		const team = player.GetTeam();
		if (!team) return;
		const teamSpawnPosition = this.mapService.GetLoadedMap()?.GetWorldPosition(team.id + "_spawn");
		if (teamSpawnPosition) {
			const pos = teamSpawnPosition.Position.add(new Vector3(0, 0.2, 0));
			const humanoid = player.Character?.gameObject.GetComponent<EntityDriver>();
			if (humanoid) {
				humanoid.Teleport(pos);
			}
		}
	}
}
