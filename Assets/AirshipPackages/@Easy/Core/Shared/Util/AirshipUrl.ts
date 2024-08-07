// Manual typings for the C# "AirshipPlatformURL" class.
// This means we are getting all routes straight from C#.
declare const AirshipPlatformUrl: {
	gameCoordinator: string;
	contentService: string;
	dataStoreService: string;
	deploymentService: string;
	cdn: string;
	gameCdn: string;
};

export const AirshipUrl = {
	GameCoordinator: AirshipPlatformUrl.gameCoordinator,
	ContentService: AirshipPlatformUrl.contentService,
	DataStoreService: AirshipPlatformUrl.dataStoreService,
	DeploymentService: AirshipPlatformUrl.deploymentService,
	CDN: AirshipPlatformUrl.cdn,
	GameCDN: AirshipPlatformUrl.gameCdn,
};
