import {
	ProtectedModerationService,
} from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";
import { AddInventoryCommand } from "@Easy/Core/Server/Services/Chat/Commands/AddInventoryCommand";
import { BotCommand } from "@Easy/Core/Server/Services/Chat/Commands/BotCommand";
import { DamageCommand } from "@Easy/Core/Server/Services/Chat/Commands/DamageCommand";
import { EntityCommand } from "@Easy/Core/Server/Services/Chat/Commands/EntityCommand";
import { FlyCommand } from "@Easy/Core/Server/Services/Chat/Commands/FlyCommand";
import { HealCommand } from "@Easy/Core/Server/Services/Chat/Commands/HealCommand";
import { HelpCommand } from "@Easy/Core/Server/Services/Chat/Commands/HelpCommand";
import { KickCommand } from "@Easy/Core/Server/Services/Chat/Commands/KickCommand";
import { KillCommand } from "@Easy/Core/Server/Services/Chat/Commands/KillCommand";
import { LagCommand } from "@Easy/Core/Server/Services/Chat/Commands/LagCommand";
import { SetTeamCommand } from "@Easy/Core/Server/Services/Chat/Commands/SetTeamCommand";
import { TeamCommand } from "@Easy/Core/Server/Services/Chat/Commands/TeamCommand";
import TeamsCommand from "@Easy/Core/Server/Services/Chat/Commands/TeamsCommand";
import { TpAllCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpAllCommand";
import { TpCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpCommand";
import { TpsCommand } from "@Easy/Core/Server/Services/Chat/Commands/TpsCommand";
import { Singleton } from "@Easy/Core/Shared/Flamework";
import { Airship } from "../Airship";
import { ChatCommand } from "../Commands/ChatCommand";
import { ChatMessageNetworkEvent, CoreNetwork } from "../CoreNetwork";
import { Game } from "../Game";
import { Player } from "../Player/Player";
import StringUtils from "../Types/StringUtil";
import { Cancellable } from "../Util/Cancellable";
import { ChatColor } from "../Util/ChatColor";
import { ChatUtil } from "../Util/ChatUtil";
import ObjectUtils from "../Util/ObjectUtils";
import { Signal } from "../Util/Signal";
import { ModerationServiceModeration } from "../TypePackages/moderation-service-types";

class ChatMessageEvent extends Cancellable {
	/**
	 * @param messager Player who sent chat message
	 * @param nametag Name and prefix to be displayed in chat message. Also includes spacing before message. Defaults to "Player1: "
	 * @param message Contents of the chat message (modifiable)
	 */
	constructor(public readonly messager: Player, public nametag: string, public message: string) {
		super();
	}
}

/**
 * Access using {@link Airship.Chat}. Functions for configuring the chat window
 * as well as broadcasting messages.
 *
 * To send a player a message see {@link Player.SendMessage}.
 */
@Singleton({})
export class AirshipChatSingleton {
	private messageIdCounter: number = 1;
	private commands = new Map<string, ChatCommand>();
	private readonly moderationService: ProtectedModerationService;

	public readonly canUseRichText = true;
	/**
	 * Event fired when a player chats.
	 * - If the chat message is a command this will not fire.
	 * - Can be cancelled to prevent the message from going through.
	 * - Message and nametag can be modified to change what is displayed.
	 * - Yielding in a callback will delay the message from being processed.
	 */
	public readonly onChatMessage = new Signal<ChatMessageEvent>().WithAllowYield(true);

	constructor() {
		Airship.Chat = this;
		this.moderationService = new ProtectedModerationService();
	}

	protected OnStart(): void {
		if (Game.IsInGame()) {
			this.RegisterCoreCommands();

			if (Game.IsServer()) this.SubscribeToChatMessage();

			// On client listen for game chat messages and direct them to protected
			if (Game.IsClient()) {
				CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((details) => {
					contextbridge.broadcast<(msg: ChatMessageNetworkEvent) => void>(
						"Chat:ProcessLocalMessage",
						details,
					);
				});
			}
		}
	}

	private SubscribeToChatMessage() {
		contextbridge.subscribe<(fromContext: LuauContext, msg: string, fromConnId: number) => void>(
			"ProtectedChat:SendMessage",
			(fromContext, text, fromConnId) => {
				const messageId = `AirshipChatSingleton:${this.messageIdCounter++}`;
				const player = Airship.Players.FindByConnectionId(fromConnId);
				if (!player) {
					warn("Couldn't find player when trying to send chat message. connId=" + fromConnId);
					return;
				}

				if (StringUtils.startsWith(text, "/")) {
					const commandData = ChatUtil.ParseCommandData(text);

					// print(player.username + ": " + text);

					if (commandData) {
						const command = this.commands.get(commandData.label);
						if (command) {
							if (command.requiresPermission && !Game.IsEditor()) {
								// todo: add easy employee check
								if (!player.orgRoleName) {
									player.SendMessage(
										ChatColor.Red(
											`You do not have permission to use ${ChatColor.Yellow(
												"/" + command.commandLabel,
											)}`,
										),
									);
									return;
								}
							}
							command.Execute(player, commandData.args);
							return;
						}
					}

					player.SendMessage(ChatColor.Red(`Command not found: ${text}`));
					return;
				}

				let nameWithPrefix = player.username + ": ";
				const result = this.onChatMessage.Fire(new ChatMessageEvent(player, nameWithPrefix, text));
				if (result.IsCancelled()) return;

				CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients({
					type: "sent",
					internalMessageId: messageId,
					message: result.message,
					senderPrefix: result.nametag,
					senderClientId: player.connectionId,
				});

				if (!Game.IsEditor()) {
					this.moderationService
						.ModerateChatMessage("public_chat", player.userId, result.message)
						.then((moderationResult: ModerationServiceModeration.ModerationResponse) => {
							if (moderationResult.messageBlocked) {
								CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients({
									type: "remove",
									internalMessageId: messageId,
								});
								if (moderationResult.messageBlockedReasons.size() > 0) {
									player.SendMessage(
										"Your message was blocked for violating our community guidelines for the following reason(s): " +
										moderationResult.messageBlockedReasons.join(", "),
									);
								} else {
									player.SendMessage(
										"Your message was blocked for violating our community guidelines.",
									);
								}
								return;
							} else if (moderationResult.transformedMessage) {
								CoreNetwork.ServerToClient.ChatMessage.server.FireAllClients({
									type: "update",
									internalMessageId: messageId,
									message: moderationResult.transformedMessage,
								});
							}
						});
				}
			},
		);
	}

	public IsOpen(): boolean {
		return contextbridge.invoke<() => boolean>("ClientChatSingleton:IsOpen", LuauContext.Protected);
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
		this.RegisterCommand(new KickCommand());
		this.RegisterCommand(new TeamsCommand());
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
