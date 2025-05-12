import { ContentServiceGames } from "../../TypePackages/content-service-types";

export type GameDto = Omit<ContentServiceGames.AutocompleteSearchGame, "lastVersionUpdate"> & {
	lastVersionUpdate?: string;
};
