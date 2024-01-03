import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OnStart, Service } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import ObjectUtils from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { MatchTeamStatsDto } from "Shared/Match/MatchTeamStatsDto";
import { MatchHudTeamDto } from "Shared/MatchHUD/MatchHUDDto";
import { Network } from "Shared/Network";
import { MatchStatService } from "../MatchStatService";
import { BWService } from "./BWService";

@Service({})
export class BWHudService implements OnStart {
	private teamDataMap = new Map<Team, MatchHudTeamDto>();

	constructor(
		private readonly bwService: BWService,
		private readonly teamService: TeamService,
		private readonly matchStatService: MatchStatService,
	) {}

	OnStart(): void {
		const SetupTeam = (team: Team) => {
			const aliveCount = this.bwService.GetAlivePlayersOnTeam(team).size();
			this.teamDataMap.set(team, {
				playersRemaining: aliveCount,
				bed: true,
				id: team.id,
			});
		};
		CoreServerSignals.TeamAdded.Connect((team) => {
			SetupTeam(team);
		});
		for (const team of this.teamService.GetTeams()) {
			SetupTeam(team);
		}
		Network.ServerToClient.UpdateHud.server.FireAllClients({
			teamUpdates: ObjectUtils.values(this.teamDataMap),
		});

		// ***************** //

		CoreServerSignals.PlayerJoin.ConnectWithPriority(SignalPriority.MONITOR, (event) => {
			const stats = this.matchStatService.GetMatchStats(event.player.userId);
			Network.ServerToClient.UpdateHud.server.FireAllClients({
				teamUpdates: ObjectUtils.values(this.teamDataMap),
				kills: stats.kills,
			});
		});

		ServerSignals.BedDestroyed.Connect((event) => {
			this.UpdateTeamStats(event.team, (stats) => {
				stats.bed = false;
			});
		});

		CoreServerSignals.PlayerChangeTeam.Connect((event) => {
			if (event.team) {
				this.UpdateTeamAliveCount(event.team);
			}
			if (event.oldTeam) {
				this.UpdateTeamAliveCount(event.oldTeam);
			}
		});

		CoreServerSignals.PlayerLeave.Connect((event) => {
			const team = event.player.GetTeam();
			if (team) {
				this.UpdateTeamAliveCount(team);
			}
		});

		ServerSignals.PlayerEliminated.Connect((event) => {
			const team = event.player.GetTeam();
			if (team) {
				this.UpdateTeamAliveCount(team);
			}
		});
	}

	private UpdateTeamAliveCount(team: Team): void {
		const aliveCount = this.bwService.GetAlivePlayersOnTeam(team).size();
		this.UpdateTeamStats(team, (stats) => {
			stats.playersRemaining = aliveCount;
		});
	}

	public UpdateTeamStats(team: Team, callback: (stats: MatchTeamStatsDto) => void): void {
		const stats = this.teamDataMap.get(team)!;
		callback(stats);
		print("firing update team stats: " + inspect(stats));
		Network.ServerToClient.UpdateHud.server.FireAllClients({
			teamUpdates: [stats],
		});
	}
}
