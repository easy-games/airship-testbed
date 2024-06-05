import { GameServerPartyData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export enum PartyServiceBridgeTopics {
	GetPartyForUserId = "PartyService:GetPartyForUserId",
	GetPartyById = "PartyService:GetPartyById",
}

export type ServerBridgeApiGetPartyForUserId = (userId: string) => Result<GameServerPartyData | undefined, undefined>;
export type ServerBridgeApiGetPartyById = (partyId: string) => Result<GameServerPartyData | undefined, undefined>;

@Service({})
export class ProtectedPartyService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiGetPartyForUserId>(
			PartyServiceBridgeTopics.GetPartyForUserId,
			(_, userId) => {
				const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/uid/${userId}`);

				if (!res.success || res.statusCode > 299) {
					warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.data);
					return {
						success: false,
						data: undefined,
					};
				}

				if (!res.data) {
					return { success: true, data: undefined };
				}

				return {
					success: true,
					data: DecodeJSON(res.data) as GameServerPartyData,
				};
			},
		);

		contextbridge.callback<ServerBridgeApiGetPartyById>(PartyServiceBridgeTopics.GetPartyById, (_, partyId) => {
			const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/party-id/${partyId}`);

			if (!res.success || res.statusCode > 299) {
				warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.data);
				return {
					success: false,
					data: undefined,
				};
			}

			if (!res.data) {
				return { success: true, data: undefined };
			}

			return {
				success: true,
				data: DecodeJSON(res.data) as GameServerPartyData,
			};
		});
	}

	OnStart(): void {}
}
