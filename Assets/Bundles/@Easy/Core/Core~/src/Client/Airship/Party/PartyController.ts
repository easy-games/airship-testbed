import { Controller, OnStart } from "@easy-games/flamework-core";
import { Party } from "Shared/SocketIOMessages/Party";
import { Result } from "Shared/Types/Result";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";

/**
 * This controller provides information about the users current party.
 */
@Controller({})
export class PartyController implements OnStart {
	OnStart(): void {}

	/**
	 * Gets the users current party data.
	 */
	public async GetParty(): Promise<Result<Party, undefined>> {
		const res = await PartyControllerBackend.GetParty();

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
	}
}
