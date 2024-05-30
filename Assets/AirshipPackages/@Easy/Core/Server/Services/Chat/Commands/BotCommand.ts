import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class BotCommand extends ChatCommand {
	constructor() {
		super("bot", [], "[amount]");
	}

	public Execute(player: Player, args: string[]): void {
		let amount = 1;
		if (args.size() === 1) {
			let a = tonumber(args[0]);
			if (a === undefined || a <= 0) {
				player.SendMessage("Invalid usage. /bot [amount]");
				return;
			}
			amount = a;
		}

		player.SendMessage(`Spawning ${amount} bot${amount > 1 ? "s" : ""}...`);
		for (let i = 0; i < amount; i++) {
			Airship.players.AddBotPlayer();
		}
		player.SendMessage(
			ColorUtil.ColoredText(Theme.green, `Finished spawning ${amount} bot${amount > 1 ? "s" : ""}!`),
		);
	}
}
