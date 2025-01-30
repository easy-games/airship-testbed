import {
	ClientBridgeApiGetParty,
	ClientBridgeApiInviteToParty,
	ClientBridgeApiRemoveFromParty,
	PartyControllerBridgeTopics,
} from "@Easy/Core/Client/ProtectedControllers/Airship/Party/PartyController";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Party } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipParty";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
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

	/**
	 * Invites the provided user to the local player's party. This call will throw an error if
	 * the local client is not the leader of their party.
	 * @param user Player object or userId of the player to invite.
	 */
	public async InviteToParty(user: string | Player): Promise<void> {
		const userId = typeIs(user, "string") ? user : user.userId;
		return contextbridge.invoke<ClientBridgeApiInviteToParty>(
			PartyControllerBridgeTopics.InviteToParty,
			LuauContext.Protected,
			userId,
		);
	}

	/**
	 * Removes the provided user from the local player's party. This call can also be used to remove
	 * the local player from their current party by providing the local player's userId.
	 *
	 * Removing a player that has not yet joined will remove the invite for that player if it exists.
	 *
	 * This call will throw an error if the local client is not the leader of their party and they
	 * attempt to remove a player that is not themself.
	 *
	 * @param user Player object or userId of the player to remove.
	 */
	public async RemoveFromParty(user: string | Player): Promise<void> {
		const userId = typeIs(user, "string") ? user : user.userId;
		return contextbridge.invoke<ClientBridgeApiRemoveFromParty>(
			PartyControllerBridgeTopics.RemoveFromParty,
			LuauContext.Protected,
			userId,
		);
	}
}
