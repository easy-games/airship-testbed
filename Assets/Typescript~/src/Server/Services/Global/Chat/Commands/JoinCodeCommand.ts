import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";

export class JoinCodeCommand extends ChatCommand {
	constructor() {
		super("joinCode", ["jc"]);
	}
	public Execute(player: Player, args: string[]): void {
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
		const joinCode = serverBootstrap.GetJoinCode();

		player.SendMessage("Join Code: " + joinCode);
	}
}
