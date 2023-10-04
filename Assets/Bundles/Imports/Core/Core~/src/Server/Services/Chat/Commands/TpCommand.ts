import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { PlayerService } from "../../Player/PlayerService";

export class TpCommand extends ChatCommand {
	constructor() {
		super("tp");
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

		const pos = targetPlayer.Character?.gameObject.transform.position;
		if (!pos) {
			player.SendMessage("Error: " + targetPlayer.username + " isn't alive.");
			return;
		}

		if (!player.Character) return;

		const humanoid = player.Character.gameObject.GetComponent<EntityDriver>();
		humanoid.Teleport(pos);
		player.SendMessage(
			ColorUtil.ColoredText(Theme.Gray, "Teleported to ") +
				ColorUtil.ColoredText(Theme.Yellow, targetPlayer.username),
		);
	}
}
