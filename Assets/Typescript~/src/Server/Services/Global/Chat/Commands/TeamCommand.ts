import { Player } from "Shared/Player/Player";
import { ChatCommand } from "../../../../Commands/ChatCommand";

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
