import { ContentServiceDatabaseTypes, ContentServiceGames, InternalContentServiceTypes } from "../../TypePackages/content-service-types";

export type AirshipGame = Omit<ContentServiceGames.AutocompleteSearchGame, "lastVersionUpdate"> & {
	lastVersionUpdate?: string;
};

export type AirshipGameWithOrg = ContentServiceGames.PublicGameWithOrg;

export type AirshipDeploymentPlatform = InternalContentServiceTypes.DeploymentPlatform;

export type AirshipGameVisibility = ContentServiceDatabaseTypes.GameVisibility;
export const AirshipGameVisibility = ContentServiceDatabaseTypes.GameVisibility;
