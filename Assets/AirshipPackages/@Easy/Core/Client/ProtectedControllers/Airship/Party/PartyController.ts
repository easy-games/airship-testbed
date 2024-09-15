import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum PartyControllerBridgeTopics {
	GetParty = "PartyController:GetParty",
}

export type ClientBridgeApiGetParty = () => Party;

@Controller({})
export class ProtectedPartyController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetParty>(PartyControllerBridgeTopics.GetParty, (_) => {
			return this.GetParty().expect();
		});
	}

	public async GetParty(): Promise<ReturnType<ClientBridgeApiGetParty>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/party/self`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user pary. Status Code: ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return DecodeJSON(res.data) as Party;
	}

	public async InviteToParty(userId: string) {
		InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/invite",
			EncodeJSON({
				userToAdd: userId,
			}),
		);
	}

	protected OnStart(): void {}
}
