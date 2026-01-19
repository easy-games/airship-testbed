import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class HelpCommand extends ChatCommand {
	constructor() {
		super("help", [], "", "Displays information about all commands.");
	}

	public Execute(player: Player, args: string[]): void {
		player.SendMessage("Available chat commands:");

		let hasPermission = player.orgRoleName !== undefined;
		const commands = Airship.Chat.GetCommands();
		for (const com of commands) {
			if (com.requiresPermission && !hasPermission) {
				continue;
			}
			const msg = ColorUtil.ColoredText(
				Theme.yellow,
				"/" + com.commandLabel + ColorUtil.ColoredText(Theme.white, " " + com.usage),
			);
			player.SendMessage(msg);
		}
	}
}
