import { LeaderboardUpdate } from "@Easy/Core/Server/Services/Airship/Leaderboard/AirshipLeaderboardService";
import { RankData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipLeaderboard";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { RetryHttp429 } from "@Easy/Core/Shared/Http/HttpRetry";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const enum LeaderboardServiceBridgeTopics {
	Update = "LeaderboardService:Update",
	GetRank = "LeaderboardService:GetRank",
	DeleteEntry = "LeaderboardService:DeleteEntry",
	DeleteEntries = "LeaderboardService:DeleteEntries",
	ResetLeaderboard = "LeaderboardService:ResetLeaderboard",
	GetRankRange = "LeaderboardService:GetRankRange",
}

export type ServerBridgeApiLeaderboardUpdate = (leaderboardName: string, update: LeaderboardUpdate) => void;
export type ServerBridgeApiLeaderboardGetRank = (leaderboardName: string, id: string) => RankData | undefined;
export type ServerBridgeApiLeaderboardDeleteEntry = (leaderboardName: string, id: string) => void;
export type ServerBridgeApiLeaderboardDeleteEntries = (leaderboardName: string, ids: string[]) => void;
export type ServerBridgeApiLeaderboardResetLeaderboard = (leaderboardName: string) => void;
export type ServerBridgeApiLeaderboardGetRankRange = (
	leaderboardName: string,
	startIndex?: number,
	count?: number,
) => RankData[];

@Service({})
export class ProtectedLeaderboardService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiLeaderboardUpdate>(
			LeaderboardServiceBridgeTopics.Update,
			(_, leaderboardName, update) => {
				return this.Update(leaderboardName, update).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardGetRank>(
			LeaderboardServiceBridgeTopics.GetRank,
			(_, leaderboardName, id) => {
				return this.GetRank(leaderboardName, id).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardGetRankRange>(
			LeaderboardServiceBridgeTopics.GetRankRange,
			(_, leaderboardName, startIndex = 0, count = 100) => {
				return this.GetRankRange(leaderboardName, startIndex, count).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardDeleteEntry>(
			LeaderboardServiceBridgeTopics.DeleteEntry,
			(_, leaderboardName, id) => {
				return this.DeleteEntry(leaderboardName, id).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardDeleteEntries>(
			LeaderboardServiceBridgeTopics.DeleteEntries,
			(_, leaderboardName, ids) => {
				return this.DeleteEntries(leaderboardName, ids).expect();
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardResetLeaderboard>(
			LeaderboardServiceBridgeTopics.ResetLeaderboard,
			(_, leaderboardName) => {
				return this.ResetLeaderboard(leaderboardName).expect();
			},
		);
	}

	public async Update(
		name: string,
		update: LeaderboardUpdate,
	): Promise<ReturnType<ServerBridgeApiLeaderboardUpdate>> {
		const result = await RetryHttp429(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/stats`,
				json.encode({
					stats: update,
				}),
			),
			{ retryKey: "post/data-store-service/leaderboards/leaderboard-id/:leaderboardName/stats" },
		);

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to update leaderboard. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}
	}

	public async GetRank(name: string, id: string): Promise<ReturnType<ServerBridgeApiLeaderboardGetRank>> {
		const result = await RetryHttp429(
			() => InternalHttpManager.GetAsync(
				`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/id/${id}/ranking`,
			),
			{ retryKey: "get/data-store-service/leaderboards/leaderboard-id/:leaderboardName/id/:id/ranking" },
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get leaderboard rank. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		return json.decode<{ ranking: RankData | undefined }>(result.data).ranking;
	}

	public async DeleteEntry(name: string, id: string): Promise<ReturnType<ServerBridgeApiLeaderboardDeleteEntry>> {
		const result = await RetryHttp429(
			() => InternalHttpManager.DeleteAsync(
				`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/id/${id}/stats`,
			),
			{ retryKey: "delete/data-store-service/leaderboards/leaderboard-id/:leaderboardName/id/:id/stats" },
		);

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to update leaderboard. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}
	}

	public async DeleteEntries(
		name: string,
		ids: string[],
	): Promise<ReturnType<ServerBridgeApiLeaderboardDeleteEntries>> {
		const result = await RetryHttp429(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/stats/batch-delete`,
				json.encode({
					ids,
				}),
			),
			{ retryKey: "post/data-store-service/leaderboards/leaderboard-id/:leaderboardName/stats/batch-delete" },
		);

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to update leaderboard. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}
	}

	public async ResetLeaderboard(name: string): Promise<ReturnType<ServerBridgeApiLeaderboardResetLeaderboard>> {
		const result = await RetryHttp429(
			() => InternalHttpManager.PostAsync(
				`${AirshipUrl.DataStoreService}/leaderboards/game-id/${Game.gameId}/leaderboard-id/${name}/reset`,
			),
			{ retryKey: "post/data-store-service/leaderboards/game-id/:gameId/leaderboard-id/:leaderboardName/reset" },
		);

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to reset leaderboard. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}
	}

	public async GetRankRange(
		name: string,
		startIndex = 0,
		count = 100,
	): Promise<ReturnType<ServerBridgeApiLeaderboardGetRankRange>> {
		count = math.clamp(count, 1, 1000 - startIndex); // ensure they don't reach past 1000;

		const result = await RetryHttp429(
			() => InternalHttpManager.GetAsync(
				`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/rankings?skip=${startIndex}&limit=${count}`,
			),
			{ retryKey: "get/data-store-service/leaderboards/leaderboard-id/:leaderboardName/rankings" },
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get leaderboard rankings. Status Code: ${result.statusCode}.\n`, result.error);
			throw result.error;
		}

		if (!result.data) {
			return [];
		}

		return json.decode(result.data) as RankData[];
	}

	protected OnStart(): void {}
}
