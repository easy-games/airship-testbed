import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { DenyRegionService } from "Imports/Core/Server/Services/Block/DenyRegionService";
import { EntityService } from "Imports/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "Imports/Core/Server/Services/Player/PlayerService";
import { TeamService } from "Imports/Core/Server/Services/Team/TeamService";
import { CharacterEntity } from "Imports/Core/Shared/Entity/Character/CharacterEntity";
import { EntityPrefabType } from "Imports/Core/Shared/Entity/EntityPrefabType";
import { Player } from "Imports/Core/Shared/Player/Player";
import { MathUtil } from "Imports/Core/Shared/Util/MathUtil";
import { Task } from "Imports/Core/Shared/Util/Task";
import { ServerSignals } from "Server/ServerSignals";
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
			CoreServerSignals.PlayerJoin.Connect((event) => {
				Task.Delay(SPAWN_DELAY_ON_JOIN, () => {
					this.SpawnPlayer(event.player);
				});
			});

			/* Listen for entity death, respawn if applicable. */
			CoreServerSignals.EntityDeath.Connect((event) => {
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
					this.TeleportPlayerOnMatchStart(player);
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
