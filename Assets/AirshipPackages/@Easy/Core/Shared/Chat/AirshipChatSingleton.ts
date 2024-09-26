import { AddInventoryCommand } from "@Easy/Core/Server/Services/Chat/Commands/AddInventoryCommand";
import { BotCommand } from "@Easy/Core/Server/Services/Chat/Commands/BotCommand";
import { DamageCommand } from "@Easy/Core/Server/Services/Chat/Commands/DamageCommand";
import { EntityCommand } from "@Easy/Core/Server/Services/Chat/Commands/EntityCommand";
import { FlyCommand } from "@Easy/Core/Server/Services/Chat/Commands/FlyCommand";
import { HealCommand } from "@Easy/Core/Server/Services/Chat/Commands/HealCommand";
import { HelpCommand } from "@Easy/Core/Server/Services/Chat/Commands/HelpCommand";
import { JoinCodeCommand } from "@Easy/Core/Server/Services/Chat/Commands/JoinCodeCommand";
import { KickCommand } from "@Easy/Core/Server/Services/Chat/Commands/KickCommand";
import { KillCommand } from "@Easy/Core/Server/Services/Chat/Commands/KillCommand";
import { LagCommand } from "@Easy/Core/Server/Services/Chat/Commands/LagCommand";
import { SetTeamCommand } from "@Easy/Core/Server/Services/Chat/Commands/SetTeamCommand";
import { TeamChatCommand } from "@Easy/Core/Server/Services/Chat/Commands/TeamChatCommand";
import { TeamCommand } from "@Easy/Core/Server/Services/Chat/Commands/TeamCommand";
import { TpAllCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpAllCommand";
import { TpCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpCommand";
import { TpsCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpsCommand";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Airship } from "../Airship";
import { ChatCommand } from "../Commands/ChatCommand";
import { CoreNetwork } from "../CoreNetwork";
import { Game } from "../Game";
import { Player } from "../Player/Player";
import StringUtils from "../Types/StringUtil";
import { ChatUtil } from "../Util/ChatUtil";
import ObjectUtils from "../Util/ObjectUtils";

/**
 * Access using {@link Airship.Chat}. Functions for configuring the chat window
 * as well as broadcasting messages.
 *
 * To send a player a message see {@link Player.SendMessage}.
 */
@Singleton({})
export class AirshipChatSingleton {
	private commands = new Map<string, ChatCommand>();

	public readonly canUseRichText = true;
	
	constructor() {
		Airship.Chat = this;
	}

	protected OnStart(): void {
		print("Airship chat singleton: " + contextbridge.current());
		if (Game.IsInGame()) {
			this.RegisterCoreCommands();

			if (Game.IsServer()) this.SubscribeToChatMessage();

			// On client listen for game chat messages and direct them to protected
			if (Game.IsClient()) {
				CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((msg, nameWithPrefix, senderClientId) => {
					contextbridge.broadcast<(msg: string, nameWithPrefix?: string, senderClientId?: number) => void>("Chat:AddLocalMessage", msg, nameWithPrefix, senderClientId);
				});
			}
		}
	}

	private SubscribeToChatMessage() {
		contextbridge.subscribe<(fromContext: LuauContext, msg: string, fromConnId: number) => void>("ProtectedChat:SendMessage", (fromContext, text, fromConnId) => {
			const player = Airship.Players.FindByConnectionId(fromConnId);
			if (!player) {
				warn("Couldn't find player when trying to send chat message. connId=" + fromConnId);
				return;
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

			let nameWithPrefix = player.username + ": ";
			CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients(
				text,
				nameWithPrefix,
				player.connectionId,
			);
		});
	}

	/**
	 * [Client only]
	 *
	 * Sets chat's visibility.
	 *
	 * @param val Whether or not chat should be visible.
	 */
	public SetUIEnabled(val: boolean): void {
		if (!Game.IsClient()) return;

		contextbridge.invoke<(val: boolean) => void>("ClientChatSingleton:SetUIEnabled", LuauContext.Protected, val);
	}

	/**
	 * Broadcasts message to entire server, if called from server. Otherwise,
	 * broadcasts message to only local player.
	 *
	 * @param message A message.
	 */
	public BroadcastMessage(message: string): void {
		Game.BroadcastMessage(message);
	}

	private RegisterCoreCommands(): void {
		if (!Game.IsServer()) return;
		this.RegisterCommand(new EntityCommand());
		this.RegisterCommand(new DamageCommand());
		this.RegisterCommand(new JoinCodeCommand());
		this.RegisterCommand(new TeamCommand());
		this.RegisterCommand(new AddInventoryCommand());
		this.RegisterCommand(new KillCommand());
		this.RegisterCommand(new SetTeamCommand());
		this.RegisterCommand(new TpAllCommand());
		this.RegisterCommand(new TpCommand());
		this.RegisterCommand(new TpsCommand());
		this.RegisterCommand(new LagCommand());
		this.RegisterCommand(new HealCommand());
		this.RegisterCommand(new BotCommand());
		this.RegisterCommand(new FlyCommand());
		this.RegisterCommand(new HelpCommand());
		this.RegisterCommand(new TeamChatCommand());
		this.RegisterCommand(new KickCommand());
	}

	/**
	 * [Server only]
	 *
	 * Registers provided command.
	 *
	 * @param command A command instance.
	 */
	public RegisterCommand(command: ChatCommand) {
		if (!Game.IsServer()) {
			error(
				"Error trying to call RegisterCommand " +
					command.commandLabel +
					": Can only register command on server.",
			);
		}

		this.commands.set(command.commandLabel.lower(), command);
		for (let alias of command.aliases) {
			this.commands.set(alias.lower(), command);
		}
	}

	public GetCommands(): ChatCommand[] {
		return ObjectUtils.values(this.commands);
	}
}
