import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";
import { Platform } from "@Easy/Core/Shared/Airship";
import { Party } from "@Easy/Core/Shared/SocketIOMessages/Party";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

@Controller({})
export class PartyController implements OnStart {
	constructor() {
		if (RunUtil.IsClient()) Platform.client.party = this;
	}

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
