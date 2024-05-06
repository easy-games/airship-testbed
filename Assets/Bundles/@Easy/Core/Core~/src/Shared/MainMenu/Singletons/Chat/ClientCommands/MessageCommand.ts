import { DirectMessageController } from "@Easy/Core/Client/ProtectedControllers//Social/DirectMessages/DirectMessageController";
import { FriendsController } from "@Easy/Core/Client/ProtectedControllers//Social/FriendsController";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Dependency } from "Shared/Flamework";
import { Player } from "Shared/Player/Player";

export class MessageCommand extends ChatCommand {
	constructor() {
		super("msg", ["message"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			player.SendMessage("/msg <friend> <message>");
			return;
		}

		const friend = Dependency<FriendsController>().GetFriendByUsername(args[0]);
		if (friend === undefined) {
			player.SendMessage(`Unable to find friend "${args[0]}"`);
			return;
		}

		let text = "";
		for (let i = 1; i < args.size(); i++) {
			text += args[i];
			if (i !== args.size() - 1) {
				text += " ";
			}
		}
		Dependency<DirectMessageController>().SendDirectMessage(friend.uid, text);
	}
}
