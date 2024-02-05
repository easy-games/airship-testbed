/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { Result } from "../../../Shared/Types/Result";
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
export declare class LeaderboardService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Sends an update to the provided leaderboard. The scores provided are added to, subtracted from, or replace the existing
     * scores based on the leaderboard configuration.
     * @param leaderboardName The name of the leaderboard that should be updated with the given scores
     * @param update An object containing a map of ids and scores.
     */
    Update(leaderboardName: string, update: LeaderboardUpdate): Promise<Result<undefined, undefined>>;
    /**
     * Gets the rank of a given id.
     * @param leaderboardName The name of the leaderboard
     * @param id The id
     */
    GetRank(leaderboardName: string, id: string): Promise<Result<RankData | undefined, undefined>>;
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
    GetRankRange(leaderboardName: string, startIndex?: number, count?: number): Promise<Result<RankData[], undefined>>;
}
export {};
