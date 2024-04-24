import { Platform } from "Shared/Airship";
import { OnStart, Service } from "Shared/Flamework";
import { Result } from "Shared/Types/Result";
import { RunUtil } from "Shared/Util/RunUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";

export interface LeaderboardUpdate {
	[id: string]: number;
}

/**
 * The data associated with a position on the leaderboard.
 */
export interface RankData {
	/** The id for this ranking */
	id: string;
	/** The location of the entry on the leaderboard. */
	rank: number;
	/** The score value on the leaderboard */
	value: string;
}

@Service({})
export class LeaderboardService implements OnStart {
	constructor() {
		if (RunUtil.IsServer()) Platform.server.leaderboard = this;
	}

	OnStart(): void {}

	/**
	 * Sends an update to the provided leaderboard. The scores provided are added to, subtracted from, or replace the existing
	 * scores based on the leaderboard configuration.
	 * @param leaderboardName The name of the leaderboard that should be updated with the given scores
	 * @param update An object containing a map of ids and scores.
	 */
	public async Update(leaderboardName: string, update: LeaderboardUpdate): Promise<Result<undefined, undefined>> {
		const result = await LeaderboardServiceBackend.Update(
			leaderboardName,
			EncodeJSON({
				stats: update,
			}),
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to update leaderboard. Status Code: ${result.statusCode}.\n`, result.data);
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
	 * Gets the rank of a given id.
	 * @param leaderboardName The name of the leaderboard
	 * @param id The id
	 */
	public async GetRank(leaderboardName: string, id: string): Promise<Result<RankData | undefined, undefined>> {
		const result = await LeaderboardServiceBackend.GetRank(leaderboardName, id);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get leaderboard rank. Status Code: ${result.statusCode}.\n`, result.data);
			return {
				success: false,
				data: undefined,
			};
		}

		if (!result.data) {
			return {
				success: true,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data) as RankData,
		};
	}

	/**
	 * Gets a section of the leaderboard. This function is helpful for displaying leaderboards in your game.
	 * By default, this function returns the top 100 entries.
	 *
	 * This function returns a subsection of the top 1000 entries. Rankings are tracked for users below
	 * the top 1000, but they can only be accessed using the GetRank function.
	 * @param leaderboardName The leaderboard name
	 * @param startIndex The start index of the selection. Defaults to 0, which is the top of the leaderboard.
	 * @param count The number of entries to retrieve. Defaults to 100.
	 */
	public async GetRankRange(
		leaderboardName: string,
		startIndex = 0,
		count = 100,
	): Promise<Result<RankData[], undefined>> {
		count = math.clamp(count, 1, 1000 - startIndex); // ensure they don't reach past 1000;

		const result = await LeaderboardServiceBackend.GetRankRange(leaderboardName, startIndex, count);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get leaderboard rankings. Status Code: ${result.statusCode}.\n`, result.data);
			return {
				success: false,
				data: undefined,
			};
		}

		if (!result.data) {
			return {
				success: true,
				data: [],
			};
		}

		return {
			success: true,
			data: DecodeJSON(result.data) as RankData[],
		};
	}
}
