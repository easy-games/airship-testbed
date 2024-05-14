import { Service, OnStart } from "@Easy/Core/Shared/Flamework";
import { Platform } from "@Easy/Core/Shared/Airship";
import { PartyMode, PartyStatus } from "@Easy/Core/Shared/SocketIOMessages/Party";
import { PublicUser } from "@Easy/Core/Shared/SocketIOMessages/PublicUser";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { DecodeJSON } from "@Easy/Core/Shared/json";

/**
 * Information about a users party.
 */
export interface GameServerPartyData {
	partyId: string;
	leader: string;
	mode: PartyMode;
	lastUpdated: number;
	members: PublicUser[];
	status: PartyStatus;
}

@Service({})
export class PartyService implements OnStart {
	constructor() {
		if (RunUtil.IsServer()) Platform.server.party = this;
	}

	OnStart(): void {}

	/**
	 * Gets the users party. To be allowed access to party information, the user
	 * must be playing the current game.
	 * @param userId The id of the user
	 */
	public async GetPartyForUserId(userId: string): Promise<Result<GameServerPartyData | undefined, undefined>> {
		const res = await PartyServiceBackend.GetPartyForUserId(userId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		if (!res.data) {
			return { success: true, data: undefined };
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as GameServerPartyData,
		};
	}

	/**
	 * Gets the party. To be allowed access to party information, the party leader must be playing
	 * the current game.
	 * @param partyId The id of the party
	 */
	public async GetPartyById(partyId: string): Promise<Result<GameServerPartyData | undefined, undefined>> {
		const res = await PartyServiceBackend.GetPartyById(partyId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get party for user. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		if (!res.data) {
			return { success: true, data: undefined };
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as GameServerPartyData,
		};
	}
}
