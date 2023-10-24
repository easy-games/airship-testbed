import { OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { PlayerService } from "Imports/Core/Server/Services/Player/PlayerService";
import { MapUtil } from "Imports/Core/Shared/Util/MapUtil";
import { PlayerMatchStats, PlayerMatchStatsDto } from "Shared/MatchStats/PlayerMatchStats";
import { Network } from "Shared/Network";

@Service({})
export class MatchStatService implements OnStart {
	private matchStats = new Map<string, PlayerMatchStats>();

	constructor(private readonly playerService: PlayerService) {}

	OnStart(): void {
		this.playerService.ObservePlayers((p) => {
			if (!this.matchStats.has(p.userId)) {
				this.GetMatchStats(p.userId);
			}

			let stats: PlayerMatchStatsDto[] = [];
			for (const userId of Object.keys(this.matchStats)) {
				stats.push({
					...this.matchStats.get(userId)!,
					userId: userId,
				});
			}
			Network.ServerToClient.PlayerMatchStats.Server.FireClient(p.clientId, stats);
		});

		CoreServerSignals.EntityDeath.Connect((event) => {
			if (event.killer?.player && event.entity.player && event.killer !== event.entity) {
				this.GetMatchStats(event.killer.player.userId).kills++;
				this.GetMatchStats(event.entity.player.userId).deaths++;
			}
		});
	}

	public GetMatchStats(userId: string): PlayerMatchStats {
		return MapUtil.GetOrCreate(this.matchStats, userId, {
			kills: 0,
			deaths: 0,
		});
	}
}
