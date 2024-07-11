import { LeaderboardUpdate } from "@Easy/Core/Server/Services/Airship/Leaderboard/AirshipLeaderboardService";
import { RankData } from "@Easy/Core/Shared/Airship/Types/Outputs/AirshipLeaderboard";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Result } from "@Easy/Core/Shared/Types/Result";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";

export const enum LeaderboardServiceBridgeTopics {
	Update = "LeaderboardService:Update",
	GetRank = "LeaderboardService:GetRank",
	GetRankRange = "LeaderboardService:GetRankRange",
}

export type ServerBridgeApiLeaderboardUpdate = (
	leaderboardName: string,
	update: LeaderboardUpdate,
) => Result<undefined, string>;
export type ServerBridgeApiLeaderboardGetRank = (
	leaderboardName: string,
	id: string,
) => Result<RankData | undefined, string>;
export type ServerBridgeApiLeaderboardGetRankRange = (
	leaderboardName: string,
	startIndex?: number,
	count?: number,
) => Result<RankData[], string>;

@Service({})
export class ProtectedLeaderboardService {
	constructor() {
		if (!Game.IsServer()) return;

		contextbridge.callback<ServerBridgeApiLeaderboardUpdate>(
			LeaderboardServiceBridgeTopics.Update,
			(_, leaderboardName, update) => {
				const [success, result] = this.Update(leaderboardName, update).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardGetRank>(
			LeaderboardServiceBridgeTopics.GetRank,
			(_, leaderboardName, id) => {
				const [success, result] = this.GetRank(leaderboardName, id).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);

		contextbridge.callback<ServerBridgeApiLeaderboardGetRankRange>(
			LeaderboardServiceBridgeTopics.GetRankRange,
			(_, leaderboardName, startIndex = 0, count = 100) => {
				const [success, result] = this.GetRankRange(leaderboardName, startIndex, count).await();
				if (!success) {
					return { success: false, error: "Unable to complete request." };
				}
				return result;
			},
		);
	}

	public async Update(
		name: string,
		update: LeaderboardUpdate,
	): Promise<ReturnType<ServerBridgeApiLeaderboardUpdate>> {
		const result = InternalHttpManager.PostAsync(
			`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/stats`,
			EncodeJSON({
				stats: update,
			}),
		);

		if (!result.success || result.statusCode > 299) {
			warn(`Unable to update leaderboard. Status Code: ${result.statusCode}.\n`, result.error);
			return {
				success: false,
				error: result.error,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	public async GetRank(name: string, id: string): Promise<ReturnType<ServerBridgeApiLeaderboardGetRank>> {
		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.DataStoreService}/leaderboards/leaderboard-id/${name}/id/${id}/ranking`,
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get leaderboard rank. Status Code: ${result.statusCode}.\n`, result.error);
			return {
				success: false,
				error: result.error,
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

	public async GetRankRange(
		name: string,
		startIndex = 0,
		count = 100,
	): Promise<ReturnType<ServerBridgeApiLeaderboardGetRankRange>> {
		count = math.clamp(count, 1, 1000 - startIndex); // ensure they don't reach past 1000;

		const result = InternalHttpManager.GetAsync(
			`${AirshipUrl.DataStoreService}/loaderboards/leaderboard-id/${name}/rankings?skip=${startIndex}&limit=${count}`,
		);
		if (!result.success || result.statusCode > 299) {
			warn(`Unable to get leaderboard rankings. Status Code: ${result.statusCode}.\n`, result.error);
			return {
				success: false,
				error: result.error,
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

	protected OnStart(): void {}
}
