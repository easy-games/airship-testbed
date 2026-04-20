import { GameModerationCommand } from "@Easy/Core/Server/Services/Chat/Commands/GameMod/GameModCommandHelper";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import {
	ModerationServiceClient,
	ModerationServiceGameModeration,
	ModerationServiceModeration,
} from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { hasPermission } from "@Easy/Core/Shared/Util/PermissionUtil";

export const enum ModerationServiceBridgeTopics {
	ModerateText = "ModerationService:ModerateText",
	ModerateChat = "ModerationService:ModerateChat",
	GameModerationPostAction = "ModerationService:GameModerationPostAction",
	GameModerationRemoveAction = "ModerationService:GameModerationRemoveAction",
	GameModerationUserLookup = "ModerationService:GameModerationUserLookup",
	GameModerationAddNote = "ModerationService:GameModerationAddNote",
}

export type ServerBridgeApiModerateText = (text: string) => ModerationServiceModeration.ModerateTextResponse;
export type ServerBridgeApiModerateChat = (
	conversationId: string,
	senderId: string,
	message: string,
) => ModerationServiceModeration.ModerationResponse;

export type ServerBridgeApiGameModPostAction = (dto: ModerationServiceGameModeration.GamePostActionDto) => ModerationServiceGameModeration.PublicGameModerationAction | undefined;
export type ServerBridgeApiGameModRemoveAction = (dto: ModerationServiceGameModeration.GameRemoveActionDto) => ModerationServiceGameModeration.PublicGameModerationAction | undefined;
export type ServerBridgeApiGameModUserLookup = (dto: ModerationServiceGameModeration.GameUserLookupDto) => ModerationServiceGameModeration.GameModerationProfileResponse | undefined;
export type ServerBridgeApiGameModAddNote = (dto: ModerationServiceGameModeration.GameAddUserNoteDto) => ModerationServiceGameModeration.PublicGameUserNote | undefined;


const client = new ModerationServiceClient(UnityMakeRequest(AirshipUrl.ModerationService));

@Service({})
export class ProtectedModerationService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiModerateText>(
			ModerationServiceBridgeTopics.ModerateText,
			(_, text: string) => {
				return this.ModerateText(text).expect();
			},
		);

		// We don't expose this bridge call in the AirshipModerationService, but it's
		// used for public chat moderation. Devs can use ModerateText for a simpler API
		// that's more useful to them. In the future we may expose this and document the API
		// so that the game moderation queue has additional context.
		contextbridge.callback<ServerBridgeApiModerateChat>(
			ModerationServiceBridgeTopics.ModerateChat,
			(_, conversationId, senderId, message: string) => {
				return this.ModerateChatMessage(conversationId, senderId, message).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGameModPostAction>(
			ModerationServiceBridgeTopics.GameModerationPostAction,
			(_, dto) => {
				return this.GameModerationPostAction(dto).expect();
			}
		)

		contextbridge.callback<ServerBridgeApiGameModRemoveAction>(
			ModerationServiceBridgeTopics.GameModerationRemoveAction,
			(_, dto) => {
				return this.GameModerationRemoveAction(dto).expect();
			}
		)

		contextbridge.callback<ServerBridgeApiGameModUserLookup>(
			ModerationServiceBridgeTopics.GameModerationUserLookup,
			(_, dto) => {
				return this.GameModUserLookup(dto).expect();
			}
		)

		contextbridge.callback<ServerBridgeApiGameModAddNote>(
			ModerationServiceBridgeTopics.GameModerationAddNote,
			(_, dto) => {
				return this.GameModAddNote(dto).expect();
			}
		)

		Airship.Players.onPlayerJoined.Connect((player) => {
			this.GrantModerationCommandPermissions(player);
		});

		Airship.Players.onPlayerDisconnected.Connect((player) => {
			this.RevokeModerationCommandPermissions(player);
		});
	}

	public async ModerateChatMessage(
		conversationId: string,
		senderId: string,
		message: string,
	): Promise<ModerationServiceModeration.ModerationResponse> {
		return await client.moderation.moderateChat({
			conversationId,
			conversationMethod: ModerationServiceModeration.PlatformCommunicationMethods.GameServerChat,
			senderId,
			message,
		});
	}

	public async ModerateText(text: string): Promise<ModerationServiceModeration.ModerateTextResponse> {
		return await client.moderation.moderateText({
			text,
		});
	}

	public async GameModerationPostAction(dto: ModerationServiceGameModeration.GamePostActionDto): Promise<ModerationServiceGameModeration.PublicGameModerationAction | undefined> {
		try {
			return await client.gameModeration.postAction(dto);
		} catch (err) {
			return undefined;
		}
	}

	public async GameModerationRemoveAction(dto: ModerationServiceGameModeration.GameRemoveActionDto): Promise<ModerationServiceGameModeration.PublicGameModerationAction | undefined>  {
		try {
			return await client.gameModeration.deleteAction(dto);
		} catch (err) {
			return undefined;
		}
	}

	public async GameModUserLookup(dto: ModerationServiceGameModeration.GameUserLookupDto): Promise<ModerationServiceGameModeration.GameModerationProfileResponse | undefined> {
		try {
			return await client.gameModeration.getUserModerationProfile(dto);
		} catch (err) {
			return undefined;
		}
	}

	public async GameModAddNote(dto: ModerationServiceGameModeration.GameAddUserNoteDto): Promise<ModerationServiceGameModeration.PublicGameUserNote | undefined> {
		try {
			return await client.gameModeration.addNote(dto);
		} catch (err) {
			return undefined;
		}
	}

	/** Grants permission to use game moderation commands based on the player's moderation role */
	public async GrantModerationCommandPermissions(player: Player) {
		if (!player.gameModerationRole) return;

		const permData = player.gameModerationRole.permissionData;
		const commandPermMap: Record<GameModerationCommand, string[]> = {
			[GameModerationCommand.KICK]:     ["moderation", "manageActions", "manageKick", "kick"],
			[GameModerationCommand.TEMPBAN]:  ["moderation", "manageActions", "manageBan", "temporary"],
			[GameModerationCommand.BAN]:      ["moderation", "manageActions", "manageBan", "permanent"],
			[GameModerationCommand.TEMPMUTE]: ["moderation", "manageActions", "manageMute", "temporary"],
			[GameModerationCommand.MUTE]:     ["moderation", "manageActions", "manageMute", "permanent"],
			[GameModerationCommand.NOTE]:     ["moderation", "note"],
			[GameModerationCommand.UNBAN]:    ["moderation", "manageActions", "manageBan", "remove"],
			[GameModerationCommand.UNMUTE]:   ["moderation", "manageActions", "manageMute", "remove"],
			[GameModerationCommand.LOOKUP]:   ["moderation", "viewProfile"],
		};

		for (const [command, path] of ObjectUtils.entries(commandPermMap)) {
			if (hasPermission(permData, path)) {
				Airship.Chat.GiveCommandPermission(command as GameModerationCommand, player.userId);
			}
		}
	}

	/** Removes all granted moderation command permissions, to be used on player leave */
	public RevokeModerationCommandPermissions(player: Player) {
		const allGrantedCommands = Airship.Chat.GetCommandPermissions(player.userId);
		const modCommands = new Set(ObjectUtils.values(GameModerationCommand));

		allGrantedCommands
			.filter((c) => modCommands.has(c as GameModerationCommand))
			.forEach((c) => {
				Airship.Chat.RemoveCommandPermission(c, player.userId);
			});
	}
}
