import { Dependency } from "@easy-games/flamework-core";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { Theme } from "Shared/Util/Theme";
import { ChatService } from "../ChatService";
import { CoreNetwork } from "Shared/CoreNetwork";

export class TeamChatCommand extends ChatCommand {
	constructor() {
		super("t");
	}
	public Execute(player: Player, args: string[]): void {
		const team = player.GetTeam();
		if (team === undefined) {
			player.SendMessage("You are not on a team.");
			return;
		}

		const chatService = Dependency<ChatService>();

		const rawMessage = args.join(" ");

		const hex = ColorUtil.ColorToHex(team.color);
		const message = `<color=${hex}>[<b>TEAM</b>]</color> ${chatService.FormatUserChatMessage(
			player,
			rawMessage,
			chatService.canUseRichText,
		)}`;

		for (const teamPlayer of team.GetPlayers()) {
			CoreNetwork.ServerToClient.ChatMessage.server.FireClient(teamPlayer.clientId, message, player.clientId);
			CoreNetwork.ServerToClient.PlayerChatted.server.FireClient(
				teamPlayer.clientId,
				rawMessage,
				player.clientId,
			);
		}
	}
}
