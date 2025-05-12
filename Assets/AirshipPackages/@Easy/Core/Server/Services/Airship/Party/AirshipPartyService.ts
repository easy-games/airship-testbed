import {
	PartyServiceBridgeTopics,
	ServerBridgeApiGetPartyById,
	ServerBridgeApiGetPartyForUserId,
} from "@Easy/Core/Server/ProtectedServices/Airship/Party/PartyService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorParty } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";

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
	public async GetPartyForUserId(userId: string): Promise<GameCoordinatorParty.GameParty | undefined> {
		return contextbridge.invoke<ServerBridgeApiGetPartyForUserId>(
			PartyServiceBridgeTopics.GetPartyForUserId,
			LuauContext.Protected,
			userId,
		);
	}

	/**
	 * Gets the party. To be allowed access to party information, the party leader must be playing
	 * the current game.
	 * @param partyId The id of the party
	 */
	public async GetPartyById(partyId: string): Promise<GameCoordinatorParty.GameParty | undefined> {
		return contextbridge.invoke<ServerBridgeApiGetPartyById>(
			PartyServiceBridgeTopics.GetPartyById,
			LuauContext.Protected,
			partyId,
		);
	}
}
