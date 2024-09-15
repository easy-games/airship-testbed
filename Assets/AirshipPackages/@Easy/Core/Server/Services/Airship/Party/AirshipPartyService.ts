import {
	PartyServiceBridgeTopics,
	ServerBridgeApiGetPartyById,
	ServerBridgeApiGetPartyForUserId,
} from "@Easy/Core/Server/ProtectedServices/Airship/Party/PartyService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { GameServerPartyData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";

/**
 * Allows access to player party information.
 */
@Service({})
export class AirshipPartyService {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.Server.Party = this;
	}

	protected OnStart(): void {}

	/**
	 * Gets the users party. To be allowed access to party information, the user
	 * must be playing the current game.
	 * @param userId The id of the user
	 */
	public async GetPartyForUserId(userId: string): Promise<GameServerPartyData | undefined> {
		const result = contextbridge.invoke<ServerBridgeApiGetPartyForUserId>(
			PartyServiceBridgeTopics.GetPartyForUserId,
			LuauContext.Protected,
			userId,
		);
		if (!result.success) throw result.error;
		return result.data;
	}

	/**
	 * Gets the party. To be allowed access to party information, the party leader must be playing
	 * the current game.
	 * @param partyId The id of the party
	 */
	public async GetPartyById(partyId: string): Promise<GameServerPartyData | undefined> {
		const result = contextbridge.invoke<ServerBridgeApiGetPartyById>(
			PartyServiceBridgeTopics.GetPartyById,
			LuauContext.Protected,
			partyId,
		);
		if (!result.success) throw result.error;
		return result.data;
	}
}
