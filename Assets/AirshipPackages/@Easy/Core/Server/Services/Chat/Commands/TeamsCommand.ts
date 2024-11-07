import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";

export default class TeamsCommand extends ChatCommand {
	constructor() {
		super("teams");
	}

	public Execute(player: Player, args: string[]): void {
		const teams = Airship.Teams.GetTeams();
		const teamCount = teams.size();

		if (teamCount === 0) {
			player.SendMessage("No teams have been registered.");
			return;
		}

		for (let team of teams) {
			let msg =
				ChatColor.Bold(ChatColor.Color(team.color, team.name + ` (${team.GetPlayers().size()})`)) +
				ChatColor.White(": ");

			let i = 0;
			for (let player of team.GetPlayers()) {
				msg += player.username;
				if (i < teamCount - 1) {
					msg += ", ";
				}
				i++;
			}
			player.SendMessage(msg);
		}
	}
}
