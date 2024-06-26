import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export enum PartyControllerBridgeTopics {
	GetParty = "PartyController:GetParty",
}

export type ClientBridgeApiGetParty = () => Result<Party, undefined>;

@Controller({})
export class ProtectedPartyController {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetParty>(PartyControllerBridgeTopics.GetParty, (_) => {
			const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/party/self`);

			if (!res.success || res.statusCode > 299) {
				warn(`Unable to get user pary. Status Code: ${res.statusCode}.\n`, res.data);
				return {
					success: false,
					data: undefined,
				};
			}

			return {
				success: true,
				data: DecodeJSON(res.data) as Party,
			};
		});
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
