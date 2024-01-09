import { Service, OnStart } from "@easy-games/flamework-core";
import inspect from "@easy-games/unity-inspect";
import { Game } from "Shared/Game";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "Shared/json";

export interface LeaderboardUpdate {
	[id: string]: number;
}

/**
 * The data associated with a position on the leaderboard.
 */
interface RankData {
	/** The id for this ranking */
	id: string;
	/** The location of the entry on the leaderboard. */
	rank: number;
	/** The score value on the leaderboard */
	value: string;
}

/**
 * This service provides access to leaderboard information as well as methods for updating existing leaderboards.
 * Leaderboards must be created using the https://create.airship.gg website. Once a leaderboard is created, it can be
 * accessed using the name provided during setup.
 */
@Service({})
export class LeaderboardService implements OnStart {
	OnStart(): void {}

	/**
	 * Sends an update to the provided leaderboard. The scores provided are added to, subtracted from, or replace the existing
	 * scores based on the leaderboard configuration.
	 * @param leaderboardName The name of the leaderboard that should be updated with the given scores
	 * @param update An object containing a map of ids and scores.
	 */
	public async Update(leaderboardName: string, update: LeaderboardUpdate): Promise<void> {
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${leaderboardName}/stats`,
			EncodeJSON({
				stats: update,
			}),
		);
		if (!result.success) {
			throw error(`Unable to update leaderboard. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}
	}

	/**
	 * Gets the rank of a given id.
	 * @param leaderboardName The name of the leaderboard
	 * @param id The id
	 */
	public async GetRank(leaderboardName: string, id: string): Promise<RankData | undefined> {
		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${leaderboardName}/id/${id}/ranking`,
		);
		if (!result.success) {
			throw error(`Unable to get leaderboard rank. Status Code: ${result.statusCode}.\n${inspect(result.data)}`);
		}

		if (!result.data) return undefined;

		return DecodeJSON(result.data) as RankData;
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
	public async GetRankRange(leaderboardName: string, startIndex = 0, count = 100): Promise<RankData[]> {
		count = math.clamp(count, 1, 1000 - startIndex); // ensure they don't reach past 1000;

		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${leaderboardName}/rankings`,
		);
		if (!result.success) {
			throw error(
				`Unable to get leaderboard rankings. Status Code: ${result.statusCode}.\n${inspect(result.data)}`,
			);
		}

		if (!result.data) return [];

		return DecodeJSON(result.data) as RankData[];
	}
}
