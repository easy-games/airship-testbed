import { Platform } from "@Easy/Core/Shared/Airship";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { ModerationServiceModeration } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { ModerationServiceBridgeTopics, ServerBridgeApiModerateText } from "@Easy/Core/Server/ProtectedServices/Airship/Moderation/ModerationService";

/**
 * Provides moderation and safety features for the Airship platform.
 */
@Service({})
export class AirshipModerationService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.Moderation = this;
	}


	/**
	 * Moderates text for inappropriate content.
	 * @param text The text to be moderated.
	 * @returns A promise resolving to a moderation response which includes whether the text was censored or blocked.
	 */
	public async ModerateText(text: string): Promise<ModerationServiceModeration.ModerateTextResponse> {
		return contextbridge.invoke<ServerBridgeApiModerateText>(
			ModerationServiceBridgeTopics.ModerateText,
			LuauContext.Protected,
			text,
		);
	}
}
