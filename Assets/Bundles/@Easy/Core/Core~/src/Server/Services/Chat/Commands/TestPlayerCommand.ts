import { Dependency } from "@easy-games/flamework-core";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { PlayerUtils } from "Shared/Util/PlayerUtils";

export class PlayersCommand extends ChatCommand {
	constructor() {
		super("players");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() > 0) {
			const [matchPlayers] = args;
			const matchPlayer = PlayerUtils.FuzzyFindPlayerByName(
				Dependency<PlayerService>().GetPlayers(),
				matchPlayers,
			);

			if (matchPlayer !== undefined) {
				player.SendMessage(`matching player: ${matchPlayer.username}#${matchPlayer.usernameTag}`);
			} else {
				player.SendMessage(`no matching player`);
			}
		}
	}
}
