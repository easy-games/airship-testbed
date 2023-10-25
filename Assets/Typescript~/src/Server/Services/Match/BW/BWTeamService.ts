import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { TeamService } from "@Easy/Core/Server/Services/Team/TeamService";
import { Game } from "@Easy/Core/Shared/Game";
import { Team } from "@Easy/Core/Shared/Team/Team";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { OnStart, Service } from "@easy-games/flamework-core";
import { MatchService } from "../MatchService";

@Service({})
export class BWTeamService implements OnStart {
	/** Used to place on the same team after re-joining the server */
	private userIdToTeamMap = new Map<string, Team>();

	constructor(private readonly teamService: TeamService, private readonly matchService: MatchService) {}

	OnStart(): void {
		const queueMeta = this.matchService.GetQueueMeta();
		for (const team of queueMeta.teams) {
			const t = new Team(team.name, team.id, team.color);
			this.teamService.RegisterTeam(t);
		}

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
}
