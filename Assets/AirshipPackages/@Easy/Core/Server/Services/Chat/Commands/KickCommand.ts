import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";

export class KickCommand extends ChatCommand {
	constructor() {
		super("kick", [], "/kick <player> [message]");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			player.SendMessage(ChatColor.Red("Invalid usage: /kick <player> [message]"));
			return;
		}

		const target = Airship.Players.FindByFuzzySearch(args[0]);
		if (!target) {
			player.SendMessage(ChatColor.Red("Player not found: " + args[0]));
			return;
		}
		let message = "";
		for (let i = 1; i < args.size(); i++) {
			message += args[i];
			if (i < args.size() - 1) {
				message += " ";
			}
		}
		target.Kick(message);
		Game.BroadcastMessage(player.username + " was kicked.");
	}
}
