import { OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { Airship } from "Shared/Airship";
import { ChatCommand } from "Shared/Commands/ChatCommand";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Player } from "Shared/Player/Player";
import StringUtils from "Shared/Types/StringUtil";
import { ChatUtil } from "Shared/Util/ChatUtil";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { AddInventoryCommand } from "./Commands/AddInventoryCommand";
import { BotCommand } from "./Commands/BotCommand";
import { DamageCommand } from "./Commands/DamageCommand";
import { DieCommand } from "./Commands/DieCommand";
import { GetVarCommand } from "./Commands/DynamicVariables/GetVarCommand";
import { SetVarCommand } from "./Commands/DynamicVariables/SetVarCommand";
import { EntityCommand } from "./Commands/EntityCommand";
import { FlyCommand } from "./Commands/FlyCommand";
import { CreateGeneratorCommand } from "./Commands/Generator/CreateGeneratorCommand";
import { SetGeneratorSpawnRateCommand } from "./Commands/Generator/SetGeneratorSpawnRateCommand";
import { HealCommand } from "./Commands/HealCommand";
import { HelpCommand } from "./Commands/HelpCommand";
import { JoinCodeCommand } from "./Commands/JoinCodeCommand";
import { LagCommand } from "./Commands/LagCommand";
import { SaveWorldCommand } from "./Commands/SaveWorldCommand";
import { SetTeamCommand } from "./Commands/SetTeamCommand";
import { TeamChatCommand } from "./Commands/TeamChatCommand";
import { TeamCommand } from "./Commands/TeamCommand";
import { TpAllCommand } from "./Commands/TpAllCommand";
import { TpCommand } from "./Commands/TpCommand";
import { TpsCommand } from "./Commands/TpsCommand";

@Service({})
export class ChatService implements OnStart {
	private commands = new Map<string, ChatCommand>();

	public readonly canUseRichText = true;

	constructor() {
		this.RegisterCommand(new EntityCommand());
		this.RegisterCommand(new DamageCommand());
		this.RegisterCommand(new JoinCodeCommand());
		this.RegisterCommand(new CreateGeneratorCommand());
		this.RegisterCommand(new SetGeneratorSpawnRateCommand());
		this.RegisterCommand(new TeamCommand());
		this.RegisterCommand(new AddInventoryCommand());
		this.RegisterCommand(new DieCommand());
		this.RegisterCommand(new SetTeamCommand());
		this.RegisterCommand(new TpAllCommand());
		this.RegisterCommand(new TpCommand());
		this.RegisterCommand(new TpsCommand());
		this.RegisterCommand(new LagCommand());
		this.RegisterCommand(new SetVarCommand());
		this.RegisterCommand(new GetVarCommand());
		this.RegisterCommand(new HealCommand());
		this.RegisterCommand(new BotCommand());
		this.RegisterCommand(new FlyCommand());
		this.RegisterCommand(new HelpCommand());
		this.RegisterCommand(new TeamChatCommand());
		this.RegisterCommand(new SaveWorldCommand());
	}

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
		const team = player.GetTeam();
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

	OnStart(): void {
		CoreNetwork.ClientToServer.SendChatMessage.server.OnClientEvent((clientId, text) => {
			const rawMessage = text;
			const player = Airship.players.FindByClientId(clientId);
			if (!player) {
				error("player not found.");
			}

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

			let message = this.FormatUserChatMessage(player, text, this.canUseRichText);
			CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients(message, player.clientId);
			CoreNetwork.ServerToClient.PlayerChatted.server.FireAllClients(rawMessage, player.clientId);
		});
	}

	public GetCommands(): ChatCommand[] {
		return Object.values(this.commands);
	}
}
