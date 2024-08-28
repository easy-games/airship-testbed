import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class TeamCommand extends ChatCommand {
	constructor() {
		super("team");
	}
	public Execute(player: Player, args: string[]): void {
		if (!player.team) {
			player.SendMessage("You are not on a team.");
			return;
		}

		player.SendMessage(`You are on Team [${player.team.id}]`);
	}
}
