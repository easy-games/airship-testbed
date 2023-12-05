export interface GameDto {
	liveStats: {
		playerCount: number;
	};
}

export interface GamesDto {
	popular: GameDto[];
	featured: GameDto[];
}
