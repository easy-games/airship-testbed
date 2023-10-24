export interface PlayerMatchStats {
	kills: number;
	deaths: number;
}
export type PlayerMatchStatsDto = PlayerMatchStats & {
	userId: string;
};
