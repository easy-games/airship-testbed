import { Dependency } from "@easy-games/flamework-core";
import { Airship } from "Shared/Airship";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Game } from "Shared/Game";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { TeamService } from "../../Team/TeamService";

export class SetTeamCommand extends ChatCommand {
	constructor() {
		super("setTeam", [], "<player> <team>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments.");
		}

		let username = args[0];
		let teamName = args[1];

		/* Validate target player. */
		const targetPlayer = Airship.players.FindByUsername(username);
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
		Game.BroadcastMessage(
			ColorUtil.ColoredText(Theme.aqua, player.username) +
				ColorUtil.ColoredText(Theme.gray, " added ") +
				ColorUtil.ColoredText(Theme.yellow, targetPlayer.username) +
				ColorUtil.ColoredText(Theme.gray, " to the ") +
				ColorUtil.ColoredText(targetTeam.color, targetTeam.id + " team"),
		);
	}
}
