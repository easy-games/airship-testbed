import {
	LeaderboardServiceBridgeTopics,
	ServerBridgeApiLeaderboardGetRank,
	ServerBridgeApiLeaderboardGetRankRange,
	ServerBridgeApiLeaderboardUpdate,
} from "@Easy/Core/Server/ProtectedServices/Airship/Leaderboard/LeaderboardService";
import { Platform } from "@Easy/Core/Shared/Airship";
import { RankData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipLeaderboard";
import { AirshipUtil } from "@Easy/Core/Shared/Airship/Util/AirshipUtil";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";

export interface LeaderboardUpdate {
	[id: string]: number;
}

@Service({})
export class AirshipLeaderboardService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		Platform.server.leaderboard = this;
	}

	OnStart(): void {}

	/**
	 * Sends an update to the provided leaderboard. The scores provided are added to, subtracted from, or replace the existing
	 * scores based on the leaderboard configuration.
	 * @param leaderboardName The name of the leaderboard that should be updated with the given scores
	 * @param update An object containing a map of ids and scores.
	 */
	public async Update(leaderboardName: string, update: LeaderboardUpdate): Promise<Result<undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiLeaderboardUpdate>(
			LeaderboardServiceBridgeTopics.Update,
			leaderboardName,
			update,
		);
	}

	/**
	 * Gets the rank of a given id.
	 * @param leaderboardName The name of the leaderboard
	 * @param id The id
	 */
	public async GetRank(leaderboardName: string, id: string): Promise<Result<RankData | undefined, undefined>> {
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiLeaderboardGetRank>(
			LeaderboardServiceBridgeTopics.GetRank,
			leaderboardName,
			id,
		);
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
		return await AirshipUtil.PromisifyBridgeInvoke<ServerBridgeApiLeaderboardGetRankRange>(
			LeaderboardServiceBridgeTopics.Update,
			leaderboardName,
			startIndex,
			count,
		);
	}
}
