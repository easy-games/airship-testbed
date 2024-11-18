import {
	ClientBridgeApiGetParty,
	PartyControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

/**
 * This controller provides information about the users current party.
 */
@Controller({})
export class AirshipPartyController {
	public readonly onPartyChange: Signal<Party> = new Signal();

	constructor() {
		if (!Game.IsClient()) return;

		Platform.Client.Party = this;

		contextbridge.callback(PartyControllerBridgeTopics.OnPartyChange, (_, party) => {
			this.onPartyChange.Fire(party);
		});
	}

	protected OnStart(): void {}

	/**
	 * Gets the users current party data.
	 */
	public async GetParty(): Promise<Party> {
		return contextbridge.invoke<ClientBridgeApiGetParty>(
			PartyControllerBridgeTopics.GetParty,
			LuauContext.Protected,
		);
	}
}
