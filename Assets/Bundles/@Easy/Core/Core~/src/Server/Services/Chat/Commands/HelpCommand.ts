import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { ChatService } from "../ChatService";

export class HelpCommand extends ChatCommand {
	constructor() {
		super("help", [], "", "Displays information about all commands.");
	}

	public Execute(player: Player, args: string[]): void {
		player.SendMessage("Available chat commands:");

		const commands = Dependency<ChatService>().GetCommands();
		for (const com of commands) {
			const msg = ColorUtil.ColoredText(
				Theme.Yellow,
				"/" + com.commandLabel + ColorUtil.ColoredText(Theme.White, " " + com.usage),
			);
			player.SendMessage(msg);
		}
	}
}
