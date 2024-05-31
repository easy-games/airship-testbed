import {
	BridgeApiGetParty,
	PartyControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Party } from "@Easy/Core/Shared/SocketIOMessages/Party";
import { Result } from "@Easy/Core/Shared/Types/Result";

@Controller({})
export class PartyController implements OnStart {
	constructor() {
		if (!Game.IsClient()) return;

		Platform.client.party = this;
	}

	OnStart(): void {}

	/**
	 * Gets the users current party data.
	 */
	public async GetParty(): Promise<Result<Party, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<BridgeApiGetParty>(PartyControllerBridgeTopics.GetParty);
	}
}
