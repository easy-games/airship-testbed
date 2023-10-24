import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { TeamService } from "Imports/Core/Server/Services/Team/TeamService";
import { Game } from "Imports/Core/Shared/Game";
import { Team } from "Imports/Core/Shared/Team/Team";
import { ColorUtil } from "Imports/Core/Shared/Util/ColorUtil";
import { Theme } from "Imports/Core/Shared/Util/Theme";
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
		}

		Network.ClientToServer.GetAllMatchTeamStats.Server.OnClientEvent((clientId) => {
			Network.ServerToClient.UpdateMatchTeamStats.Server.FireClient(clientId, Object.values(this.teamStatsMap));
		});

		ServerSignals.PlayerEliminated.Connect((event) => {
			const team = event.player.GetTeam();
			if (team) {
				const aliveCount = Dependency<BWService>().GetAlivePlayersOnTeam(team).size();
				this.UpdateTeamStats(team, (stats) => {
					stats.playersRemaining = aliveCount;
				});
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
			if (event.Team) {
				this.userIdToTeamMap.set(event.Player.userId, event.Team);
			}
		});
	}

	public UpdateTeamStats(team: Team, callback: (stats: MatchTeamStatsDto) => void): void {
		const stats = this.teamStatsMap.get(team)!;
		callback(stats);
		Network.ServerToClient.UpdateMatchTeamStats.Server.FireAllClients([stats]);
	}
}
