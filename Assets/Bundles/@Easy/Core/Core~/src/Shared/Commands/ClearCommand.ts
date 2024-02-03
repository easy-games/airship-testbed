import { Dependency } from "Shared/Flamework";
import { ChatController } from "Client/Controllers/Chat/ChatController";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";

export class ClearCommand extends ChatCommand {
	constructor() {
		super("clear");
	}

	public Execute(player: Player, args: string[]): void {
		Dependency<ChatController>().ClearChatMessages();
	}
}
