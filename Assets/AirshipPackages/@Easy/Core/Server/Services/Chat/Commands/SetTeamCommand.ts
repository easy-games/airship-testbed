import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class SetTeamCommand extends ChatCommand {
	constructor() {
		super("setTeam", [], "<player> <team>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() !== 2) {
			player.SendMessage(ChatColor.Red("Invalid arguments. /setteam <player> <team>"));
			return;
		}

		let username = args[0];
		let teamName = args[1];

		/* Validate target player. */
		const targetPlayer = Airship.Players.FindByFuzzySearch(username);
		if (!targetPlayer) {
			player.SendMessage(`Invalid username: ${username}`);
			return;
		}

		/* Validate team. */
		const targetTeam = Airship.Teams.FindByName(teamName);
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
