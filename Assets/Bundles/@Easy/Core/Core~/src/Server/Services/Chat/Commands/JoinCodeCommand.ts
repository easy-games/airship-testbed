import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";

export class JoinCodeCommand extends ChatCommand {
	constructor() {
		super("joinCode", ["jc"]);
	}
	public Execute(player: Player, args: string[]): void {
		const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
		const joinCode = serverBootstrap.GetJoinCode();

		player.SendMessage("Join Code: " + joinCode);
	}
}
