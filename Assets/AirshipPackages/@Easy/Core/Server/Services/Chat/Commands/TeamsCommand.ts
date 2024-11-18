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
			const teamPlayers = team.GetPlayers();
			let msg = ChatColor.Bold(ChatColor.Color(team.color, team.name + ` (${teamPlayers.size()})`));

			if (teamPlayers.size() > 0) {
				msg += ChatColor.White(": ");
			}

			let i = 0;
			for (let player of teamPlayers) {
				msg += player.username;
				if (i < teamPlayers.size() - 1) {
					msg += ", ";
				}
				i++;
			}
			player.SendMessage(msg);
		}
	}
}
