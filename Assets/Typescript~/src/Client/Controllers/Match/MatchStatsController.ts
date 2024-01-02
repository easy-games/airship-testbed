import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { MapUtil } from "@Easy/Core/Shared/Util/MapUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { PlayerMatchStats } from "Shared/Match/PlayerMatchStats";
import { Network } from "Shared/Network";

@Controller({})
export class MatchStatsController implements OnStart {
	private matchStats = new Map<string, PlayerMatchStats>();
	public OnStatsUpdated = new Signal<[userId: string, newStats: PlayerMatchStats, oldStats: PlayerMatchStats]>();

	OnStart(): void {
		Network.ServerToClient.PlayerMatchStats.Client.OnServerEvent((stats) => {
			for (const stat of stats) {
				this.matchStats.set(stat.userId, stat);
			}
		});

		CoreClientSignals.EntityDeath.Connect((e) => {
			if (e.killer?.Player && e.entity.Player && e.entity !== e.killer) {
				this.UpdateMatchStats(e.killer.Player.userId, (stats) => stats.kills++);
				this.UpdateMatchStats(e.entity.Player.userId, (stats) => stats.deaths++);
			}
		});
	}

	public GetMatchStats(userId: string): Readonly<PlayerMatchStats> {
		return MapUtil.GetOrCreate(this.matchStats, userId, {
			kills: 0,
			deaths: 0,
		});
	}

	public UpdateMatchStats(userId: string, updateFunc: (stats: PlayerMatchStats) => void): void {
		const stats = this.GetMatchStats(userId);

		// make a copy
		const before = { ...stats };

		updateFunc(stats);

		this.OnStatsUpdated.Fire(userId, stats, before);
	}
}
