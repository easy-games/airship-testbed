import { AirshipParty } from "@Easy/Core/Shared/Airship/Types/AirshipParty";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum PartyServiceBridgeTopics {
	GetPartyForUserId = "PartyService:GetPartyForUserId",
	GetPartyById = "PartyService:GetPartyById",
}

export type ServerBridgeApiGetPartyForUserId = (userId: string) => AirshipParty | undefined;
export type ServerBridgeApiGetPartyById = (partyId: string) => AirshipParty | undefined;

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Service({})
export class ProtectedPartyService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGetPartyForUserId>(
			PartyServiceBridgeTopics.GetPartyForUserId,
			(_, userId) => {
				return this.GetPartyForUserId(userId).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiGetPartyById>(PartyServiceBridgeTopics.GetPartyById, (_, partyId) => {
			return this.GetPartyById(partyId).expect();
		});
	}

	public async GetPartyForUserId(userId: string): Promise<ReturnType<ServerBridgeApiGetPartyForUserId>> {
		const result = await client.party.getUserParty({ uid: userId });
		return result.party;
	}

	public async GetPartyById(partyId: string): Promise<ReturnType<ServerBridgeApiGetPartyById>> {
		const result = await client.party.getParty({ partyId });
		return result.party;
	}

	protected OnStart(): void { }
}
