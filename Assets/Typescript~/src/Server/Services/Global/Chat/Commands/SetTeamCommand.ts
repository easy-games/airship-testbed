import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";
import { Dependency } from "@easy-games/flamework-core";
import { PlayerService } from "../../Player/PlayerService";
import { TeamService } from "../../Team/TeamService";

export class SetTeamCommand extends ChatCommand {
	constructor() {
		super("setTeam");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments.");
		}

		const username = args[0];
		const teamName = args[1];

		/* Validate target player. */
		const targetPlayer = Dependency<PlayerService>().GetPlayerFromUsername(username);
		if (!targetPlayer) {
			player.SendMessage(`Invalid username: ${username}`);
			return;
		}

		/* Validate team. */
		const targetTeam = Dependency<TeamService>().GetTeamByName(teamName);
		if (!targetTeam) {
			player.SendMessage(`Invalid team name: ${teamName}`);
			return;
		}

		/* Assign to team. */
		targetTeam.AddPlayer(targetPlayer);
	}
}
