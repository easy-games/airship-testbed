import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import {
	ModerationServiceClient,
	ModerationServiceGameModeration,
	ModerationServiceModeration,
} from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

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
}
