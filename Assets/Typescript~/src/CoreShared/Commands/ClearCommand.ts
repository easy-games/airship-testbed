import { FriendAPI } from "CoreShared/API/FriendAPI";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";
import { ChatController } from "Client/Controllers/Global/Chat/ChatController";
import { Dependency } from "@easy-games/flamework-core";

export class ClearCommand extends ChatCommand {
	constructor() {
		super("clear");
	}

	public Execute(player: Player, args: string[]): void {
		Dependency<ChatController>().ClearChatMessages();
	}
}
