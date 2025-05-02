import { ProtectedPartyController } from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Airship } from "@Easy/Core/Shared/Airship";
import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { ChatColor } from "@Easy/Core/Shared/Util/ChatColor";

export class PartyCommand extends ChatCommand {
	constructor() {
		super("party", [], "<add> <player>");
	}

	public Execute(player: Player, args: string[]): void {
		if (args.size() < 2) {
			player.SendMessage(ChatColor.Red("Usage: /party <add | remove> <player>"));
			return;
		}

		const action = args[0].lower();
		const targetPlayerName = args[1];
		const targetPlayer = Airship.Players.FindByFuzzySearch(targetPlayerName);
		if (!targetPlayer) {
			player.SendMessage(ChatColor.Red("Player not found: " + targetPlayerName));
			return;
		}

		if (action === "add") {
			Dependency<ProtectedPartyController>().InviteToParty(targetPlayer.userId);
		} else if (action === "remove") {
			Dependency<ProtectedPartyController>().RemoveFromParty(targetPlayer.userId);
		} else {
			player.SendMessage(ChatColor.Red("Usage: /party <add | remove> <player>"));
		}
	}
}
