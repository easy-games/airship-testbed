import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { OnStart, Service } from "@easy-games/flamework-core";
import { BedService } from "../BedService";
import { MapService } from "../Map/MapService";
import { MatchService } from "../MatchService";
import { BWService } from "./BWService";

@Service()
export class BWAbilitiesService implements OnStart {
	constructor(
		private readonly bwService: BWService,
		private readonly playerService: PlayerService,
		private readonly mapService: MapService,
		private readonly matchService: MatchService,
		private readonly entityService: EntityService,
		private readonly bedService: BedService,
	) {}

	OnStart(): void {
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
}
