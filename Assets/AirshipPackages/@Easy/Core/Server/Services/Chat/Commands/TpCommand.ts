import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";

export class TpCommand extends ChatCommand {
	constructor() {
		super("tp", [], "<player>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() !== 1) {
			player.SendMessage("Invalid usage. /tp <Player>");
			return;
		}

		const targetPlayer = Airship.players.FindByFuzzySearch(args[0]);
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

		const lookDir = targetPlayer.character?.movement.GetLookVector();
		player.character.Teleport(pos, lookDir ? Quaternion.LookRotation(lookDir) : undefined);
		player.SendMessage(
			ColorUtil.ColoredText(Theme.gray, "Teleported to ") +
				ColorUtil.ColoredText(Theme.yellow, targetPlayer.username),
		);
	}
}
