import { FriendAPI } from "CoreShared/API/FriendAPI";
import { ChatCommand } from "Server/Services/Global/Chat/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class FriendRequestCommand extends ChatCommand {
	constructor() {
		super("friendRequest", ["fr"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 1) {
			player.SendMessage("Invalid arguments. Usage: /fr <discriminatedUsername>");
			return;
		}

		const discriminatedUsername = args[0];

		FriendAPI.RequestFriendship(discriminatedUsername);

		player.SendMessage(`Friend request sent to: ${discriminatedUsername}`);
	}
}
