import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Party } from "@Easy/Core/Shared/SocketIOMessages/Party";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON } from "@Easy/Core/Shared/json";

export enum PartyControllerBridgeTopics {
	GetParty = "PartyController:GetParty",
}

export type BridgeApiGetParty = () => Result<Party, undefined>;

@Controller({})
export class PartyController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		contextbridge.callback<BridgeApiGetParty>(PartyControllerBridgeTopics.GetParty, (_) => {
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

	OnStart(): void {}
}
