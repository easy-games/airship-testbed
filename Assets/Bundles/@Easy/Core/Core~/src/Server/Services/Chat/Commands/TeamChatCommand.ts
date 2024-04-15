import { ChatCommand } from "Shared/Commands/ChatCommand";
import { Player } from "Shared/Player/Player";

export class TeamChatCommand extends ChatCommand {
	constructor() {
		super("t");
	}
	public Execute(player: Player, args: string[]): void {
		// const team = player.GetTeam();
		// if (team === undefined) {
		// 	player.SendMessage("You are not on a team.");
		// 	return;
		// }
		// const chatService = Dependency<ChatService>();
		// const rawMessage = args.join(" ");
		// const hex = ColorUtil.ColorToHex(team.color);
		// const message = `<color=${hex}>[<b>TEAM</b>]</color> ${chatService.FormatUserChatMessage(
		// 	player,
		// 	rawMessage,
		// 	chatService.canUseRichText,
		// )}`;
		// for (const teamPlayer of team.GetPlayers()) {
		// 	CoreNetwork.ServerToClient.ChatMessage.server.FireClient(teamPlayer, message, player.clientId);
		// 	CoreNetwork.ServerToClient.ChatMessage.server.FireClient(teamPlayer, rawMessage, player.clientId);
		// }
	}
}
