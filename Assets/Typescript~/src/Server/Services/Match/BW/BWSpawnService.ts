import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { DenyRegionService } from "@Easy/Core/Server/Services/Block/DenyRegionService";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";
import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { MatchState } from "Shared/Match/MatchState";
import { BedService } from "../BedService";
import { LoadedMap } from "../Map/LoadedMap";
import { MapService } from "../Map/MapService";
import { MatchService } from "../MatchService";
import { BWService } from "./BWService";

/** Spawn delay on join in seconds. */
const SPAWN_DELAY_ON_JOIN = 0;
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
		private readonly bedService: BedService,
	) {
		ServerSignals.MapLoad.Connect((event) => {
			const position = event.LoadedMap.GetSpawnPlatform();
			const entity = this.entityService.SpawnEntityForPlayer(
				undefined,
				EntityPrefabType.HUMAN,
				position.Position.add(new Vector3(-3, 2, 3)),
			);
			entity.AddHealthbar();
		});

		ServerSignals.MapLoad.Connect((event) => {
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
			CoreServerSignals.PlayerJoin.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
				Task.Delay(SPAWN_DELAY_ON_JOIN, () => {
					const team = event.player.GetTeam();
					print("join team: " + team?.id);
					if (this.matchService.GetState() > MatchState.PRE && team && this.bedService.IsBedDestroyed(team)) {
						this.bwService.EliminatePlayer(event.player);
						return;
					}
					this.SpawnPlayer(event.player);
				});
			});

			CoreServerSignals.EntityDeath.ConnectWithPriority(SignalPriority.LOW, (event) => {
				if (!this.matchService.IsRunning()) return;

				const maxTime = 20 * 60;
				const baseRespawnTime = 3;
				const maxRespawnTime = 7;

				const currentTime = TimeUtil.GetServerTime() - this.matchService.GetMatchStartTime();
				const ratio = math.min(currentTime / maxTime, 1);
				const respawnTime = baseRespawnTime + (maxRespawnTime - baseRespawnTime) * ratio;

				event.respawnTime = respawnTime;
			});

			/* Listen for entity death, respawn if applicable. */
			CoreServerSignals.EntityDeath.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
				if (!this.matchService.IsRunning()) return;
				if (event.entity instanceof CharacterEntity && !this.bwService.winnerDeclared) {
					Task.Delay(event.respawnTime, () => {
						if (event.entity.player && !this.bwService.IsPlayerEliminated(event.entity.player)) {
							this.SpawnPlayer(event.entity.player);
						}
					});
				}
			});

			/* Listen for match start and teleport players. */
			ServerSignals.MatchStart.Connect(() => {
				this.playerService.GetPlayers().forEach((player) => {
					this.TeleportPlayerToSpawn(player);
				});
			});
		});

		CoreServerSignals.BeforeEntitySpawn.Connect((event) => {
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

	public SpawnPlayer(player: Player): void {
		const entity = Dependency<EntityService>().SpawnEntityForPlayer(player, EntityPrefabType.HUMAN);
		entity.AddHealthbar();
	}

	/** Teleports player to match spawn location on match start. */
	public TeleportPlayerToSpawn(player: Player): void {
		/* Teleport to team spawn location. */
		const team = player.GetTeam();
		if (!team) return;
		const teamSpawnPosition = this.mapService.GetLoadedMap()?.GetWorldPosition(team.id + "_spawn");
		if (teamSpawnPosition) {
			const pos = teamSpawnPosition.Position.add(new Vector3(0, 0.2, 0));
			player.character?.Teleport(pos, teamSpawnPosition.Rotation.eulerAngles);
		}
	}
}
