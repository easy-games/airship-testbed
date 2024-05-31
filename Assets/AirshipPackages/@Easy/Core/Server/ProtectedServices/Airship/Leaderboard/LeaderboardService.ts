import { LeaderboardUpdate, RankData } from "@Easy/Core/Server/Services/Airship/Leaderboard/AirshipLeaderboardService";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export enum LeaderboardServiceBridgeTopics {
	Update = "LeaderboardService:Update",
	GetRank = "LeaderboardService:GetRank",
	GetRankRange = "LeaderboardService:GetRankRange",
}

export type ServerBridgeApiLeaderboardUpdate = (
	leaderboardName: string,
	update: LeaderboardUpdate,
) => Result<undefined, undefined>;
export type ServerBridgeApiLeaderboardGetRank = (
	leaderboardName: string,
	id: string,
) => Result<RankData | undefined, undefined>;
export type ServerBridgeApiLeaderboardGetRankRange = (
	leaderboardName: string,
	startIndex?: number,
	count?: number,
) => Result<RankData[], undefined>;

@Service({})
export class LeaderboardService implements OnStart {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiLeaderboardUpdate>(
			LeaderboardServiceBridgeTopics.Update,
			(_, leaderboardName, update) => {
				const result = InternalHttpManager.PostAsync(
					`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${leaderboardName}/stats`,
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
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardGetRank>(
			LeaderboardServiceBridgeTopics.GetRank,
			(_, leaderboardName, id) => {
				const result = InternalHttpManager.GetAsync(
					`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${leaderboardName}/id/${id}/ranking`,
				);
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
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardGetRankRange>(
			LeaderboardServiceBridgeTopics.GetRankRange,
			(_, leaderboardName, startIndex = 0, count = 100) => {
				count = math.clamp(count, 1, 1000 - startIndex); // ensure they don't reach past 1000;

				const result = InternalHttpManager.GetAsync(
					`${AirshipUrl.DataStoreService}/loaderboards/leaderboard-id/${leaderboardName}/rankings?skip=${startIndex}&limit=${count}`,
				);
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
			},
		);
	}

	OnStart(): void {}
}
