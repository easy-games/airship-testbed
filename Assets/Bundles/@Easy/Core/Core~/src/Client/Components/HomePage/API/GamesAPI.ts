export interface GameDto {
	createdAt: string;
	description: string;
	iconImageId: string;
	id: string;
	name: string;
	lastVersionUpdate?: string;
	organization: {
		createdAt: string;
		description: string;
		iconImageId: string;
		id: string;
		name: string;
		slug: string;
		slugProperCase: string;
	};
	liveStats?: {
		playerCount?: number;
	};
}

export interface GamesDto {
	popular: GameDto[];
	featured: GameDto[];
	recentlyUpdated: GameDto[];
}

export type MyGamesDto = GameDto[];
