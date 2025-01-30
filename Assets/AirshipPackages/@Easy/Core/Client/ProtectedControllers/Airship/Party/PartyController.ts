import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SocketController } from "../../Socket/SocketController";

export const enum PartyControllerBridgeTopics {
	GetParty = "PartyController:GetParty",
	InviteToParty = "PartyController:InviteToParty",
	RemoveFromParty = "PartyController:RemoveFromParty",
	OnPartyChange = "PartyController:OnPartyChange",
}

export type ClientBridgeApiGetParty = () => Party;
export type ClientBridgeApiInviteToParty = (userId: string) => void;
export type ClientBridgeApiRemoveFromParty = (userId: string) => void;

@Controller({})
export class ProtectedPartyController {
	public readonly onPartyChange = new Signal<Party>();

	constructor(private readonly socketController: SocketController) {
		if (!Game.IsClient()) return;

		contextbridge.callback<ClientBridgeApiGetParty>(PartyControllerBridgeTopics.GetParty, (_) => {
			return this.GetParty().expect();
		});

		contextbridge.callback<ClientBridgeApiInviteToParty>(PartyControllerBridgeTopics.InviteToParty, (_, userId) => {
			return this.InviteToParty(userId).expect();
		});

		contextbridge.callback<ClientBridgeApiRemoveFromParty>(
			PartyControllerBridgeTopics.RemoveFromParty,
			(_, userId) => {
				return this.RemoveFromParty(userId).expect();
			},
		);
	}

	public async GetParty(): Promise<ReturnType<ClientBridgeApiGetParty>> {
		const res = InternalHttpManager.GetAsync(`${AirshipUrl.GameCoordinator}/parties/party/self`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get user pary. Status Code: ${res.statusCode}.\n`, res.error);
			throw res.error;
		}

		return json.decode<{ party: Party }>(res.data).party;
	}

	public async InviteToParty(userId: string) {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/invite",
			json.encode({
				userToAdd: userId,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to invite user to party. Status Code: ${res.statusCode}\n`, res.error);
			throw res.error;
		}
	}

	public async RemoveFromParty(userId: string) {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/remove",
			json.encode({
				userToRemove: userId,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to remove user from party. Status Code: ${res.statusCode}\n`, res.error);
			throw res.error;
		}
	}

	protected OnStart(): void {
		this.socketController.On<Party>("game-coordinator/party-update", (data) => {
			this.onPartyChange.Fire(data);

			// We only invoke when in-game because it's the only time a callback is registered.
			if (Game.IsInGame()) {
				contextbridge.invoke(PartyControllerBridgeTopics.OnPartyChange, LuauContext.Game, data);
			}
		});
	}
}
