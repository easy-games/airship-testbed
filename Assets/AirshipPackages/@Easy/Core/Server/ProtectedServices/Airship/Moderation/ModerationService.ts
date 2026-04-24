import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import {
	ModerationServiceClient,
	ModerationServiceModeration,
} from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum ModerationServiceBridgeTopics {
	ModerateText = "ModerationService:ModerateText",
	ModerateChat = "ModerationService:ModerateChat",
}

export type ServerBridgeApiModerateText = (text: string) => ModerationServiceModeration.ModerateTextResponse;
export type ServerBridgeApiModerateChat = (
	conversationId: string,
	senderId: string,
	message: string,
) => ModerationServiceModeration.ModerationResponse;

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
}
