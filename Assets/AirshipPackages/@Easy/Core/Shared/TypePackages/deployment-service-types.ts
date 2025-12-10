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

// ====+==== Database Types ====+====
export namespace DeploymentServiceDatabaseTypes {
    export const AgonesFleet = {
        COST_OPTIMIZED: "cost-optimized",
        STANDARD: "standard",
        HIGH_PERFORMANCE: "high-performance",
    } as const;
    export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];

    export type AirAsset = {
        ownerType: DeploymentServiceDatabaseTypes.AirAssetOwnerType;
        ownerId: string;
        airAssetId: string;
        name: string | undefined;
        description: string | undefined;
        createdAt: string;
        updatedAt: string;
        platforms: DeploymentServiceDatabaseTypes.AirAssetPlatformJson;
    };

    export const AirAssetOwnerType = {
        ORGANIZATION: "ORGANIZATION",
    } as const;
    export type AirAssetOwnerType = (typeof AirAssetOwnerType)[keyof typeof AirAssetOwnerType];

    export type AirAssetPlatformJson = Partial<
        Record<"Windows" | "Mac" | "Linux" | "iOS" | "Android" | "Shared", { size: number }>
    >;

    export type ApiKey = {
        key: string;
        apiKeyMetaId: string;
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
        resourceType: DeploymentServiceDatabaseTypes.ResourceType;
        resourceId: string;
        apiKeyMetaId: string;
    };

    export const DeploymentType = {
        CODE_ONLY: "CODE_ONLY",
        FULL_PUBLISH: "FULL_PUBLISH",
    } as const;
    export type DeploymentType = (typeof DeploymentType)[keyof typeof DeploymentType];

    export type GameSettings = {
        gameId: string;
        defaultMaxPlayers: number;
        defaultFleet: DeploymentServiceDatabaseTypes.AgonesFleet;
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
        deploymentType: DeploymentServiceDatabaseTypes.DeploymentType | undefined;
        publishNumber: number | undefined;
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
        deploymentType: DeploymentServiceDatabaseTypes.DeploymentType | undefined;
    };

    export type PlayerVersion = {
        playerVersionId: string;
        playerVersion: string;
        active: boolean;
        creationTime: string;
    };

    export const ResourceType = {
        GAME: "GAME",
        PACKAGE: "PACKAGE",
    } as const;
    export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
}

// ====+==== Internal Types ====+====
export namespace InternalDeploymentServiceTypes {
    export const DeploymentPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        ANDROID: "Android",
    } as const;
    export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
}

// ====+==== External Types ====+====
export namespace ExternalDeploymentServiceTypes {
    export const DeploymentPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        Android: "Android",
    } as const;
    export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];

    export interface GameLink {
        type: ExternalDeploymentServiceTypes.GameLinkType;
        url: string;
    }

    export const GameLinkType = {
        DISCORD: "DISCORD",
    } as const;
    export type GameLinkType = (typeof GameLinkType)[keyof typeof GameLinkType];

    export const GameVisibility = {
        PUBLIC: "PUBLIC",
        PRIVATE: "PRIVATE",
        UNLISTED: "UNLISTED",
    } as const;
    export type GameVisibility = (typeof GameVisibility)[keyof typeof GameVisibility];

    export type Organization = {
        id: string;
        slug: string;
        slugProperCase: string;
        name: string;
        description: string;
        iconImageId: string;
        createdAt: string;
    };

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

    export interface PackageWithOrg extends ExternalDeploymentServiceTypes.Package {
        organization: ExternalDeploymentServiceTypes.Organization;
    }

    export interface PublicGame {
        id: string;
        slug: string | undefined;
        slugProperCase: string | undefined;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ExternalDeploymentServiceTypes.GameVisibility;
        lastVersionUpdate: string | undefined;
        archivedAt: string | undefined;
        loadingScreenImageId: string | undefined;
        logoImageId: string | undefined;
        videoId: string | undefined;
        links: ExternalDeploymentServiceTypes.GameLink[] | undefined;
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        platforms: ExternalDeploymentServiceTypes.DeploymentPlatform[];
        liveStats?: { playerCount: number };
        organization?: ExternalDeploymentServiceTypes.Organization;
    }

    export type PublicGameWithOrg = ExternalDeploymentServiceTypes.PublicGame & ExternalDeploymentServiceTypes.WithOrg;

    export interface WithOrg {
        organization: ExternalDeploymentServiceTypes.Organization;
    }
}

// ====+==== AirAssets Types ====+====
export namespace DeploymentServiceAirAssets {
    export const AirAssetPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        ANDROID: "Android",
        SHARED: "Shared",
    } as const;
    export type AirAssetPlatform = (typeof AirAssetPlatform)[keyof typeof AirAssetPlatform];

    export type AirAssetWithUrl = {
        airAssetId: string;
        urls: Record<InternalDeploymentServiceTypes.DeploymentPlatform, string>;
        headers: Array<{ key: string; value: string }>;
    };

    export type CreateAirAssetArgs = {
        params: {
            ownerId: string;
            ownerType: string;
        };
        data: DeploymentServiceAirAssets.CreateAirAssetDto;
    };

    export interface CreateAirAssetDto {
        name?: string;
        description?: string;
        platforms?: DeploymentServiceAirAssets.AirAssetPlatform[];
    }

    export type DeleteAirAssetArgs = {
        params: {
            assetId: string;
        };
    };

    export type GetAirAssetsForOwnerWithKeyArgs = {
        params: {
            ownerId: string;
            ownerType: string;
        };
    };

    export interface PutAirAssetDto {
        name?: string;
        description?: string;
        platforms?: DeploymentServiceAirAssets.AirAssetPlatform[];
    }

    export type UpdateAirAssetArgs = {
        params: {
            assetId: string;
        };
        data: DeploymentServiceAirAssets.PutAirAssetDto;
    };

    export interface ClientSpec {
        createAirAsset(
            args: CreateAirAssetArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceAirAssets.AirAssetWithUrl>;
        deleteAirAsset(args: DeleteAirAssetArgs["params"], options?: RequestOptions): Promise<void>;
        getAirAssetsForOwnerWithKey(
            args: GetAirAssetsForOwnerWithKeyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ assets: DeploymentServiceDatabaseTypes.AirAsset[] }>;
        updateAirAsset(
            args: UpdateAirAssetArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceAirAssets.AirAssetWithUrl>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createAirAsset(
            args: CreateAirAssetArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceAirAssets.AirAssetWithUrl> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:AirAssets:createAirAsset",
                path: `/air-assets/owner-type/${encodeURIComponent(args.params.ownerType)}/owner-id/${encodeURIComponent(args.params.ownerId)}`,
                retryKey: options?.retryKey ?? "DeploymentService:AirAssets:createAirAsset",
                body: args.data,
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
        async getAirAssetsForOwnerWithKey(
            args: GetAirAssetsForOwnerWithKeyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ assets: DeploymentServiceDatabaseTypes.AirAsset[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DeploymentService:AirAssets:getAirAssetsForOwnerWithKey",
                path: `/air-assets/owner-type/${encodeURIComponent(args.ownerType)}/owner-id/${encodeURIComponent(args.ownerId)}`,
                retryKey: options?.retryKey ?? "DeploymentService:AirAssets:getAirAssetsForOwnerWithKey",
            });
        }
        async updateAirAsset(
            args: UpdateAirAssetArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceAirAssets.AirAssetWithUrl> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "DeploymentService:AirAssets:updateAirAsset",
                path: `/air-assets/${encodeURIComponent(args.params.assetId)}`,
                retryKey: options?.retryKey ?? "DeploymentService:AirAssets:updateAirAsset",
                body: args.data,
            });
        }
    }
}

// ====+==== GameServers Types ====+====
export namespace DeploymentServiceGameServers {
    export type ShutdownGameArgs = {
        data: DeploymentServiceGameServers.ShutdownGameDto;
    };

    export interface ShutdownGameDto {
        gameId: string;
        sceneIds?: string[];
    }

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

// ====+==== GameSettings Types ====+====
export namespace DeploymentServiceGameSettings {
    export type GetSettingsArgs = {
        params: {
            gameId: string;
        };
    };

    export interface UpdateGameSettingsDto {
        defaultMaxPlayers?: number;
        defaultFleet?: DeploymentServiceDatabaseTypes.AgonesFleet;
    }

    export type UpdateSettingsArgs = {
        params: {
            gameId: string;
        };
        data: DeploymentServiceGameSettings.UpdateGameSettingsDto;
    };

    export interface ClientSpec {
        getSettings(
            args: GetSettingsArgs["params"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceDatabaseTypes.GameSettings>;
        updateSettings(
            args: UpdateSettingsArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceDatabaseTypes.GameSettings>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getSettings(
            args: GetSettingsArgs["params"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceDatabaseTypes.GameSettings> {
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
        ): Promise<DeploymentServiceDatabaseTypes.GameSettings> {
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

// ====+==== GameVersions Types ====+====
export namespace DeploymentServiceGameVersions {
    export interface ActivateGameVersionDto {
        gameId: string;
        gameVersionId: string;
    }

    export type ActivateVersionArgs = {
        data: DeploymentServiceGameVersions.ActivateGameVersionDto;
    };

    export type AssetFileMetadataDto = Partial<
        Record<
            InternalDeploymentServiceTypes.DeploymentPlatform,
            { files: { [name: string]: { size: number } }; size: number }
        >
    >;

    export type CompleteDeploymentArgs = {
        data: DeploymentServiceGameVersions.CompleteDeploymentDto;
    };

    export interface CompleteDeploymentDto {
        gameId: string;
        gameVersionId: string;
        uploadedFileIds: string[];
    }

    export type GameVersionDto = DeploymentServiceDatabaseTypes.GameVersion & {
        assetFileMetadata: DeploymentServiceGameVersions.AssetFileMetadataDto;
    };

    export type GetCurrentVersionArgs = {
        params: {
            gameId: string;
        };
    };

    export interface GetGameVersionHistory {
        limit?: number;
        cursor?: string;
    }

    export type GetNewDeploymentArgs = {
        data: DeploymentServiceGameVersions.UploadGameDto;
    };

    export type GetVersionHistoryArgs = {
        params: {
            gameId: string;
        };
        query?: DeploymentServiceGameVersions.GetGameVersionHistory;
    };

    export interface UploadGameDto {
        gameId: string;
        minPlayerVersion: string;
        defaultScene: string;
        deployAssets: boolean;
        deployCode: boolean;
        packageSlugs?: string[];
        platforms?: InternalDeploymentServiceTypes.DeploymentPlatform[];
    }

    export interface ClientSpec {
        activateVersion(
            args: ActivateVersionArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceGameVersions.GameVersionDto>;
        completeDeployment(
            args: CompleteDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceGameVersions.GameVersionDto>;
        getCurrentVersion(
            args: GetCurrentVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            version:
                | {
                      game: DeploymentServiceGameVersions.GameVersionDto;
                      platform: DeploymentServiceDatabaseTypes.PlayerVersion;
                      settings: DeploymentServiceDatabaseTypes.GameSettings;
                  }
                | undefined;
        }>;
        getNewDeployment(
            args: GetNewDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<{
            urls: { [location: string]: string };
            headers: { [header: string]: string };
            version: DeploymentServiceGameVersions.GameVersionDto;
        }>;
        getVersionHistory(
            args: GetVersionHistoryArgs,
            options?: RequestOptions,
        ): Promise<{ versions: DeploymentServiceGameVersions.GameVersionDto[]; cursor?: string }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async activateVersion(
            args: ActivateVersionArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceGameVersions.GameVersionDto> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:GameVersions:activateVersion",
                path: `/game-versions/activate`,
                retryKey: options?.retryKey ?? "DeploymentService:GameVersions:activateVersion",
                body: args,
            });
        }
        async completeDeployment(
            args: CompleteDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceGameVersions.GameVersionDto> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:GameVersions:completeDeployment",
                path: `/game-versions/complete-deployment`,
                retryKey: options?.retryKey ?? "DeploymentService:GameVersions:completeDeployment",
                body: args,
            });
        }
        async getCurrentVersion(
            args: GetCurrentVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            version:
                | {
                      game: DeploymentServiceGameVersions.GameVersionDto;
                      platform: DeploymentServiceDatabaseTypes.PlayerVersion;
                      settings: DeploymentServiceDatabaseTypes.GameSettings;
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
        async getNewDeployment(
            args: GetNewDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<{
            urls: { [location: string]: string };
            headers: { [header: string]: string };
            version: DeploymentServiceGameVersions.GameVersionDto;
        }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:GameVersions:getNewDeployment",
                path: `/game-versions/create-deployment`,
                retryKey: options?.retryKey ?? "DeploymentService:GameVersions:getNewDeployment",
                body: args,
            });
        }
        async getVersionHistory(
            args: GetVersionHistoryArgs,
            options?: RequestOptions,
        ): Promise<{ versions: DeploymentServiceGameVersions.GameVersionDto[]; cursor?: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DeploymentService:GameVersions:getVersionHistory",
                path: `/game-versions/gameId/${encodeURIComponent(args.params.gameId)}/history`,
                retryKey: options?.retryKey ?? "DeploymentService:GameVersions:getVersionHistory",
                query: args.query,
            });
        }
    }
}

// ====+==== Keys Types ====+====
export namespace DeploymentServiceKeys {
    export type ApiKeyMetaWithPermissions = DeploymentServiceDatabaseTypes.ApiKeyMeta & {
        permissions: DeploymentServiceDatabaseTypes.ApiPermission[];
    };

    export type CreateKeyArgs = {
        data: DeploymentServiceKeys.CreateKeyDto;
    };

    export interface CreateKeyDto {
        name: string;
        organizationId: string;
        permissions: DeploymentServiceKeys.KeyPermissionDto[];
    }

    export type DeleteKeyArgs = {
        params: {
            orgId: string;
            keyMetaId: string;
        };
    };

    export type FilledApiKey = DeploymentServiceDatabaseTypes.ApiKey & {
        apiKeyMeta: DeploymentServiceKeys.ApiKeyMetaWithPermissions;
    };

    export type GetKeysArgs = {
        params: {
            id: string;
        };
    };

    export interface KeyPermissionDto {
        resourceId: string;
        resourceType: DeploymentServiceDatabaseTypes.ResourceType;
    }

    export type UpdateKeyArgs = {
        params: {
            orgId: string;
            keyMetaId: string;
        };
        data: DeploymentServiceKeys.UpdateKeyDto;
    };

    export interface UpdateKeyDto {
        permissions: DeploymentServiceKeys.KeyPermissionDto[];
    }

    export interface ClientSpec {
        createKey(args: CreateKeyArgs["data"], options?: RequestOptions): Promise<DeploymentServiceKeys.FilledApiKey>;
        deleteKey(
            args: DeleteKeyArgs["params"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.ApiKeyMetaWithPermissions[]>;
        getKeyPermissions(options?: RequestOptions): Promise<
            {
                data: ExternalDeploymentServiceTypes.PublicGameWithOrg | ExternalDeploymentServiceTypes.PackageWithOrg;
                resourceType: DeploymentServiceDatabaseTypes.ResourceType;
                resourceId: string;
            }[]
        >;
        getKeys(
            args: GetKeysArgs["params"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.ApiKeyMetaWithPermissions[]>;
        updateKey(
            args: UpdateKeyArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.ApiKeyMetaWithPermissions[]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createKey(
            args: CreateKeyArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.FilledApiKey> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:Keys:createKey",
                path: `/keys/create`,
                retryKey: options?.retryKey ?? "DeploymentService:Keys:createKey",
                body: args,
            });
        }
        async deleteKey(
            args: DeleteKeyArgs["params"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.ApiKeyMetaWithPermissions[]> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DeploymentService:Keys:deleteKey",
                path: `/keys/organization-id/${encodeURIComponent(args.orgId)}/key-meta-id/${encodeURIComponent(args.keyMetaId)}`,
                retryKey: options?.retryKey ?? "DeploymentService:Keys:deleteKey",
            });
        }
        async getKeyPermissions(options?: RequestOptions): Promise<
            {
                data: ExternalDeploymentServiceTypes.PublicGameWithOrg | ExternalDeploymentServiceTypes.PackageWithOrg;
                resourceType: DeploymentServiceDatabaseTypes.ResourceType;
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
        async getKeys(
            args: GetKeysArgs["params"],
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.ApiKeyMetaWithPermissions[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DeploymentService:Keys:getKeys",
                path: `/keys/organization-id/${encodeURIComponent(args.id)}`,
                retryKey: options?.retryKey ?? "DeploymentService:Keys:getKeys",
            });
        }
        async updateKey(
            args: UpdateKeyArgs,
            options?: RequestOptions,
        ): Promise<DeploymentServiceKeys.ApiKeyMetaWithPermissions[]> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "DeploymentService:Keys:updateKey",
                path: `/keys/organization-id/${encodeURIComponent(args.params.orgId)}/key-meta-id/${encodeURIComponent(args.params.keyMetaId)}`,
                retryKey: options?.retryKey ?? "DeploymentService:Keys:updateKey",
                body: args.data,
            });
        }
    }
}

// ====+==== PackageVersions Types ====+====
export namespace DeploymentServicePackageVersions {
    export interface ActivatePackageVersionDto {
        packageSlug: string;
        packageVersionId: string;
    }

    export type ActivateVersionArgs = {
        data: DeploymentServicePackageVersions.ActivatePackageVersionDto;
    };

    export type CompleteDeploymentArgs = {
        data: DeploymentServicePackageVersions.CompleteDeploymentDto;
    };

    export interface CompleteDeploymentDto {
        packageSlug: string;
        packageVersionId: string;
        uploadedFileIds: string[];
    }

    export type GetCurrentVersionArgs = {
        params: {
            orgSlug: string;
            packageSlug: string;
        };
    };

    export type GetNewDeploymentArgs = {
        data: DeploymentServicePackageVersions.UploadPackageDto;
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
        query?: DeploymentServicePackageVersions.GetPackageVersionHistory;
    };

    export type PackageAssetFileMetadataDto = Partial<
        Record<
            InternalDeploymentServiceTypes.DeploymentPlatform,
            { files: { [name: string]: { size: number } }; size: number }
        >
    >;

    export type PackageVersionDto = DeploymentServiceDatabaseTypes.PackageVersion & {
        assetFileMetadata: DeploymentServicePackageVersions.PackageAssetFileMetadataDto;
    };

    export interface UploadPackageDto {
        packageSlug: string;
        deployAssets: boolean;
        deployCode: boolean;
        platforms?: InternalDeploymentServiceTypes.DeploymentPlatform[];
    }

    export interface ClientSpec {
        activateVersion(
            args: ActivateVersionArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServicePackageVersions.PackageVersionDto>;
        completeDeployment(
            args: CompleteDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServicePackageVersions.PackageVersionDto>;
        getCurrentVersion(
            args: GetCurrentVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            version:
                | {
                      package: DeploymentServicePackageVersions.PackageVersionDto;
                      platform: DeploymentServiceDatabaseTypes.PlayerVersion;
                  }
                | undefined;
        }>;
        getNewDeployment(
            args: GetNewDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<{
            urls: { [location: string]: string };
            headers: { [header: string]: string };
            version: DeploymentServicePackageVersions.PackageVersionDto;
        }>;
        getVersionHistory(
            args: GetVersionHistoryArgs,
            options?: RequestOptions,
        ): Promise<{ versions: DeploymentServicePackageVersions.PackageVersionDto[]; cursor?: string }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async activateVersion(
            args: ActivateVersionArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServicePackageVersions.PackageVersionDto> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:PackageVersions:activateVersion",
                path: `/package-versions/activate`,
                retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:activateVersion",
                body: args,
            });
        }
        async completeDeployment(
            args: CompleteDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<DeploymentServicePackageVersions.PackageVersionDto> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:PackageVersions:completeDeployment",
                path: `/package-versions/complete-deployment`,
                retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:completeDeployment",
                body: args,
            });
        }
        async getCurrentVersion(
            args: GetCurrentVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            version:
                | {
                      package: DeploymentServicePackageVersions.PackageVersionDto;
                      platform: DeploymentServiceDatabaseTypes.PlayerVersion;
                  }
                | undefined;
        }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DeploymentService:PackageVersions:getCurrentVersion",
                path: `/package-versions/packageSlug/${encodeURIComponent(args.orgSlug)}/${encodeURIComponent(args.packageSlug)}`,
                retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:getCurrentVersion",
            });
        }
        async getNewDeployment(
            args: GetNewDeploymentArgs["data"],
            options?: RequestOptions,
        ): Promise<{
            urls: { [location: string]: string };
            headers: { [header: string]: string };
            version: DeploymentServicePackageVersions.PackageVersionDto;
        }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DeploymentService:PackageVersions:getNewDeployment",
                path: `/package-versions/create-deployment`,
                retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:getNewDeployment",
                body: args,
            });
        }
        async getVersionHistory(
            args: GetVersionHistoryArgs,
            options?: RequestOptions,
        ): Promise<{ versions: DeploymentServicePackageVersions.PackageVersionDto[]; cursor?: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DeploymentService:PackageVersions:getVersionHistory",
                path: `/package-versions/packageSlug/${encodeURIComponent(args.params.orgSlug)}/${encodeURIComponent(args.params.packageSlug)}/history`,
                retryKey: options?.retryKey ?? "DeploymentService:PackageVersions:getVersionHistory",
                query: args.query,
            });
        }
    }
}

export interface DeploymentServiceClientSpec {
    airAssets: DeploymentServiceAirAssets.ClientSpec;
    gameServers: DeploymentServiceGameServers.ClientSpec;
    gameSettings: DeploymentServiceGameSettings.ClientSpec;
    gameVersions: DeploymentServiceGameVersions.ClientSpec;
    keys: DeploymentServiceKeys.ClientSpec;
    packageVersions: DeploymentServicePackageVersions.ClientSpec;
}

export class DeploymentServiceClient implements DeploymentServiceClientSpec {
    public readonly airAssets: DeploymentServiceAirAssets.ClientSpec;
    public readonly gameServers: DeploymentServiceGameServers.ClientSpec;
    public readonly gameSettings: DeploymentServiceGameSettings.ClientSpec;
    public readonly gameVersions: DeploymentServiceGameVersions.ClientSpec;
    public readonly keys: DeploymentServiceKeys.ClientSpec;
    public readonly packageVersions: DeploymentServicePackageVersions.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.airAssets = new DeploymentServiceAirAssets.Client(makeRequest);
        this.gameServers = new DeploymentServiceGameServers.Client(makeRequest);
        this.gameSettings = new DeploymentServiceGameSettings.Client(makeRequest);
        this.gameVersions = new DeploymentServiceGameVersions.Client(makeRequest);
        this.keys = new DeploymentServiceKeys.Client(makeRequest);
        this.packageVersions = new DeploymentServicePackageVersions.Client(makeRequest);
    }
}
