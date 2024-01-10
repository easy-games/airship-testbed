import { Service, OnStart } from "@easy-games/flamework-core";
import { Result } from "Shared/Types/Result";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";

/**
 * Allows game servers to match make players. These functions are currently only
 * enabled upon request. Email us at hello@easy.gg to see if you might qualify.
 */
@Service({})
export class MatchmakingService implements OnStart {
	OnStart(): void {}

	/**
	 * Gets the currently available matchmaking regions. Some or all of these regions can be provided
	 * to the JoinPartyToQueue function to select the regions the party will matchmake in.
	 *
	 * In cases of small player counts, it may be better to always queue users to all regions instead
	 * of allowing them to select their preferred regions.
	 * @returns A list of currently available matchmaking regions.
	 */
	public async GetMatchmakingRegions(): Promise<Result<string[], undefined>> {
		const res = InternalHttpManager.GetAsync(AirshipUrl.GameCoordinator + `/matchmaking/regions`);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to get matchmaking regions. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data) as string[],
		};
	}

	/**
	 * Joins a party to the provided queue. The optional regions array can be used to overwrite the regions
	 * this party will matchmake in. By default, the regions the party leader has selected will be used.
	 * Refer to the GetMatchmakingRegions function for more information about matchmaking regions.
	 * @param partyId The party to queue
	 * @param queueId The name of the queue the party should join
	 * @param regions The regions this party should queue in. This overwrites the party leader selections.
	 */
	public async JoinPartyToQueue(
		partyId: string,
		queueId: string,
		regions?: string[],
	): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + `/matchmaking/party-id/${partyId}/queue`,
			EncodeJSON({
				regions,
				queueId,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to queue user party. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Removes the party from queue.
	 * @param partyId The id of the party
	 */
	public async RemovePartyFromQueue(partyId: string): Promise<Result<undefined, undefined>> {
		const res = InternalHttpManager.PostAsync(
			AirshipUrl.GameCoordinator + `/matchmaking/user-id/${partyId}/queue`,
			EncodeJSON({}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to queue user party. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}
}
