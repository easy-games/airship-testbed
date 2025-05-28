import { encodeURIComponent } from "./UnityMakeRequest";

export type AuthenticationProvider = string | (() => string | Promise<string>);
export type AllowedQueryTypes =
	| string
	| number
	| boolean
	| readonly string[]
	| readonly number[]
	| readonly boolean[]
	| undefined;
export type QueryRecord<Keys extends string | number | symbol> = {
	[K in Keys]?: AllowedQueryTypes;
};
export interface HttpRequestParams<Query extends QueryRecord<keyof Query>> {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "TRACE" | "HEAD";
	path: string;
	routeId: string;

	query?: Query;
	body?: unknown;
	retryKey: string;
}
export interface RequestOptions {
	retryKey?: string;
}
export type MakeRequest = <T, Query extends QueryRecord<keyof Query>>(request: HttpRequestParams<Query>) => Promise<T>;

// ====+==== PRISMA TYPES ====+====
export namespace DeploymentServicePrisma {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const AgonesFleet = {
		COST_OPTIMIZED: "cost-optimized",
		STANDARD: "standard",
		HIGH_PERFORMANCE: "high-performance",
	} as const;
	export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const ResourceType = {
		GAME: "GAME",
		PACKAGE: "PACKAGE",
	} as const;
	export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const AirAssetOwnerType = {
		ORGANIZATION: "ORGANIZATION",
	} as const;
	export type AirAssetOwnerType = (typeof AirAssetOwnerType)[keyof typeof AirAssetOwnerType];
	export type AirAssetPlatformJson = Partial<
		Record<"Windows" | "Mac" | "Linux" | "iOS" | "Android" | "Shared", { size: number }>
	>;
	export type AirAsset = {
		ownerType: DeploymentServicePrisma.AirAssetOwnerType;
		ownerId: string;
		airAssetId: string;
		name: string | undefined;
		description: string | undefined;
		createdAt: string;
		updatedAt: string;
		platforms: DeploymentServicePrisma.AirAssetPlatformJson;
	};
	export type GameSettings = {
		gameId: string;
		defaultMaxPlayers: number;
		defaultFleet: DeploymentServicePrisma.AgonesFleet;
	};
	export type GameVersion = {
		gameVersionId: string;
		gameId: string;
		assetVersionNumber: number;
		codeVersionNumber: number;
		minPlayerVersion: number;
		defaultScene: string;
		active: boolean;
		uploadComplete: boolean;
		creationTime: string;
		packageSlugs: string[];
		platforms: string[];
		publishNumber: number | undefined;
	};
	export type PlayerVersion = {
		playerVersionId: string;
		playerVersion: string;
		active: boolean;
		creationTime: string;
	};
	export type ApiKeyMeta = {
		id: string;
		name: string;
		creatorUid: string;
		organizationId: string;
		creationTime: string;
		lastUsed: string;
	};
	export type ApiPermission = {
		resourceType: DeploymentServicePrisma.ResourceType;
		resourceId: string;
		apiKeyMetaId: string;
	};
	export type ApiKey = {
		key: string;
		apiKeyMetaId: string;
	};
	export type PackageVersion = {
		packageVersionId: string;
		packageSlug: string;
		assetVersionNumber: number;
		codeVersionNumber: number;
		active: boolean;
		uploadComplete: boolean;
		creationTime: string;
		publishNumber: number | undefined;
		platforms: string[];
	};
}
// ====+==== AirAssets TYPES ====+====
export namespace DeploymentServiceAirAssets {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const AirAssetPlatform = {
		WINDOWS: "Windows",
		MAC: "Mac",
		LINUX: "Linux",
		IOS: "iOS",
		ANDROID: "Android",
		SHARED: "Shared",
	} as const;
	export type AirAssetPlatform = (typeof AirAssetPlatform)[keyof typeof AirAssetPlatform];
	export interface CreateAirAssetDto {
		name?: string;
		description?: string;
		platforms?: AirAssetPlatform[];
	}
	export type CreateAirAssetArgs = {
		params: {
			ownerId: string;
			ownerType: string;
		};
		data: CreateAirAssetDto;
	};
	export interface PutAirAssetDto {
		name?: string;
		description?: string;
		platforms?: AirAssetPlatform[];
	}
	export type UpdateAirAssetArgs = {
		params: {
			assetId: string;
		};
		data: PutAirAssetDto;
	};
	export type GetAirAssetsForOwnerWithKeyArgs = {
		params: {
			ownerId: string;
			ownerType: string;
		};
	};
	export type DeleteAirAssetArgs = {
		params: {
			assetId: string;
		};
	};
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const DeploymentPlatform = {
		WINDOWS: "Windows",
		MAC: "Mac",
		LINUX: "Linux",
		IOS: "iOS",
		ANDROID: "Android",
	} as const;
	export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
	export type AirAssetWithUrl = {
		airAssetId: string;
		urls: Record<DeploymentPlatform, string>;
		headers: Array<{ key: string; value: string }>;
	};

	export interface ClientSpec {
		createAirAsset(args: CreateAirAssetArgs, options?: RequestOptions): Promise<AirAssetWithUrl>;
		updateAirAsset(args: UpdateAirAssetArgs, options?: RequestOptions): Promise<AirAssetWithUrl>;
		getAirAssetsForOwnerWithKey(
			args: GetAirAssetsForOwnerWithKeyArgs["params"],
			options?: RequestOptions,
		): Promise<{ assets: DeploymentServicePrisma.AirAsset[] }>;
		deleteAirAsset(args: DeleteAirAssetArgs["params"], options?: RequestOptions): Promise<void>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async createAirAsset(args: CreateAirAssetArgs, options?: RequestOptions): Promise<AirAssetWithUrl> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:AirAssets:createAirAsset",
				path: `/air-assets/owner-type/${encodeURIComponent(
					args.params.ownerType,
				)}/owner-id/${encodeURIComponent(args.params.ownerId)}`,
				retryKey: options?.retryKey ?? "DeploymentService:AirAssets:createAirAsset",
				body: args.data,
			});
		}
		async updateAirAsset(args: UpdateAirAssetArgs, options?: RequestOptions): Promise<AirAssetWithUrl> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "DeploymentService:AirAssets:updateAirAsset",
				path: `/air-assets/${encodeURIComponent(args.params.assetId)}`,
				retryKey: options?.retryKey ?? "DeploymentService:AirAssets:updateAirAsset",
				body: args.data,
			});
		}
		async getAirAssetsForOwnerWithKey(
			args: GetAirAssetsForOwnerWithKeyArgs["params"],
			options?: RequestOptions,
		): Promise<{ assets: DeploymentServicePrisma.AirAsset[] }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:AirAssets:getAirAssetsForOwnerWithKey",
				path: `/air-assets/owner-type/${encodeURIComponent(args.ownerType)}/owner-id/${encodeURIComponent(
					args.ownerId,
				)}`,
				retryKey: options?.retryKey ?? "DeploymentService:AirAssets:getAirAssetsForOwnerWithKey",
			});
		}
		async deleteAirAsset(args: DeleteAirAssetArgs["params"], options?: RequestOptions): Promise<void> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "DeploymentService:AirAssets:deleteAirAsset",
				path: `/air-assets/${encodeURIComponent(args.assetId)}`,
				retryKey: options?.retryKey ?? "DeploymentService:AirAssets:deleteAirAsset",
			});
		}
	}
}
// ====+==== External TYPES ====+====
export namespace DeploymentServiceExternal {}
// ====+==== Fleet TYPES ====+====
export namespace DeploymentServiceFleet {
	export interface DeployFleetDto {
		playerVersion?: string;
		targetClusters?: string[];
	}
	export type DeployFleetArgs = {
		data: DeployFleetDto;
	};

	export interface ClientSpec {
		deployFleet(args: DeployFleetArgs["data"], options?: RequestOptions): Promise<void>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async deployFleet(args: DeployFleetArgs["data"], options?: RequestOptions): Promise<void> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:Fleet:deployFleet",
				path: `/fleets/deploy`,
				retryKey: options?.retryKey ?? "DeploymentService:Fleet:deployFleet",
				body: args,
			});
		}
	}
}
// ====+==== GameServers TYPES ====+====
export namespace DeploymentServiceGameServers {
	export interface ShutdownGameDto {
		gameId: string;
		sceneIds?: string[];
	}
	export type ShutdownGameArgs = {
		data: ShutdownGameDto;
	};

	export interface ClientSpec {
		shutdownGame(args: ShutdownGameArgs["data"], options?: RequestOptions): Promise<void>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async shutdownGame(args: ShutdownGameArgs["data"], options?: RequestOptions): Promise<void> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:GameServers:shutdownGame",
				path: `/game-servers/shutdown`,
				retryKey: options?.retryKey ?? "DeploymentService:GameServers:shutdownGame",
				body: args,
			});
		}
	}
}
// ====+==== GameSettings TYPES ====+====
export namespace DeploymentServiceGameSettings {
	export type GetSettingsArgs = {
		params: {
			gameId: string;
		};
	};
	export interface UpdateGameSettingsDto {
		defaultMaxPlayers?: number;
		defaultFleet?: DeploymentServicePrisma.AgonesFleet;
	}
	export type UpdateSettingsArgs = {
		params: {
			gameId: string;
		};
		data: UpdateGameSettingsDto;
	};

	export interface ClientSpec {
		getSettings(
			args: GetSettingsArgs["params"],
			options?: RequestOptions,
		): Promise<DeploymentServicePrisma.GameSettings>;
		updateSettings(
			args: UpdateSettingsArgs,
			options?: RequestOptions,
		): Promise<DeploymentServicePrisma.GameSettings>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getSettings(
			args: GetSettingsArgs["params"],
			options?: RequestOptions,
		): Promise<DeploymentServicePrisma.GameSettings> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:GameSettings:getSettings",
				path: `/game-settings/game-id/${encodeURIComponent(args.gameId)}`,
				retryKey: options?.retryKey ?? "DeploymentService:GameSettings:getSettings",
			});
		}
		async updateSettings(
			args: UpdateSettingsArgs,
			options?: RequestOptions,
		): Promise<DeploymentServicePrisma.GameSettings> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "DeploymentService:GameSettings:updateSettings",
				path: `/game-settings/game-id/${encodeURIComponent(args.params.gameId)}`,
				retryKey: options?.retryKey ?? "DeploymentService:GameSettings:updateSettings",
				body: args.data,
			});
		}
	}
}
// ====+==== GameVersions TYPES ====+====
export namespace DeploymentServiceGameVersions {
	export type GetCurrentVersionArgs = {
		params: {
			gameId: string;
		};
	};
	export interface GetGameVersionHistory {
		limit?: number;
		cursor?: string;
	}
	export type GetVersionHistoryArgs = {
		params: {
			gameId: string;
		};
		query?: GetGameVersionHistory;
	};
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const DeploymentPlatform = {
		WINDOWS: "Windows",
		MAC: "Mac",
		LINUX: "Linux",
		IOS: "iOS",
		ANDROID: "Android",
	} as const;
	export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
	export interface UploadGameDto {
		gameId: string;
		minPlayerVersion: string;
		defaultScene: string;
		deployAssets: boolean;
		deployCode: boolean;
		packageSlugs?: string[];
		platforms?: DeploymentPlatform[];
	}
	export type GetNewDeploymentArgs = {
		data: UploadGameDto;
	};
	export interface CompleteDeploymentDto {
		gameId: string;
		gameVersionId: string;
		uploadedFileIds: string[];
	}
	export type CompleteDeploymentArgs = {
		data: CompleteDeploymentDto;
	};
	export interface ActivateGameVersionDto {
		gameId: string;
		gameVersionId: string;
	}
	export type ActivateVersionArgs = {
		data: ActivateGameVersionDto;
	};
	export type AssetFileMetadataDto = Partial<
		Record<DeploymentPlatform, { files: { [name: string]: { size: number } }; size: number }>
	>;
	export type GameVersionDto = DeploymentServicePrisma.GameVersion & { assetFileMetadata: AssetFileMetadataDto };

	export interface ClientSpec {
		getCurrentVersion(
			args: GetCurrentVersionArgs["params"],
			options?: RequestOptions,
		): Promise<{
			version:
				| {
						game: GameVersionDto;
						platform: DeploymentServicePrisma.PlayerVersion;
						settings: DeploymentServicePrisma.GameSettings;
				  }
				| undefined;
		}>;
		getVersionHistory(
			args: GetVersionHistoryArgs,
			options?: RequestOptions,
		): Promise<{ versions: GameVersionDto[]; cursor?: string }>;
		getNewDeployment(
			args: GetNewDeploymentArgs["data"],
			options?: RequestOptions,
		): Promise<{
			urls: { [location: string]: string };
			headers: { [header: string]: string };
			version: GameVersionDto;
		}>;
		completeDeployment(args: CompleteDeploymentArgs["data"], options?: RequestOptions): Promise<GameVersionDto>;
		activateVersion(args: ActivateVersionArgs["data"], options?: RequestOptions): Promise<GameVersionDto>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getCurrentVersion(
			args: GetCurrentVersionArgs["params"],
			options?: RequestOptions,
		): Promise<{
			version:
				| {
						game: GameVersionDto;
						platform: DeploymentServicePrisma.PlayerVersion;
						settings: DeploymentServicePrisma.GameSettings;
				  }
				| undefined;
		}> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:GameVersions:getCurrentVersion",
				path: `/game-versions/gameId/${encodeURIComponent(args.gameId)}`,
				retryKey: options?.retryKey ?? "DeploymentService:GameVersions:getCurrentVersion",
			});
		}
		async getVersionHistory(
			args: GetVersionHistoryArgs,
			options?: RequestOptions,
		): Promise<{ versions: GameVersionDto[]; cursor?: string }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:GameVersions:getVersionHistory",
				path: `/game-versions/gameId/${encodeURIComponent(args.params.gameId)}/history`,
				retryKey: options?.retryKey ?? "DeploymentService:GameVersions:getVersionHistory",
				query: args.query,
			});
		}
		async getNewDeployment(
			args: GetNewDeploymentArgs["data"],
			options?: RequestOptions,
		): Promise<{
			urls: { [location: string]: string };
			headers: { [header: string]: string };
			version: GameVersionDto;
		}> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:GameVersions:getNewDeployment",
				path: `/game-versions/create-deployment`,
				retryKey: options?.retryKey ?? "DeploymentService:GameVersions:getNewDeployment",
				body: args,
			});
		}
		async completeDeployment(
			args: CompleteDeploymentArgs["data"],
			options?: RequestOptions,
		): Promise<GameVersionDto> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:GameVersions:completeDeployment",
				path: `/game-versions/complete-deployment`,
				retryKey: options?.retryKey ?? "DeploymentService:GameVersions:completeDeployment",
				body: args,
			});
		}
		async activateVersion(args: ActivateVersionArgs["data"], options?: RequestOptions): Promise<GameVersionDto> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:GameVersions:activateVersion",
				path: `/game-versions/activate`,
				retryKey: options?.retryKey ?? "DeploymentService:GameVersions:activateVersion",
				body: args,
			});
		}
	}
}
// ====+==== Keys TYPES ====+====
export namespace DeploymentServiceKeys {
	export type GetKeysArgs = {
		params: {
			id: string;
		};
	};
	export interface KeyPermissionDto {
		resourceId: string;
		resourceType: DeploymentServicePrisma.ResourceType;
	}
	export interface CreateKeyDto {
		name: string;
		organizationId: string;
		permissions: KeyPermissionDto[];
	}
	export type CreateKeyArgs = {
		data: CreateKeyDto;
	};
	export interface UpdateKeyDto {
		permissions: KeyPermissionDto[];
	}
	export type UpdateKeyArgs = {
		params: {
			orgId: string;
			keyMetaId: string;
		};
		data: UpdateKeyDto;
	};
	export type DeleteKeyArgs = {
		params: {
			orgId: string;
			keyMetaId: string;
		};
	};
	export type ApiKeyMetaWithPermissions = DeploymentServicePrisma.ApiKeyMeta & {
		permissions: DeploymentServicePrisma.ApiPermission[];
	};
	export type FilledApiKey = DeploymentServicePrisma.ApiKey & { apiKeyMeta: ApiKeyMetaWithPermissions };
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const GameVisibility = {
		PUBLIC: "PUBLIC",
		PRIVATE: "PRIVATE",
		UNLISTED: "UNLISTED",
	} as const;
	export type GameVisibility = (typeof GameVisibility)[keyof typeof GameVisibility];
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const GameLinkType = {
		DISCORD: "DISCORD",
	} as const;
	export type GameLinkType = (typeof GameLinkType)[keyof typeof GameLinkType];
	export interface GameLink {
		type: GameLinkType;
		url: string;
	}
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const DeploymentPlatform = {
		WINDOWS: "Windows",
		MAC: "Mac",
		LINUX: "Linux",
		IOS: "iOS",
		Android: "Android",
	} as const;
	export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
	export type Organization = {
		id: string;
		slug: string;
		slugProperCase: string;
		name: string;
		description: string;
		iconImageId: string;
		createdAt: string;
	};
	export interface PublicGame {
		id: string;
		slug: string | undefined;
		slugProperCase: string | undefined;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		visibility: GameVisibility;
		lastVersionUpdate: string | undefined;
		archivedAt: string | undefined;
		loadingScreenImageId: string | undefined;
		logoImageId: string | undefined;
		videoId: string | undefined;
		links: GameLink[] | undefined;
		plays: number;
		favorites: number;
		plays24h: number;
		uniquePlays24h: number;
		platforms: DeploymentPlatform[];
		liveStats?: { playerCount: number };
		organization?: Organization;
	}
	export interface WithOrg {
		organization: Organization;
	}
	export type PublicGameWithOrg = PublicGame & WithOrg;
	export type Package = {
		id: string;
		slug: string;
		slugProperCase: string;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		lastVersionUpdate: string | undefined;
		archivedAt: string | undefined;
		platforms: string[];
		plays: number;
		plays24h: number;
		uniquePlays24h: number;
	};
	export interface PackageWithOrg extends Package {
		organization: Organization;
	}

	export interface ClientSpec {
		getKeys(args: GetKeysArgs["params"], options?: RequestOptions): Promise<ApiKeyMetaWithPermissions[]>;
		createKey(args: CreateKeyArgs["data"], options?: RequestOptions): Promise<FilledApiKey>;
		updateKey(args: UpdateKeyArgs, options?: RequestOptions): Promise<ApiKeyMetaWithPermissions[]>;
		deleteKey(args: DeleteKeyArgs["params"], options?: RequestOptions): Promise<ApiKeyMetaWithPermissions[]>;
		getKeyPermissions(options?: RequestOptions): Promise<
			{
				data: PublicGameWithOrg | PackageWithOrg;
				resourceType: DeploymentServicePrisma.ResourceType;
				resourceId: string;
			}[]
		>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getKeys(args: GetKeysArgs["params"], options?: RequestOptions): Promise<ApiKeyMetaWithPermissions[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:Keys:getKeys",
				path: `/keys/organization-id/${encodeURIComponent(args.id)}`,
				retryKey: options?.retryKey ?? "DeploymentService:Keys:getKeys",
			});
		}
		async createKey(args: CreateKeyArgs["data"], options?: RequestOptions): Promise<FilledApiKey> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:Keys:createKey",
				path: `/keys/create`,
				retryKey: options?.retryKey ?? "DeploymentService:Keys:createKey",
				body: args,
			});
		}
		async updateKey(args: UpdateKeyArgs, options?: RequestOptions): Promise<ApiKeyMetaWithPermissions[]> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "DeploymentService:Keys:updateKey",
				path: `/keys/organization-id/${encodeURIComponent(args.params.orgId)}/key-meta-id/${encodeURIComponent(
					args.params.keyMetaId,
				)}`,
				retryKey: options?.retryKey ?? "DeploymentService:Keys:updateKey",
				body: args.data,
			});
		}
		async deleteKey(args: DeleteKeyArgs["params"], options?: RequestOptions): Promise<ApiKeyMetaWithPermissions[]> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "DeploymentService:Keys:deleteKey",
				path: `/keys/organization-id/${encodeURIComponent(args.orgId)}/key-meta-id/${encodeURIComponent(
					args.keyMetaId,
				)}`,
				retryKey: options?.retryKey ?? "DeploymentService:Keys:deleteKey",
			});
		}
		async getKeyPermissions(options?: RequestOptions): Promise<
			{
				data: PublicGameWithOrg | PackageWithOrg;
				resourceType: DeploymentServicePrisma.ResourceType;
				resourceId: string;
			}[]
		> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:Keys:getKeyPermissions",
				path: `/keys/key/permissions`,
				retryKey: options?.retryKey ?? "DeploymentService:Keys:getKeyPermissions",
			});
		}
	}
}
// ====+==== PackageVersions TYPES ====+====
export namespace DeploymentServicePackageVersions {
	export type GetCurrentVersionArgs = {
		params: {
			orgSlug: string;
			packageSlug: string;
		};
	};
	export interface GetPackageVersionHistory {
		limit?: number;
		cursor?: string;
	}
	export type GetVersionHistoryArgs = {
		params: {
			orgSlug: string;
			packageSlug: string;
		};
		query?: GetPackageVersionHistory;
	};
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const DeploymentPlatform = {
		WINDOWS: "Windows",
		MAC: "Mac",
		LINUX: "Linux",
		IOS: "iOS",
		ANDROID: "Android",
	} as const;
	export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
	export interface UploadPackageDto {
		packageSlug: string;
		deployAssets: boolean;
		deployCode: boolean;
		platforms?: DeploymentPlatform[];
	}
	export type GetNewDeploymentArgs = {
		data: UploadPackageDto;
	};
	export interface CompleteDeploymentDto {
		packageSlug: string;
		packageVersionId: string;
		uploadedFileIds: string[];
	}
	export type CompleteDeploymentArgs = {
		data: CompleteDeploymentDto;
	};
	export interface ActivatePackageVersionDto {
		packageSlug: string;
		packageVersionId: string;
	}
	export type ActivateVersionArgs = {
		data: ActivatePackageVersionDto;
	};
	export type PackageAssetFileMetadataDto = Partial<
		Record<DeploymentPlatform, { files: { [name: string]: { size: number } }; size: number }>
	>;
	export type PackageVersionDto = DeploymentServicePrisma.PackageVersion & {
		assetFileMetadata: PackageAssetFileMetadataDto;
	};

	export interface ClientSpec {
		getCurrentVersion(
			args: GetCurrentVersionArgs["params"],
			options?: RequestOptions,
		): Promise<{
			version: { package: PackageVersionDto; platform: DeploymentServicePrisma.PlayerVersion } | undefined;
		}>;
		getVersionHistory(
			args: GetVersionHistoryArgs,
			options?: RequestOptions,
		): Promise<{ versions: PackageVersionDto[]; cursor?: string }>;
		getNewDeployment(
			args: GetNewDeploymentArgs["data"],
			options?: RequestOptions,
		): Promise<{
			urls: { [location: string]: string };
			headers: { [header: string]: string };
			version: PackageVersionDto;
		}>;
		completeDeployment(args: CompleteDeploymentArgs["data"], options?: RequestOptions): Promise<PackageVersionDto>;
		activateVersion(args: ActivateVersionArgs["data"], options?: RequestOptions): Promise<PackageVersionDto>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getCurrentVersion(
			args: GetCurrentVersionArgs["params"],
			options?: RequestOptions,
		): Promise<{
			version: { package: PackageVersionDto; platform: DeploymentServicePrisma.PlayerVersion } | undefined;
		}> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:PackageVersions:getCurrentVersion",
				path: `/package-versions/packageSlug/${encodeURIComponent(args.orgSlug)}/${encodeURIComponent(
					args.packageSlug,
				)}`,
				retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:getCurrentVersion",
			});
		}
		async getVersionHistory(
			args: GetVersionHistoryArgs,
			options?: RequestOptions,
		): Promise<{ versions: PackageVersionDto[]; cursor?: string }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "DeploymentService:PackageVersions:getVersionHistory",
				path: `/package-versions/packageSlug/${encodeURIComponent(args.params.orgSlug)}/${encodeURIComponent(
					args.params.packageSlug,
				)}/history`,
				retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:getVersionHistory",
				query: args.query,
			});
		}
		async getNewDeployment(
			args: GetNewDeploymentArgs["data"],
			options?: RequestOptions,
		): Promise<{
			urls: { [location: string]: string };
			headers: { [header: string]: string };
			version: PackageVersionDto;
		}> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:PackageVersions:getNewDeployment",
				path: `/package-versions/create-deployment`,
				retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:getNewDeployment",
				body: args,
			});
		}
		async completeDeployment(
			args: CompleteDeploymentArgs["data"],
			options?: RequestOptions,
		): Promise<PackageVersionDto> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:PackageVersions:completeDeployment",
				path: `/package-versions/complete-deployment`,
				retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:completeDeployment",
				body: args,
			});
		}
		async activateVersion(args: ActivateVersionArgs["data"], options?: RequestOptions): Promise<PackageVersionDto> {
			return await this.makeRequest({
				method: "POST",
				routeId: "DeploymentService:PackageVersions:activateVersion",
				path: `/package-versions/activate`,
				retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:activateVersion",
				body: args,
			});
		}
	}
}
// ====+==== PlayerVersions TYPES ====+====
export namespace DeploymentServicePlayerVersions {}

export interface DeploymentServiceClientSpec {
	airAssets: DeploymentServiceAirAssets.ClientSpec;
	fleet: DeploymentServiceFleet.ClientSpec;
	gameServers: DeploymentServiceGameServers.ClientSpec;
	gameSettings: DeploymentServiceGameSettings.ClientSpec;
	gameVersions: DeploymentServiceGameVersions.ClientSpec;
	keys: DeploymentServiceKeys.ClientSpec;
	packageVersions: DeploymentServicePackageVersions.ClientSpec;
}

export class DeploymentServiceClient implements DeploymentServiceClientSpec {
	public readonly airAssets: DeploymentServiceAirAssets.ClientSpec;
	public readonly fleet: DeploymentServiceFleet.ClientSpec;
	public readonly gameServers: DeploymentServiceGameServers.ClientSpec;
	public readonly gameSettings: DeploymentServiceGameSettings.ClientSpec;
	public readonly gameVersions: DeploymentServiceGameVersions.ClientSpec;
	public readonly keys: DeploymentServiceKeys.ClientSpec;
	public readonly packageVersions: DeploymentServicePackageVersions.ClientSpec;

	constructor(makeRequest: MakeRequest) {
		this.airAssets = new DeploymentServiceAirAssets.Client(makeRequest);
		this.fleet = new DeploymentServiceFleet.Client(makeRequest);
		this.gameServers = new DeploymentServiceGameServers.Client(makeRequest);
		this.gameSettings = new DeploymentServiceGameSettings.Client(makeRequest);
		this.gameVersions = new DeploymentServiceGameVersions.Client(makeRequest);
		this.keys = new DeploymentServiceKeys.Client(makeRequest);
		this.packageVersions = new DeploymentServicePackageVersions.Client(makeRequest);
	}
}
