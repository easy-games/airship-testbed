export interface MatchHudTeamDto {
	id: string;
	bed: boolean;
	playersRemaining: number;
}

export interface MatchHUDDto {
	teamUpdates?: MatchHudTeamDto[];
	kills?: number;
}
