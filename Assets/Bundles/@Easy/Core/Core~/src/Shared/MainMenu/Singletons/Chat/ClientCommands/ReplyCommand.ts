import { DirectMessageController } from "@Easy/Core/Client/ProtectedControllers//Social/DirectMessages/DirectMessageController";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Dependency } from "Shared/Flamework";
import { Player } from "Shared/Player/Player";

export class ReplyCommand extends ChatCommand {
	constructor() {
		super("r", ["reply"]);
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() === 0) {
			player.SendMessage("/r <message>");
			return;
		}

		const friend = Dependency<DirectMessageController>().GetFriendLastMessaged();
		if (friend === undefined) {
			player.SendMessage("Error: Nobody to reply to.");
			return;
		}

		let text = "";
		for (let i = 0; i < args.size(); i++) {
			text += args[i];
			if (i !== args.size() - 1) {
				text += " ";
			}
		}
		Dependency<DirectMessageController>().SendDirectMessage(friend.userId, text);
	}
}
