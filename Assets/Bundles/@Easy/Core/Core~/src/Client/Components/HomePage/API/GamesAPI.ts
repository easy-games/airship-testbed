export interface GameDto {
	createdAt: string;
	description: string;
	icon: string;
	id: string;
	name: string;
	organization: {
		createdAt: string;
		description: string;
		icon: string;
		id: string;
		name: string;
		slug: string;
		slugProperCase: string;
	};
	liveStats: {
		playerCount: number;
	};
}

export interface GamesDto {
	popular: GameDto[];
	featured: GameDto[];
}
