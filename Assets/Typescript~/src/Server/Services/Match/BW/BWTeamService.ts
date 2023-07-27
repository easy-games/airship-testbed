import { OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { TeamService } from "Server/Services/Global/Team/TeamService";
import { Game } from "Shared/Game";
import { Team } from "Shared/Team/Team";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { MatchService } from "../MatchService";

@Service({})
export class BWTeamService implements OnStart {
	constructor(private readonly teamService: TeamService, private readonly matchService: MatchService) {}

	OnStart(): void {
		const queueMeta = this.matchService.GetQueueMeta();
		for (const team of queueMeta.teams) {
			const t = new Team(team.name, team.id, team.color);
			this.teamService.RegisterTeam(t);
		}

		// Temporary: even team distribution
		ServerSignals.PlayerJoin.Connect((event) => {
			const teams = this.teamService.GetTeams();
			let smallestTeam = teams[0];

			for (const t of teams) {
				if (t.GetPlayers().size() < smallestTeam.GetPlayers().size()) {
					smallestTeam = t;
				}
			}

			smallestTeam.AddPlayer(event.player);

			const color = ColorUtil.ColorToHex(smallestTeam.color);
			Game.BroadcastMessage(
				`<b><color=${color}>${event.player.username}</color></b> <color=${ColorUtil.ColorToHex(
					Theme.Gray,
				)}>joined the server.</color>`,
			);
		});

		ServerSignals.PlayerLeave.connect((event) => {
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
	}
}
