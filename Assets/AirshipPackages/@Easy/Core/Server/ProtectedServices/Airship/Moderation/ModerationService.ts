import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ModerationServiceClient, ModerationServiceModeration } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum ModerationServiceBridgeTopics {
	ModerateText = "ModerationService:ModerateText",
}

export type ServerBridgeApiModerateText = (text: string) => ModerationServiceModeration.ModerateTextResponse;

const client = new ModerationServiceClient(UnityMakeRequest(AirshipUrl.ModerationService));

@Service({})
export class ProtectedModerationService {
	constructor() {
		if (!Game.IsServer()) return;


		contextbridge.callback<ServerBridgeApiModerateText>(ModerationServiceBridgeTopics.ModerateText, (_, text: string) => {
			return this.ModerateText(text).expect();
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
}
