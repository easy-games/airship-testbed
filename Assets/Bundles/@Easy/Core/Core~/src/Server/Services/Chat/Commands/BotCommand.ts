import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { PlayerService } from "../../Player/PlayerService";

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
			Dependency<PlayerService>().AddBotPlayer();
		}
		player.SendMessage(
			ColorUtil.ColoredText(Theme.green, `Finished spawning ${amount} bot${amount > 1 ? "s" : ""}!`),
		);
	}
}
