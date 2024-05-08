import { ClientChatSingleton } from "@Easy/Core/Shared/MainMenu/Singletons/Chat/ClientChatSingleton";
import { Dependency } from "Shared/Flamework";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";

export class ClearCommand extends ChatCommand {
	constructor() {
		super("clear");
	}

	public Execute(player: Player, args: string[]): void {
		Dependency<ClientChatSingleton>().ClearChatMessages();
	}
}
