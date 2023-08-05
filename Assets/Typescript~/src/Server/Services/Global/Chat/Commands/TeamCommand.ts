import { ChatCommand } from "Imports/Core/Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class TeamCommand extends ChatCommand {
	constructor() {
		super("team");
	}
	public Execute(player: Player, args: string[]): void {
		const team = player.GetTeam();
		if (!team) {
			player.SendMessage("You are not on a team.");
			return;
		}

		player.SendMessage(`You are on Team [${team.id}]`);
	}
}
