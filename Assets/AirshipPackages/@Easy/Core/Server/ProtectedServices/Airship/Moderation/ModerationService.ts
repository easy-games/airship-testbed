import { Game } from "@Easy/Core/Shared/Game";
import { HttpRetryInstance } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export interface ModerateChatMessageResponse {
	messageBlocked: boolean;
	messageBlockedReasons: string[];
	transformedMessage?: string;
}

export class ProtectedModerationService {
	private readonly httpRetry = HttpRetryInstance();

	constructor() {
		if (!Game.IsServer()) return;
	}

	public async ModerateChatMessage(conversationId: string, senderId: string, message: string): Promise<ModerateChatMessageResponse> {
		const result = await this.httpRetry(
			() => InternalHttpManager.PostAsync(`${AirshipUrl.ModerationService}/moderation/chat`, json.encode({
				conversationMethod: "GAME_SERVER_CHAT",
				conversationId,
				senderId,
				message,
			})),
			"ModerateChatMessage",
			
		);

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to moderate chat message. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<ModerateChatMessageResponse>(result.data);
	}
}
