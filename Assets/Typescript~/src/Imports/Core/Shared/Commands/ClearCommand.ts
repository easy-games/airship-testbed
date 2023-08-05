import { Dependency } from "@easy-games/flamework-core";
import { ChatController } from "Client/Controllers/Global/Chat/ChatController";
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
