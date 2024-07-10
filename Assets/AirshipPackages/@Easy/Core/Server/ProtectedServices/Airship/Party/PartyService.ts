import { GameServerPartyData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export const enum PartyServiceBridgeTopics {
	GetPartyForUserId = "PartyService:GetPartyForUserId",
	GetPartyById = "PartyService:GetPartyById",
}

export type ServerBridgeApiGetPartyForUserId = (userId: string) => Result<GameServerPartyData | undefined, string>;
export type ServerBridgeApiGetPartyById = (partyId: string) => Result<GameServerPartyData | undefined, string>;

@Service({})
export class ProtectedPartyService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGetPartyForUserId>(
			PartyServiceBridgeTopics.GetPartyForUserId,
			(_, userId) => {
				const [success, result] = this.GetPartyForUserId(userId).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiGetPartyById>(PartyServiceBridgeTopics.GetPartyById, (_, partyId) => {
			const [success, result] = this.GetPartyById(partyId).await();
			if (!success) {
				return { success: false, error: "Unable to complete request." };
			}
			return result;
		});
	}

	public async GetPartyForUserId(userId: string): Promise<ReturnType<ServerBridgeApiGetPartyForUserId>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/uid/${userId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		if (!res.data) {
			return { success: true, data: undefined };
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as GameServerPartyData,
		};
	}

	public async GetPartyById(partyId: string): Promise<ReturnType<ServerBridgeApiGetPartyById>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/party-id/${partyId}`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.error);
			return {
				success: false,
				error: res.error,
			};
		}

		if (!res.data) {
			return { success: true, data: undefined };
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as GameServerPartyData,
		};
	}

	protected OnStart(): void {}
}
