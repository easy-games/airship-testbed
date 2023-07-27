import { FriendAPI } from "CoreShared/API/FriendAPI";
import { Player } from "Shared/Player/Player";
import { ChatCommand } from "./ChatCommand";

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
