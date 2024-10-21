import { GameServerPartyData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export const enum PartyServiceBridgeTopics {
	GetPartyForUserId = "PartyService:GetPartyForUserId",
	GetPartyById = "PartyService:GetPartyById",
}

export type ServerBridgeApiGetPartyForUserId = (userId: string) => GameServerPartyData | undefined;
export type ServerBridgeApiGetPartyById = (partyId: string) => GameServerPartyData | undefined;

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
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/uid/${userId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON<{ party: GameServerPartyData }>(res.data).party;
	}

	public async GetPartyById(partyId: string): Promise<ReturnType<ServerBridgeApiGetPartyById>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/party-id/${partyId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON<{ party: GameServerPartyData }>(res.data).party;
	}

	protected OnStart(): void {}
}
