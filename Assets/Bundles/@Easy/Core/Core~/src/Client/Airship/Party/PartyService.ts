import { Controller, OnStart } from "@easy-games/flamework-core";
import { Result } from "Shared/Types/Result";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { EncodeJSON } from "Shared/json";

/**
 * This controller provides information about the users current party as well as functions
 * for managing parties.
 */
@Controller({})
export class PartyService implements OnStart {
	// TODO: Signals/Access to current party data. Likely already exists in the
	// main menu controllers somewhere

	OnStart(): void {}

	/**
	 * Sends an invite to the provided user, allowing them to join the existing party.
	 * @param userIdToAdd The userId of the user to invite
	 */
	public async InviteUser(userIdToAdd: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/invite",
			EncodeJSON({ userToAdd: userIdToAdd }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to invite user to party. Status Code: ${res.statusCode}\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return { success: true, data: undefined };
	}

	/**
	 * Allows the party leader to remove users from the party. A client can always remove itself from the
	 * current party by calling this function and providing their own user id.
	 * @param userIdToRemove
	 */
	public async RemoveUser(userIdToRemove: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/remove",
			EncodeJSON({ userToRemove: userIdToRemove }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to remove user from party. Status Code: ${res.statusCode}\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return { success: true, data: undefined };
	}

	/**
	 * Joins the user to the provided party id. This may fail if the user is not allowed to join the party.
	 * @param partyId The id of the party
	 */
	public async JoinParty(partyId: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + "/parties/party/join",
			EncodeJSON({ partyId }),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to join party. Status Code: ${res.statusCode}\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return { success: true, data: undefined };
	}
}
