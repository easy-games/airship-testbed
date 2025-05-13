import { ContentServiceGames } from "../../TypePackages/content-service-types";

export type AirshipGame = Omit<ContentServiceGames.AutocompleteSearchGame, "lastVersionUpdate"> & {
	lastVersionUpdate?: string;
};

export type AirshipGameWithOrg = ContentServiceGames.PublicGameWithOrg;
