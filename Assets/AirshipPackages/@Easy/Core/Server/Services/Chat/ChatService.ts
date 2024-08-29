import { ChatCommand } from "@Easy/Core/Shared/Commands/ChatCommand";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Player } from "@Easy/Core/Shared/Player/Player";
import StringUtils from "@Easy/Core/Shared/Types/StringUtil";
import { ChatUtil } from "@Easy/Core/Shared/Util/ChatUtil";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import Object from "@Easy/Core/Shared/Util/ObjectUtils";

@Service({})
export class ChatService {
	private commands = new Map<string, ChatCommand>();

	public readonly canUseRichText = true;

	constructor() {}

	public RegisterCommand(command: ChatCommand) {
		this.commands.set(command.commandLabel.lower(), command);
		for (let alias of command.aliases) {
			this.commands.set(alias.lower(), command);
		}
	}

	/**
	 *
	 * @internal
	 * @param player The player
	 * @param message The chat message
	 * @param canRichText Whether or not the chat message allows rich text
	 * @returns
	 */
	public FormatUserChatMessage(player: Player, message: string, canRichText = true): string {
		let username = "<b>" + player.username + "</b>";
		const team = player.team;
		if (team) {
			const hex = ColorUtil.ColorToHex(team.color);
			print("hex: " + hex);
			username = `<color=${hex}>${username}</color>`;
		}
		if (!canRichText) {
			message = "<noparse>" + message + "</noparse>";
		}

		message = username + ": " + message;

		return message;
	}

	protected OnStart(): void {
		CoreNetwork.ClientToServer.SendChatMessage.server.OnClientEvent((player, text) => {
			const rawMessage = text;

			if (StringUtils.startsWith(text, "/")) {
				const commandData = ChatUtil.ParseCommandData(text);

				print(player.username + ": " + text);

				if (commandData) {
					const command = this.commands.get(commandData.label);
					if (command) {
						command.Execute(player, commandData.args);
						return;
					}
				}

				player.SendMessage(`Invalid command: ${text}`);
				return;
			}

			// todo: format name color
			let nameWithPrefix = player.username + ": ";
			// let message = this.FormatUserChatMessage(player, text, this.canUseRichText);
			CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients(
				rawMessage,
				nameWithPrefix,
				player.connectionId,
			);
		});
	}

	public GetCommands(): ChatCommand[] {
		return Object.values(this.commands);
	}
}
