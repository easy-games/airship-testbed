import {
	AirshipLeaderboardRanking,
	AirshipLeaderboardUpdate,
} from "@Easy/Core/Shared/Airship/Types/AirshipLeaderboards";
import { Game } from "@Easy/Core/Shared/Game";
import { DataStoreServiceLeaderboards } from "@Easy/Core/Shared/TypePackages/data-store-types";
import { entries } from "@Easy/Core/Shared/Util/ObjectUtils";

/**
 * An in-memory representation of a single data store leaderboard.
 */
interface Leaderboard {
	sortOrder: "ASC" | "DESC";
	operator: DataStoreServiceLeaderboards.OperatorIndexType;
	userStats: { [playerId: string]: number };
}

/**
 * An in-memory representation of data store leaderboards.
 */
export default class EditorLeaderboards {
	private readonly leaderboards: Map<string, Leaderboard> = new Map();

	public constructor() {
		if (!Game.IsEditor()) {
			throw error("Cannot create an instance of EditorLeaderboards outside of the editor.");
		}
	}

	/**
	 * Creates an in-memory leaderboard.
	 *
	 * @param id The id of the leaderboard.
	 * @param options The options associated with the leaderboard (operator, sort order).
	 */
	public CreateLeaderboard(
		id: string,
		options: { sortOrder: "ASC" | "DESC"; operator: DataStoreServiceLeaderboards.OperatorIndexType },
	) {
		const currentLeaderboard = this.leaderboards.get(id);

		if (currentLeaderboard !== undefined) {
			warn(`Leaderboard with id ${id} already exists. Replacing options instead of resetting user data.`);
		}

		this.leaderboards.set(id, { ...options, userStats: currentLeaderboard?.userStats ?? {} });
	}

	private CheckLeaderboardExists(id: string): Leaderboard {
		const leaderboard = this.leaderboards.get(id);

		if (!leaderboard) {
			throw error(
				"Leaderboard does not exist. Try using Platform.Server.Leaderboard.InEditorCreateLeaderboard when in editor to recreate your leaderboards.",
			);
		}

		return leaderboard;
	}

	public Update(id: string, update: AirshipLeaderboardUpdate) {
		const leaderboard = this.CheckLeaderboardExists(id);

		switch (leaderboard.operator) {
			case "SET":
				for (const [playerId, value] of entries(update)) {
					const currentValue = leaderboard.userStats[playerId];
					if (!currentValue) {
						leaderboard.userStats[playerId] = value;
						continue;
					}
					switch (leaderboard.sortOrder) {
						case "ASC":
							if (currentValue > value) {
								leaderboard.userStats[playerId] = value;
							}
							break;
						case "DESC":
							if (currentValue < value) {
								leaderboard.userStats[playerId] = value;
							}
							break;
					}
				}
				break;
			case "ADD":
				for (const [playerId, value] of entries(update)) {
					const currentValue = leaderboard.userStats[playerId];
					if (currentValue === undefined) {
						leaderboard.userStats[playerId] = value;
					} else {
						leaderboard.userStats[playerId] = currentValue + value;
					}
				}
				break;
			case "SUB":
				for (const [playerId, value] of entries(update)) {
					const currentValue = leaderboard.userStats[playerId];
					if (currentValue === undefined) {
						leaderboard.userStats[playerId] = value;
					} else {
						leaderboard.userStats[playerId] = currentValue - value;
					}
				}
				break;
			case "USE_LATEST":
				for (const [playerId, value] of entries(update)) {
					leaderboard.userStats[playerId] = value;
				}
				break;
		}
	}

	public DeleteUserEntry(id: string, playerId: string) {
		const leaderboard = this.CheckLeaderboardExists(id);

		delete leaderboard.userStats[playerId];
	}

	public DeleteUserEntries(id: string, playerIds: string[]) {
		const leaderboard = this.CheckLeaderboardExists(id);

		for (const playerId of playerIds) {
			delete leaderboard.userStats[playerId];
		}
	}

	public ResetLeaderboard(id: string) {
		const leaderboard = this.CheckLeaderboardExists(id);

		leaderboard.userStats = {};
	}

	private GetSortedRankings(leaderboard: Leaderboard): Array<[playerId: string, stat: number]> {
		return entries(leaderboard.userStats).sort((a, b) => {
			switch (leaderboard.sortOrder) {
				case "ASC":
					return a[1] < b[1];
				case "DESC":
					return a[1] > b[1];
			}
		}) as Array<[string, number]>;
	}

	public GetRanking(id: string, playerId: string): AirshipLeaderboardRanking | undefined {
		const leaderboard = this.CheckLeaderboardExists(id);
		const rankings = this.GetSortedRankings(leaderboard);

		const playerIndex = rankings.findIndex(([thisPlayerId]) => thisPlayerId === playerId);

		if (playerIndex === -1) {
			return undefined;
		}

		const ranking = rankings[playerIndex];
		return {
			id: playerId,
			rank: playerIndex + 1,
			value: ranking[1],
		};
	}

	public GetRankRange(id: string, startIndex: number, maxCount: number): AirshipLeaderboardRanking[] {
		const leaderboard = this.CheckLeaderboardExists(id);
		const rankings = this.GetSortedRankings(leaderboard);
		const size = rankings.size();

		if (size < startIndex) {
			return [];
		}

		const result: Array<[index: number, [playerId: string, value: number]]> = [];

		// todo: look into what it would take to integrate `,` operator:
		//  for (let v1 = 0, v2 = 0;; v1++, v2++) {}
		//  should be valid code
		let i = startIndex;
		for (let count = 0; count < maxCount && i < size; count++) {
			result.push([i, rankings[i]]);
			i++;
		}

		return result.map(([index, [playerId, value]]) => {
			return {
				id: playerId,
				rank: index + 1,
				value,
			};
		});
	}
}
