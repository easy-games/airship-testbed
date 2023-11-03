import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { PlayerService } from "../../Player/PlayerService";

export class TpCommand extends ChatCommand {
	constructor() {
		super("tp", [], "<player>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() !== 1) {
			player.SendMessage("Invalid usage. /tp <Player>");
			return;
		}

		const targetPlayer = Dependency<PlayerService>().GetPlayerFromUsername(args[0]);
		if (!targetPlayer) {
			player.SendMessage("Unable to find player: " + args[0]);
			return;
		}

		const pos = targetPlayer.character?.gameObject.transform.position;
		if (!pos) {
			player.SendMessage("Error: " + targetPlayer.username + " isn't alive.");
			return;
		}

		if (!player.character) return;

		player.character.Teleport(pos, targetPlayer.character?.entityDriver.GetLookVector());
		player.SendMessage(
			ColorUtil.ColoredText(Theme.Gray, "Teleported to ") +
				ColorUtil.ColoredText(Theme.Yellow, targetPlayer.username),
		);
	}
}
