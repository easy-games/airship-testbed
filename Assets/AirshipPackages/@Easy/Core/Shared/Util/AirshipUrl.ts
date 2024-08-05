// Manual typings for the C# "AirshipPlatformURL" class.
// This means we are getting all routes straight from C#.
declare const AirshipPlatformUrl: {
	GameCoordinator: string;
	ContentService: string;
	DataStoreService: string;
	DeploymentService: string;
	CDN: string;
};

export const AirshipUrl = {
	GameCoordinator: AirshipPlatformUrl.GameCoordinator,
	ContentService: AirshipPlatformUrl.ContentService,
	DataStoreService: AirshipPlatformUrl.DataStoreService,
	DeploymentService: AirshipPlatformUrl.DeploymentService,
	CDN: AirshipPlatformUrl.CDN,
};
