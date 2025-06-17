import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";

export class TeamCommand extends ChatCommand {
	constructor() {
		super("team");
	}
	public Execute(player: Player, args: string[]): void {
		if (!player.team) {
			player.SendMessage("You are not on a team.");
			return;
		}

		player.SendMessage(`[Team] You are on ${ChatColor.Color(player.team.color, ChatColor.Bold(player.team.id))}`);
	}
}
