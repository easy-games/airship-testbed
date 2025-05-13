import { LeaderboardUpdate, Ranking } from "@Easy/Core/Shared/Airship/Types/AirshipLeaderboards";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { DataStoreServiceLeaderboards } from "@Easy/Core/Shared/TypePackages/data-store-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
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
export type ServerBridgeApiLeaderboardGetRank = (leaderboardName: string, id: string) => Ranking | undefined;
export type ServerBridgeApiLeaderboardDeleteEntry = (leaderboardName: string, id: string) => void;
export type ServerBridgeApiLeaderboardDeleteEntries = (leaderboardName: string, ids: string[]) => void;
export type ServerBridgeApiLeaderboardResetLeaderboard = (leaderboardName: string) => void;
export type ServerBridgeApiLeaderboardGetRankRange = (
	leaderboardName: string,
	startIndex?: number,
	count?: number,
) => Ranking[];

const client = new DataStoreServiceLeaderboards.Client(UnityMakeRequest(AirshipUrl.DataStoreService));

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

	public async Update(name: string, update: LeaderboardUpdate): Promise<ReturnType<ServerBridgeApiLeaderboardUpdate>> {
		await client.postLeaderboardStats({
			params: {
				leaderboardId: name,
			},
			data: {
				stats: update,
			},
		});
	}

	public async GetRank(name: string, id: string): Promise<ReturnType<ServerBridgeApiLeaderboardGetRank>> {
		const result = await client.getRanking({ leaderboardId: name, id });
		return result.ranking;
	}

	public async DeleteEntry(name: string, id: string): Promise<ReturnType<ServerBridgeApiLeaderboardDeleteEntry>> {
		await client.deleteStat({ leaderboardId: name, id });
	}

	public async DeleteEntries(
		name: string,
		ids: string[],
	): Promise<ReturnType<ServerBridgeApiLeaderboardDeleteEntries>> {
		await client.deleteStats({ params: { leaderboardId: name }, data: { ids } });
	}

	public async ResetLeaderboard(name: string): Promise<ReturnType<ServerBridgeApiLeaderboardResetLeaderboard>> {
		await client.resetLeaderboard({ leaderboardId: name, gameId: Game.gameId });
	}

	public async GetRankRange(
		name: string,
		startIndex = 0,
		count = 100,
	): Promise<ReturnType<ServerBridgeApiLeaderboardGetRankRange>> {
		count = math.clamp(count, 1, 1000 - startIndex); // ensure they don't reach past 1000;

		const result = await client.getRankings({
			params: { leaderboardId: name },
			query: {
				skip: startIndex,
				limit: count,
			},
		});

		return result;
	}

	protected OnStart(): void { }
}
