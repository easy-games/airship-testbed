import {
	LeaderboardServiceBridgeTopics,
	ServerBridgeApiLeaderboardDeleteEntries,
	ServerBridgeApiLeaderboardDeleteEntry,
	ServerBridgeApiLeaderboardGetRank,
	ServerBridgeApiLeaderboardGetRankRange,
	ServerBridgeApiLeaderboardResetLeaderboard,
	ServerBridgeApiLeaderboardUpdate,
} from "@Easy/Core/Server/ProtectedServices/Airship/Leaderboard/LeaderboardService";
import { Platform } from "@Easy/Core/Shared/Airship";
import {
	AirshipLeaderboardRanking,
	AirshipLeaderboardUpdate,
} from "@Easy/Core/Shared/Airship/Types/AirshipLeaderboards";
import { Service } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import EditorLeaderboards from "./EditorLeaderboards";

/**
 * This service provides access to leaderboard information as well as methods for updating existing leaderboards.
 * Leaderboards must be created using the https://create.airship.gg website. Once a leaderboard is created, it can be
 * accessed using the name provided during setup.
 */
@Service({})
export class AirshipLeaderboardService {
	private readonly editorLeaderboards: EditorLeaderboards;

	constructor() {
		if (!Game.IsServer()) return;
		if (Game.IsEditor()) {
			this.editorLeaderboards = new EditorLeaderboards();
		}

		Platform.Server.Leaderboard = this;
	}

	protected OnStart(): void {}

	/**
	 * This function is restricted to only in-editor use.
	 *
	 * Used to create an ephemeral leaderboard within the editor to test functions and views when using a leaderboard.
	 * @param leaderboardName The name of the leaderboard that should be created.
	 *
	 */
	public InEditorCreateLeaderboard(options: {
		id: string;
		operator: "SET" | "ADD" | "SUB" | "USE_LATEST";
		sortOrder: "ASC" | "DESC";
	}) {
		if (!Game.IsEditor()) {
			throw "InEditorCreateLeaderboard can only be executed in the unity editor.";
		}

		this.editorLeaderboards.CreateLeaderboard(options.id, { ...options });
	}

	/**
	 * Sends an update to the provided leaderboard. The scores provided are added to, subtracted from, or replace the existing
	 * scores based on the leaderboard configuration.
	 * @param leaderboardName The name of the leaderboard that should be updated with the given scores
	 * @param update An object containing a map of ids and scores.
	 */
	public async Update(leaderboardName: string, update: AirshipLeaderboardUpdate): Promise<void> {
		if (Game.IsEditor()) {
			this.editorLeaderboards.Update(leaderboardName, update);
			return;
		}

		return contextbridge.invoke<ServerBridgeApiLeaderboardUpdate>(
			LeaderboardServiceBridgeTopics.Update,
			LuauContext.Protected,
			leaderboardName,
			update,
		);
	}

	/**
	 * Gets the rank of a given id.
	 * @param leaderboardName The name of the leaderboard
	 * @param id The id
	 */
	public async GetRank(leaderboardName: string, id: string): Promise<AirshipLeaderboardRanking | undefined> {
		if (Game.IsEditor()) {
			return this.editorLeaderboards.GetRanking(leaderboardName, id);
		}

		return contextbridge.invoke<ServerBridgeApiLeaderboardGetRank>(
			LeaderboardServiceBridgeTopics.GetRank,
			LuauContext.Protected,
			leaderboardName,
			id,
		);
	}

	/**
	 * Deletes an entry on the leaderboard if it exists.
	 * @param leaderboardName
	 * @param id
	 */
	public async DeleteEntry(leaderboardName: string, id: string): Promise<void> {
		if (Game.IsEditor()) {
			this.editorLeaderboards.DeleteUserEntry(leaderboardName, id);
			return;
		}

		return contextbridge.invoke<ServerBridgeApiLeaderboardDeleteEntry>(
			LeaderboardServiceBridgeTopics.DeleteEntry,
			LuauContext.Protected,
			leaderboardName,
			id,
		);
	}

	/**
	 * Deletes a set of entries from the leaderboard if they exist.
	 * @param leaderboardName
	 * @param ids
	 */
	public async DeleteEntries(leaderboardName: string, ids: string[]): Promise<void> {
		if (Game.IsEditor()) {
			this.editorLeaderboards.DeleteUserEntries(leaderboardName, ids);
			return;
		}

		return contextbridge.invoke<ServerBridgeApiLeaderboardDeleteEntries>(
			LeaderboardServiceBridgeTopics.DeleteEntries,
			LuauContext.Protected,
			leaderboardName,
			ids,
		);
	}

	/**
	 * Clears all entries from the leaderboard. You can also reset a leaderboard using the https://create.airship.gg website.
	 * @param leaderboardName
	 */
	public async ResetLeaderboard(leaderboardName: string): Promise<void> {
		if (Game.IsEditor()) {
			this.editorLeaderboards.ResetLeaderboard(leaderboardName);
			return;
		}

		return contextbridge.invoke<ServerBridgeApiLeaderboardResetLeaderboard>(
			LeaderboardServiceBridgeTopics.ResetLeaderboard,
			LuauContext.Protected,
			leaderboardName,
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
	): Promise<AirshipLeaderboardRanking[]> {
		if (Game.IsEditor()) {
			return this.editorLeaderboards.GetRankRange(leaderboardName, startIndex, count);
		}

		return contextbridge.invoke<ServerBridgeApiLeaderboardGetRankRange>(
			LeaderboardServiceBridgeTopics.GetRankRange,
			LuauContext.Protected,
			leaderboardName,
			startIndex,
			count,
		);
	}
}
