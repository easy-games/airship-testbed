import { AirshipPartyInternalSnapshot } from "@Easy/Core/Shared/Airship/Types/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { SocketController } from "../../Socket/SocketController";

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
	public readonly onPartyChange = new Signal<
		[newParty: AirshipPartyInternalSnapshot, oldParty?: AirshipPartyInternalSnapshot]
	>();
	public currentParty: AirshipPartyInternalSnapshot | undefined;

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

	public IsPartyLeader(): boolean {
		return (
			this.currentParty !== undefined &&
			Protected.User.localUser !== undefined &&
			this.currentParty.leader === Protected.User.localUser.uid
		);
	}

	public ObserveIsPartyLead(observer: (isPartyLead: boolean) => CleanupFunc): () => void {
		let currentCleanup: CleanupFunc;

		const onChanged = (isPartyLead: boolean) => {
			currentCleanup?.();
			currentCleanup = observer(isPartyLead);
		};

		const bin = new Bin();
		bin.Add(
			this.onPartyChange.Connect((newParty) => {
				onChanged(this.IsPartyLeader());
			}),
		);
		onChanged(this.IsPartyLeader());

		return () => {
			bin.Clean();
			currentCleanup?.();
		};
	}

	protected OnStart(): void {
		this.socketController.On<AirshipPartyInternalSnapshot>("game-coordinator/party-update", (data) => {
			const previous = this.currentParty;
			this.currentParty = data;
			this.onPartyChange.Fire(data, previous);

			// We only invoke when in-game because it's the only time a callback is registered.
			if (Game.IsInGame()) {
				contextbridge.invoke(PartyControllerBridgeTopics.OnPartyChange, LuauContext.Game, data);
			}
		});
	}
}
