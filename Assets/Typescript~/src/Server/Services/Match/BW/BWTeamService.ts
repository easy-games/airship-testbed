import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { Game } from "@Easy/Core/Shared/Game";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import ObjectUtils from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { MatchTeamStatsDto } from "Shared/Match/MatchTeamStatsDto";
import { Network } from "Shared/Network";
import { MatchService } from "../MatchService";
import { BWService } from "./BWService";

@Service({})
export class BWTeamService implements OnStart {
	/** Used to place on the same team after re-joining the server */
	private userIdToTeamMap = new Map<string, Team>();
	private teamStatsMap = new Map<Team, MatchTeamStatsDto>();

	constructor(private readonly teamService: TeamService, private readonly matchService: MatchService) {}

	OnStart(): void {
		const queueMeta = this.matchService.GetQueueMeta();
		for (const team of queueMeta.teams) {
			const t = new Team(team.name, team.id, team.color);
			this.teamService.RegisterTeam(t);
			const stats: MatchTeamStatsDto = {
				id: t.id,
				bed: true,
				playersRemaining: 0,
			};
			this.teamStatsMap.set(t, stats);
			this.UpdateTeamAliveCount(t);
		}
		Network.ClientToServer.GetAllMatchTeamStats.Server.OnClientEvent((clientId) => {
			print("sending all stats to client: " + inspect(ObjectUtils.values(this.teamStatsMap)));
			Network.ServerToClient.UpdateMatchTeamStats.Server.FireClient(
				clientId,
				ObjectUtils.values(this.teamStatsMap),
			);
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

		// Temporary: even team distribution
		CoreServerSignals.PlayerJoin.Connect((event) => {
			let assignedTeam: Team | undefined;

			let existing = this.userIdToTeamMap.get(event.player.userId);
			if (existing) {
				existing.AddPlayer(event.player);
				assignedTeam = existing;
			}

			if (!assignedTeam) {
				const teams = this.teamService.GetTeams();
				let smallestTeam = teams[0];

				for (const t of teams) {
					if (t.GetPlayers().size() < smallestTeam.GetPlayers().size()) {
						smallestTeam = t;
					}
				}

				smallestTeam.AddPlayer(event.player);
				assignedTeam = smallestTeam;
			}

			const color = ColorUtil.ColorToHex(assignedTeam.color);
			Game.BroadcastMessage(
				`<b><color=${color}>${event.player.username}</color></b> <color=${ColorUtil.ColorToHex(
					Theme.Gray,
				)}>joined the server.</color>`,
			);
		});

		CoreServerSignals.PlayerLeave.Connect((event) => {
			const team = event.player.GetTeam();
			if (team) {
				const color = ColorUtil.ColorToHex(team.color);
				Game.BroadcastMessage(
					`<b><color=${color}>${event.player.username}</color></b> <color=${ColorUtil.ColorToHex(
						Theme.Gray,
					)}>left the server.</color>`,
				);
			} else {
				Game.BroadcastMessage(
					`<b>${event.player.username}</b> <color=${ColorUtil.ColorToHex(Theme.Gray)}>left.</color>`,
				);
			}
		});

		CoreServerSignals.PlayerChangeTeam.Connect((event) => {
			if (event.team) {
				this.userIdToTeamMap.set(event.player.userId, event.team);
			}
		});
	}

	private UpdateTeamAliveCount(team: Team): void {
		const aliveCount = Dependency<BWService>().GetAlivePlayersOnTeam(team).size();
		this.UpdateTeamStats(team, (stats) => {
			stats.playersRemaining = aliveCount;
		});
	}

	public UpdateTeamStats(team: Team, callback: (stats: MatchTeamStatsDto) => void): void {
		const stats = this.teamStatsMap.get(team)!;
		callback(stats);
		print("firing update team stats: " + inspect(stats));
		Network.ServerToClient.UpdateMatchTeamStats.Server.FireAllClients([stats]);
	}
}
