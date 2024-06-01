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
