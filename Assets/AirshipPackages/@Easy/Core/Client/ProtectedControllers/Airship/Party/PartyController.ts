import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SocketController } from "../../Socket/SocketController";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { AirshipPartyInternalSnapshot } from "@Easy/Core/Shared/Airship/Types/AirshipParty";

export const enum PartyControllerBridgeTopics {
	GetParty = "PartyController:GetParty",
	InviteToParty = "PartyController:InviteToParty",
	RemoveFromParty = "PartyController:RemoveFromParty",
	OnPartyChange = "PartyController:OnPartyChange",
}

export type ClientBridgeApiGetParty = () => AirshipPartyInternalSnapshot;
export type ClientBridgeApiInviteToParty = (userId: string) => void;
export type ClientBridgeApiRemoveFromParty = (userId: string) => void;

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

@Controller({})
export class ProtectedPartyController {
	public readonly onPartyChange = new Signal<AirshipPartyInternalSnapshot>();

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
		const result = await client.party.getSelfParty();
		return result.party;
	}

	public async InviteToParty(userId: string) {
		await client.party.inviteUser({ userToAdd: userId });
	}

	public async RemoveFromParty(userId: string) {
		await client.party.removeFromParty({ userToRemove: userId });
	}

	protected OnStart(): void {
		this.socketController.On<AirshipPartyInternalSnapshot>("game-coordinator/party-update", (data) => {
			this.onPartyChange.Fire(data);

			// We only invoke when in-game because it's the only time a callback is registered.
			if (Game.IsInGame()) {
				contextbridge.invoke(PartyControllerBridgeTopics.OnPartyChange, LuauContext.Game, data);
			}
		});
	}
}
