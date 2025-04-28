import { encodeURIComponent } from "./UnityMakeRequest";

export interface HttpRequestParams<Query extends Record<string, string | number | boolean | readonly string[]> = any> {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "TRACE" | "HEAD";
    path: string;

    query?: Query;
    body?: unknown;

    authentication?: string | (() => string) | (() => Promise<string>);
    headers?: Record<string, string>;
    retryKey?: string;
}

export interface RequestOptions {
    authentication?: string | (() => string) | (() => Promise<string>);
    headers?: Record<string, string>;
    retryKey?: string;
}

export type MakeRequest = <T>(request: HttpRequestParams) => Promise<T>;

// ====+==== PRISMA TYPES ====+====
export namespace ContentServicePrisma {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const GameVisibility = {
        PUBLIC: "PUBLIC",
        PRIVATE: "PRIVATE",
        UNLISTED: "UNLISTED",
    } as const;
    export type GameVisibility = (typeof GameVisibility)[keyof typeof GameVisibility];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ImageOwnerType = {
        GAME: "GAME",
        ORGANIZATION: "ORGANIZATION",
        USER: "USER",
        PACKAGE: "PACKAGE",
    } as const;
    export type ImageOwnerType = (typeof ImageOwnerType)[keyof typeof ImageOwnerType];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const CurrencyPayoutRequestState = {
        PROCESSING: "PROCESSING",
        PAID: "PAID",
        REJECTED: "REJECTED",
    } as const;
    export type CurrencyPayoutRequestState =
        (typeof CurrencyPayoutRequestState)[keyof typeof CurrencyPayoutRequestState];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ResourceType = {
        GAME: "GAME",
        ORGANIZATION: "ORGANIZATION",
    } as const;
    export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];
    export type Artifact = {
        id: string;
        gameId: string;
        type: string;
        name: string;
        note: string | null;
        createdAt: string;
        size: number;
        uploadedAt: string | null;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const CurrencyType = {
        CREDITS: "CREDITS",
        EARNED_CREDITS: "EARNED_CREDITS",
    } as const;
    export type CurrencyType = (typeof CurrencyType)[keyof typeof CurrencyType];
    export type CurrencyEarningsSummary = {
        id: string;
        year: number;
        week: number;
        organizationId: string;
        resourceId: string;
        resourceType: ContentServicePrisma.ResourceType;
        currencyType: ContentServicePrisma.CurrencyType;
        revenue: number;
        platformFeePercent: number;
        usageFeeAmount: number;
        processed: boolean;
        processedAt: string | null;
        createdAt: string;
        platformFeeAmount: number | null;
        finalBalance: number | null;
        usageData: unknown | null;
    };
    export type Organization = {
        id: string;
        slug: string;
        slugProperCase: string;
        name: string;
        description: string;
        iconImageId: string;
        createdAt: string;
    };
    export type Member = {
        uid: string;
        organizationId: string;
        roleName: string;
        createdAt: string;
    };
    export type Game = {
        id: string;
        slug: string | null;
        slugProperCase: string | null;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ContentServicePrisma.GameVisibility;
        lastVersionUpdate: string | null;
        archivedAt: string | null;
        loadingScreenImageId: string | null;
        logoImageId: string | null;
        links: unknown | null;
        videoId: string | null;
        platforms: string[];
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        adminForceVisibility: ContentServicePrisma.GameVisibility | null;
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
        lastVersionUpdate: string | null;
        archivedAt: string | null;
        platforms: string[];
        plays: number;
        plays24h: number;
        uniquePlays24h: number;
    };
    export type CurrencyPayoutRequest = {
        id: string;
        currencyType: ContentServicePrisma.CurrencyType;
        amount: number;
        state: ContentServicePrisma.CurrencyPayoutRequestState;
        processedBy: string | null;
        processedAt: string | null;
        createdAt: string;
        organizationId: string;
    };
    export type OrganizationRole = {
        roleName: string;
        createdAt: string;
        organizationId: string;
        permissionsData: unknown;
    };
    export type Webhook = {
        id: string;
        url: string;
        resourceId: string;
        createdAt: string;
    };
    export type Gear = {
        classId: string;
        createdAt: string;
        airAssets: string[];
        category: string;
        subcategory: string | null;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const TransactionType = {
        GRANT_ITEM: "GRANT_ITEM",
        DELETE_ITEM: "DELETE_ITEM",
        GAME_BROKERED_TRADE: "GAME_BROKERED_TRADE",
        GRANT_DEFAULT_ITEMS: "GRANT_DEFAULT_ITEMS",
        CURRENCY_PRODUCT_TRANSACTION: "CURRENCY_PRODUCT_TRANSACTION",
        CURRENCY_PRODUCT_REFUND: "CURRENCY_PRODUCT_REFUND",
    } as const;
    export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
    export interface TransactionDetails {
        itemsGained?: { uid: string; classId: string; resourceType: string; resourceId: string; instanceId: string }[];
        itemsLost?: { uid: string; classId: string; resourceType: string; resourceId: string; instanceId: string }[];
    }
    export type Transaction = {
        type: ContentServicePrisma.TransactionType;
        createdAt: string;
        transactionId: string;
        details: ContentServicePrisma.TransactionDetails | null;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ProductFullfillmentMethod = {
        RECEIPT: "RECEIPT",
        IMMEDIATE: "IMMEDIATE",
    } as const;
    export type ProductFullfillmentMethod = (typeof ProductFullfillmentMethod)[keyof typeof ProductFullfillmentMethod];
    export type CurrencyProduct = {
        id: string;
        resourceId: string;
        resourceType: ContentServicePrisma.ResourceType;
        name: string;
        price: number;
        active: boolean;
        unique: boolean;
        giftable: boolean;
        deleted: boolean;
        createdAt: string;
        fullfillmentMethod: ContentServicePrisma.ProductFullfillmentMethod;
    };
    export type CurrencyProductItem = {
        currencyProductId: string;
        itemClassId: string;
        quantity: number;
        createdAt: string;
        updatedAt: string;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const CurrencyTransactionStatus = {
        PENDING: "PENDING",
        PROCESSING: "PROCESSING",
        FULFILLED: "FULFILLED",
        REFUNDED: "REFUNDED",
    } as const;
    export type CurrencyTransactionStatus = (typeof CurrencyTransactionStatus)[keyof typeof CurrencyTransactionStatus];
    export type CurrencyTransaction = {
        id: string;
        purchaserUid: string;
        receiverUid: string;
        status: ContentServicePrisma.CurrencyTransactionStatus;
        price: number;
        quantity: number;
        total: number;
        productId: string;
        productResourceId: string;
        productResourceType: ContentServicePrisma.ResourceType;
        productName: string;
        createdAt: string;
        completedAt: string | null;
        summaryId: string | null;
        itemTransactionId: string | null;
        refundItemTransactionId: string | null;
    };
}
// ====+==== Artifacts TYPES ====+====
export namespace ContentServiceArtifacts {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ArtifactType = {
        MICRO_PROFILE: "MICRO_PROFILE",
    } as const;
    export type ArtifactType = (typeof ArtifactType)[keyof typeof ArtifactType];
    export type GetArtifactsArgs = {
        params: {
            gameId: string;
            type: ArtifactType;
        };
        query?: {
            cursor?: string;
        };
    };
    export interface SignedArtifactUploadUrlDto {
        type: ArtifactType;
        name: string;
        note?: string;
        contentType: string;
        contentLength: number;
    }
    export type GetSignedUrlArgs = {
        data: SignedArtifactUploadUrlDto;
    };
    export type DownloadArtifactArgs = {
        params: {
            artifactId: string;
        };
    };
    export type ObjectUploadedPushArgs = {
        data: any;
    };

    export interface ContentServiceArtifactsClient {
        getArtifacts(
            args: GetArtifactsArgs,
            options?: RequestOptions,
        ): Promise<{ results: ContentServicePrisma.Artifact[]; cursor?: string }>;
        getSignedUrl(args: GetSignedUrlArgs["data"], options?: RequestOptions): Promise<{ id: string; url: string }>;
        downloadArtifact(args: DownloadArtifactArgs["params"], options?: RequestOptions): Promise<{ url: string }>;
        objectUploadedPush(
            args: ObjectUploadedPushArgs["data"],
            options?: RequestOptions,
        ): Promise<{ success: boolean }>;
    }

    export class ContentServiceArtifactsBaseClient implements ContentServiceArtifactsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getArtifacts(
            args: GetArtifactsArgs,
            options?: RequestOptions,
        ): Promise<{ results: ContentServicePrisma.Artifact[]; cursor?: string }> {
            return await this.makeRequest({
                method: "GET",
                path: `/artifacts/game-id/${encodeURIComponent(args.params.gameId)}/type/${encodeURIComponent(args.params.type)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async getSignedUrl(
            args: GetSignedUrlArgs["data"],
            options?: RequestOptions,
        ): Promise<{ id: string; url: string }> {
            return await this.makeRequest({
                method: "POST",
                path: `/artifacts/signed-url`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async downloadArtifact(
            args: DownloadArtifactArgs["params"],
            options?: RequestOptions,
        ): Promise<{ url: string }> {
            return await this.makeRequest({
                method: "GET",
                path: `/artifacts/artifact-id/${encodeURIComponent(args.artifactId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async objectUploadedPush(
            args: ObjectUploadedPushArgs["data"],
            options?: RequestOptions,
        ): Promise<{ success: boolean }> {
            return await this.makeRequest({
                method: "POST",
                path: `/artifacts/push`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Currency TYPES ====+====
export namespace ContentServiceCurrency {
    export type GetOrgCurrencyArgs = {
        params: {
            orgId: string;
        };
    };
    export type GetEarningsForResourceArgs = {
        params: {
            resourceId: string;
        };
    };
    export type GetOrgEarningsArgs = {
        params: {
            orgId: string;
            cursor: string;
        };
    };
    export type GetSummaryArgs = {
        params: {
            orgId: string;
            summaryId: string;
        };
    };
    export type CurrencyValues = { [Key in ContentServicePrisma.CurrencyType]: number };
    export type CurrencyEarningsSummaries = {
        [Key in ContentServicePrisma.CurrencyType]: ContentServicePrisma.CurrencyEarningsSummary;
    };

    export interface ContentServiceCurrencyClient {
        getCurrency(options?: RequestOptions): Promise<CurrencyValues>;
        getOrgCurrency(
            args: GetOrgCurrencyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ owned: CurrencyValues; pending: CurrencyValues }>;
        getEarningsForResource(
            args: GetEarningsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<CurrencyEarningsSummaries>;
        getOrgEarnings(
            args: GetOrgEarningsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ cursor: string | null; results: ContentServicePrisma.CurrencyEarningsSummary[] }>;
        getSummary(
            args: GetSummaryArgs["params"],
            options?: RequestOptions,
        ): Promise<{ summary: ContentServicePrisma.CurrencyEarningsSummary | undefined }>;
    }

    export class ContentServiceCurrencyBaseClient implements ContentServiceCurrencyClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getCurrency(options?: RequestOptions): Promise<CurrencyValues> {
            return await this.makeRequest({
                method: "GET",
                path: `/currency/`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getOrgCurrency(
            args: GetOrgCurrencyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ owned: CurrencyValues; pending: CurrencyValues }> {
            return await this.makeRequest({
                method: "GET",
                path: `/currency/organization-id/${encodeURIComponent(args.orgId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getEarningsForResource(
            args: GetEarningsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<CurrencyEarningsSummaries> {
            return await this.makeRequest({
                method: "GET",
                path: `/currency/resource-id/${encodeURIComponent(args.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getOrgEarnings(
            args: GetOrgEarningsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ cursor: string | null; results: ContentServicePrisma.CurrencyEarningsSummary[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/currency/organization-id/${encodeURIComponent(args.orgId)}/summaries`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getSummary(
            args: GetSummaryArgs["params"],
            options?: RequestOptions,
        ): Promise<{ summary: ContentServicePrisma.CurrencyEarningsSummary | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/currency/organization-id/${encodeURIComponent(args.orgId)}/summary/${encodeURIComponent(args.summaryId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Favorites TYPES ====+====
export namespace ContentServiceFavorites {
    export interface SetFavoriteDto {
        resourceId: string;
        isFavorite: boolean;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const FavoritesType = {
        GAME: "GAME",
    } as const;
    export type FavoritesType = (typeof FavoritesType)[keyof typeof FavoritesType];
    export type SetFavoriteArgs = {
        data: SetFavoriteDto;
        params: {
            favorites_type: FavoritesType;
        };
    };
    export type GetFavoritesArgs = {
        params: {
            favorites_type: FavoritesType;
        };
    };
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
    export interface PublicGame {
        id: string;
        slug: string | null;
        slugProperCase: string | null;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ContentServicePrisma.GameVisibility;
        lastVersionUpdate: string | null;
        archivedAt: string | null;
        loadingScreenImageId: string | null;
        logoImageId: string | null;
        videoId: string | null;
        links: GameLink[] | null;
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        platforms: DeploymentPlatform[];
        liveStats?: { playerCount: number };
        organization?: ContentServicePrisma.Organization;
    }
    export interface WithLiveStats {
        liveStats: { playerCount: number };
    }
    export type PublicGameWithLiveStats = PublicGame & WithLiveStats;

    export interface ContentServiceFavoritesClient {
        setFavorite(args: SetFavoriteArgs, options?: RequestOptions): Promise<void>;
        getFavorites(
            args: GetFavoritesArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            type: FavoritesType;
            data: { resourceId: string; resource: PublicGameWithLiveStats; createdAt: string }[];
        }>;
    }

    export class ContentServiceFavoritesBaseClient implements ContentServiceFavoritesClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async setFavorite(args: SetFavoriteArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/favorites/${encodeURIComponent(args.params.favorites_type)}/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async getFavorites(
            args: GetFavoritesArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            type: FavoritesType;
            data: { resourceId: string; resource: PublicGameWithLiveStats; createdAt: string }[];
        }> {
            return await this.makeRequest({
                method: "GET",
                path: `/favorites/${encodeURIComponent(args.favorites_type)}/`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Games TYPES ====+====
export namespace ContentServiceGames {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const DeploymentPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        Android: "Android",
    } as const;
    export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
    export interface GameSortsDto {
        showHidden?: boolean;
        platform?: DeploymentPlatform;
    }
    export type GetGameSortsArgs = {
        query?: GameSortsDto;
    };
    export type GetAdminGameSortsArgs = {
        query?: GameSortsDto;
    };
    export type GetGameBySlugArgs = {
        params: {
            slug: string;
        };
        query?: {
            liveStats?: string;
        };
    };
    export type GetGameByIdArgs = {
        params: {
            id: string;
        };
        query?: {
            liveStats?: string;
        };
    };
    export interface AutocompleteDto {
        name: string;
        showHidden?: boolean;
        limit?: number;
        platform?: DeploymentPlatform;
    }
    export type AutocompleteGameArgs = {
        query: AutocompleteDto;
    };
    export type AdminAutocompleteGameArgs = {
        query: AutocompleteDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const GameLinkType = {
        DISCORD: "DISCORD",
    } as const;
    export type GameLinkType = (typeof GameLinkType)[keyof typeof GameLinkType];
    export interface GameLinkDto {
        type: GameLinkType;
        url: string;
    }
    export interface PatchGameDto {
        name?: string;
        slugProperCase?: string;
        description?: string;
        iconImageId?: string;
        loadingScreenImageId?: string | null;
        logoImageId?: string | null;
        videoId?: string | null;
        links?: GameLinkDto[] | null;
        visibility?: ContentServicePrisma.GameVisibility;
        archived?: boolean;
    }
    export type PatchGameArgs = {
        params: {
            id: string;
        };
        data: PatchGameDto;
    };
    export interface CreateGameDto {
        name: string;
        organizationId: string;
        visibility?: ContentServicePrisma.GameVisibility;
    }
    export type CreateGameArgs = {
        data: CreateGameDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ImageNamespace = {
        ORGANIZATION_THUMBNAILS: "organization-thumbnails",
        GAME_THUMBNAILS: "game-thumbnails",
        GAME_LOADING_IMAGES: "game-loading-images",
        GAME_LOGOS: "game-logos",
        PACKAGE_THUMBNAILS: "package-thumbnails",
        ITEM_IMAGES: "items",
        PROFILE_PICTURES: "profile-pictures",
    } as const;
    export type ImageNamespace = (typeof ImageNamespace)[keyof typeof ImageNamespace];
    export interface UploadImageQuery {
        contentType: string;
        contentLength: number;
        name?: string;
        description?: string;
    }
    export type GetSignedGameImageArgs = {
        params: {
            id: string;
            namespace: ImageNamespace;
        };
        query: UploadImageQuery;
    };
    export interface GameUpdateNotificationVersion {
        gameVersionId: string;
        assetVersionNumber: number;
        codeVersionNumber: number;
        creationTime: string;
        platforms?: DeploymentPlatform[];
    }
    export interface GameUpdateNotificationDto {
        version: GameUpdateNotificationVersion;
        deployerName: string;
    }
    export type GameUpdatedNotificationArgs = {
        params: {
            gameId: string;
        };
        data: GameUpdateNotificationDto;
    };
    export type AddGameToFeaturedListArgs = {
        params: {
            id: string;
        };
    };
    export type RemoveGameFromFeaturedListArgs = {
        params: {
            id: string;
        };
    };
    export type AdminGetGameStatusArgs = {
        params: {
            id: string;
        };
    };
    export interface AdminUpdateStatusDto {
        forceVisibility: ContentServicePrisma.GameVisibility | null;
    }
    export type AdminSetGameStatusArgs = {
        params: {
            id: string;
        };
        data: AdminUpdateStatusDto;
    };
    export interface GameLink {
        type: GameLinkType;
        url: string;
    }
    export interface PublicGame {
        id: string;
        slug: string | null;
        slugProperCase: string | null;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ContentServicePrisma.GameVisibility;
        lastVersionUpdate: string | null;
        archivedAt: string | null;
        loadingScreenImageId: string | null;
        logoImageId: string | null;
        videoId: string | null;
        links: GameLink[] | null;
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        platforms: DeploymentPlatform[];
        liveStats?: { playerCount: number };
        organization?: ContentServicePrisma.Organization;
    }
    export interface WithLiveStats {
        liveStats: { playerCount: number };
    }
    export interface WithOrg {
        organization: ContentServicePrisma.Organization;
    }
    export type PublicGameWithLiveStatsAndOrg = PublicGame & WithLiveStats & WithOrg;
    export type PublicGameWithOrg = PublicGame & WithOrg;
    export type PublicGameWithLiveStats = PublicGame & WithLiveStats;
    export interface AutocompleteSearchGame
        extends Pick<
            PublicGameWithLiveStats,
            | "id"
            | "name"
            | "iconImageId"
            | "organizationId"
            | "plays"
            | "favorites"
            | "plays24h"
            | "uniquePlays24h"
            | "platforms"
        > {
        lastVersionUpdate: string;
        organization?: Pick<ContentServicePrisma.Organization, "name" | "iconImageId">;
    }
    export interface PublicImageResource {
        imageId: string;
        name: string | null;
        description: string | null;
        size: number;
        createdAt: string;
    }
    export interface SignedImageUrl extends PublicImageResource {
        url: string;
    }

    export interface ContentServiceGamesClient {
        getGameSorts(
            args?: GetGameSortsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ popular: PublicGameWithLiveStatsAndOrg[]; featured: PublicGameWithLiveStatsAndOrg[] }>;
        getAdminGameSorts(
            args?: GetAdminGameSortsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ popular: PublicGameWithLiveStatsAndOrg[]; featured: PublicGameWithLiveStatsAndOrg[] }>;
        getGameBySlug(
            args: GetGameBySlugArgs,
            options?: RequestOptions,
        ): Promise<{ game: PublicGameWithOrg | PublicGameWithLiveStatsAndOrg | undefined }>;
        getGameById(args: GetGameByIdArgs, options?: RequestOptions): Promise<{ game: PublicGameWithOrg | undefined }>;
        autocompleteGame(
            args: AutocompleteGameArgs["query"],
            options?: RequestOptions,
        ): Promise<AutocompleteSearchGame[]>;
        adminAutocompleteGame(
            args: AdminAutocompleteGameArgs["query"],
            options?: RequestOptions,
        ): Promise<AutocompleteSearchGame[]>;
        patchGame(args: PatchGameArgs, options?: RequestOptions): Promise<{ game: PublicGameWithOrg }>;
        createGame(args: CreateGameArgs["data"], options?: RequestOptions): Promise<{ game: PublicGameWithOrg }>;
        getSignedGameImage(args: GetSignedGameImageArgs, options?: RequestOptions): Promise<SignedImageUrl>;
        gameUpdatedNotification(args: GameUpdatedNotificationArgs, options?: RequestOptions): Promise<void>;
        addGameToFeaturedList(
            args: AddGameToFeaturedListArgs["params"],
            options?: RequestOptions,
        ): Promise<{ featured: PublicGameWithOrg[] }>;
        removeGameFromFeaturedList(
            args: RemoveGameFromFeaturedListArgs["params"],
            options?: RequestOptions,
        ): Promise<{ featured: PublicGameWithOrg[] }>;
        adminGetGameStatus(
            args: AdminGetGameStatusArgs["params"],
            options?: RequestOptions,
        ): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | null }>;
        adminSetGameStatus(
            args: AdminSetGameStatusArgs,
            options?: RequestOptions,
        ): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | null }>;
    }

    export class ContentServiceGamesBaseClient implements ContentServiceGamesClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getGameSorts(
            args?: GetGameSortsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ popular: PublicGameWithLiveStatsAndOrg[]; featured: PublicGameWithLiveStatsAndOrg[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getAdminGameSorts(
            args?: GetAdminGameSortsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ popular: PublicGameWithLiveStatsAndOrg[]; featured: PublicGameWithLiveStatsAndOrg[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/admin/sorts`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getGameBySlug(
            args: GetGameBySlugArgs,
            options?: RequestOptions,
        ): Promise<{ game: PublicGameWithOrg | PublicGameWithLiveStatsAndOrg | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/slug/${encodeURIComponent(args.params.slug)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async getGameById(
            args: GetGameByIdArgs,
            options?: RequestOptions,
        ): Promise<{ game: PublicGameWithOrg | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/game-id/${encodeURIComponent(args.params.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async autocompleteGame(
            args: AutocompleteGameArgs["query"],
            options?: RequestOptions,
        ): Promise<AutocompleteSearchGame[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/autocomplete`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async adminAutocompleteGame(
            args: AdminAutocompleteGameArgs["query"],
            options?: RequestOptions,
        ): Promise<AutocompleteSearchGame[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/admin/autocomplete`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async patchGame(args: PatchGameArgs, options?: RequestOptions): Promise<{ game: PublicGameWithOrg }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/games/game-id/${encodeURIComponent(args.params.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async createGame(args: CreateGameArgs["data"], options?: RequestOptions): Promise<{ game: PublicGameWithOrg }> {
            return await this.makeRequest({
                method: "POST",
                path: `/games/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async getSignedGameImage(args: GetSignedGameImageArgs, options?: RequestOptions): Promise<SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/game-id/${encodeURIComponent(args.params.id)}/namespace/${encodeURIComponent(args.params.namespace)}/signed-url`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async gameUpdatedNotification(args: GameUpdatedNotificationArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/games/game-id/${encodeURIComponent(args.params.gameId)}/updated`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async addGameToFeaturedList(
            args: AddGameToFeaturedListArgs["params"],
            options?: RequestOptions,
        ): Promise<{ featured: PublicGameWithOrg[] }> {
            return await this.makeRequest({
                method: "PUT",
                path: `/games/game-id/${encodeURIComponent(args.id)}/featured`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async removeGameFromFeaturedList(
            args: RemoveGameFromFeaturedListArgs["params"],
            options?: RequestOptions,
        ): Promise<{ featured: PublicGameWithOrg[] }> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/games/game-id/${encodeURIComponent(args.id)}/featured`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async adminGetGameStatus(
            args: AdminGetGameStatusArgs["params"],
            options?: RequestOptions,
        ): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | null }> {
            return await this.makeRequest({
                method: "GET",
                path: `/games/admin-status/game-id/${encodeURIComponent(args.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async adminSetGameStatus(
            args: AdminSetGameStatusArgs,
            options?: RequestOptions,
        ): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | null }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/games/admin-status/game-id/${encodeURIComponent(args.params.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Images TYPES ====+====
export namespace ContentServiceImages {
    export type GetImagesForResourceArgs = {
        params: {
            resourceType: string;
            resourceId: string;
            namespace: string;
        };
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ImageNamespace = {
        ORGANIZATION_THUMBNAILS: "organization-thumbnails",
        GAME_THUMBNAILS: "game-thumbnails",
        GAME_LOADING_IMAGES: "game-loading-images",
        GAME_LOGOS: "game-logos",
        PACKAGE_THUMBNAILS: "package-thumbnails",
        ITEM_IMAGES: "items",
        PROFILE_PICTURES: "profile-pictures",
    } as const;
    export type ImageNamespace = (typeof ImageNamespace)[keyof typeof ImageNamespace];
    export interface CreateImageBody {
        ownerId?: string;
        ownerType?: ContentServicePrisma.ImageOwnerType;
        resourceId?: string;
        namespace: ImageNamespace;
        contentType: string;
        contentLength: number;
        name?: string;
        description?: string;
    }
    export type CreateImageArgs = {
        data: CreateImageBody;
    };
    export interface ValidateImageAttributesBody {
        imageId: string;
        ownerId: string;
        ownerType: ContentServicePrisma.ImageOwnerType;
        namespace?: string;
    }
    export type ValidateImageAttributesArgs = {
        data: ValidateImageAttributesBody;
    };
    export interface ScheduleDeletionBody {
        imageId: string;
        scheduleTime: string;
    }
    export type ScheduleDeleteImageArgs = {
        data: ScheduleDeletionBody;
    };
    export type ObjectUploadedPushArgs = {
        data: any;
    };
    export interface PublicImageResource {
        imageId: string;
        name: string | null;
        description: string | null;
        size: number;
        createdAt: string;
    }
    export interface SignedImageUrl extends PublicImageResource {
        url: string;
    }

    export interface ContentServiceImagesClient {
        getImagesForResource(
            args: GetImagesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<{ images: PublicImageResource[] }>;
        createImage(args: CreateImageArgs["data"], options?: RequestOptions): Promise<SignedImageUrl>;
        validateImageAttributes(
            args: ValidateImageAttributesArgs["data"],
            options?: RequestOptions,
        ): Promise<{ exists: boolean }>;
        scheduleDeleteImage(args: ScheduleDeleteImageArgs["data"], options?: RequestOptions): Promise<void>;
        objectUploadedPush(
            args: ObjectUploadedPushArgs["data"],
            options?: RequestOptions,
        ): Promise<{ success: boolean }>;
    }

    export class ContentServiceImagesBaseClient implements ContentServiceImagesClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getImagesForResource(
            args: GetImagesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<{ images: PublicImageResource[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/images/resource-type/${encodeURIComponent(args.resourceType)}/resource-id/${encodeURIComponent(args.resourceId)}/namespace/${encodeURIComponent(args.namespace)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async createImage(args: CreateImageArgs["data"], options?: RequestOptions): Promise<SignedImageUrl> {
            return await this.makeRequest({
                method: "POST",
                path: `/images/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async validateImageAttributes(
            args: ValidateImageAttributesArgs["data"],
            options?: RequestOptions,
        ): Promise<{ exists: boolean }> {
            return await this.makeRequest({
                method: "POST",
                path: `/images/validate`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async scheduleDeleteImage(args: ScheduleDeleteImageArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/images/schedule-delete`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async objectUploadedPush(
            args: ObjectUploadedPushArgs["data"],
            options?: RequestOptions,
        ): Promise<{ success: boolean }> {
            return await this.makeRequest({
                method: "POST",
                path: `/images/push`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Memberships TYPES ====+====
export namespace ContentServiceMemberships {
    export type GetUserGameOwnershipArgs = {
        query: {
            liveStats: string;
        };
    };
    export type GetUserGamesArgs = {
        params: {
            userId: string;
        };
    };
    export interface GameMembershipQueryDto {
        gameId: string;
        userId: string;
    }
    export type ValidateMembershipForGameArgs = {
        query: GameMembershipQueryDto;
    };
    export type GetMembershipForGameArgs = {
        params: {
            userId: string;
        };
    };
    export interface MemberWithOrg extends ContentServicePrisma.Member {
        organization: ContentServicePrisma.Organization;
    }
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
    export interface PublicGame {
        id: string;
        slug: string | null;
        slugProperCase: string | null;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ContentServicePrisma.GameVisibility;
        lastVersionUpdate: string | null;
        archivedAt: string | null;
        loadingScreenImageId: string | null;
        logoImageId: string | null;
        videoId: string | null;
        links: GameLink[] | null;
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        platforms: DeploymentPlatform[];
        liveStats?: { playerCount: number };
        organization?: ContentServicePrisma.Organization;
    }
    export interface WithLiveStats {
        liveStats: { playerCount: number };
    }
    export interface WithOrg {
        organization: ContentServicePrisma.Organization;
    }
    export type PublicGameWithLiveStatsAndOrg = PublicGame & WithLiveStats & WithOrg;
    export type PublicGameWithOrg = PublicGame & WithOrg;

    export interface ContentServiceMembershipsClient {
        getUserMemberships(options?: RequestOptions): Promise<MemberWithOrg[]>;
        getUserGameOwnership(
            args: GetUserGameOwnershipArgs["query"],
            options?: RequestOptions,
        ): Promise<PublicGameWithLiveStatsAndOrg[] | PublicGameWithOrg[]>;
        getUserGames(args: GetUserGamesArgs["params"], options?: RequestOptions): Promise<{ gameIds: string[] }>;
        validateMembershipForGame(
            args: ValidateMembershipForGameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ membership: ContentServicePrisma.Member | false }>;
        getMembershipForGame(
            args: GetMembershipForGameArgs["params"],
            options?: RequestOptions,
        ): Promise<{ isMember: boolean; membershipData: ContentServicePrisma.Member | false }>;
    }

    export class ContentServiceMembershipsBaseClient implements ContentServiceMembershipsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getUserMemberships(options?: RequestOptions): Promise<MemberWithOrg[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/memberships/organizations/self`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getUserGameOwnership(
            args: GetUserGameOwnershipArgs["query"],
            options?: RequestOptions,
        ): Promise<PublicGameWithLiveStatsAndOrg[] | PublicGameWithOrg[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/memberships/games/self`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getUserGames(args: GetUserGamesArgs["params"], options?: RequestOptions): Promise<{ gameIds: string[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/memberships/games/user-id/${encodeURIComponent(args.userId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async validateMembershipForGame(
            args: ValidateMembershipForGameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ membership: ContentServicePrisma.Member | false }> {
            return await this.makeRequest({
                method: "GET",
                path: `/memberships/game`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getMembershipForGame(
            args: GetMembershipForGameArgs["params"],
            options?: RequestOptions,
        ): Promise<{ isMember: boolean; membershipData: ContentServicePrisma.Member | false }> {
            return await this.makeRequest({
                method: "GET",
                path: `/memberships/game-organization/user-id/${encodeURIComponent(args.userId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Organizations TYPES ====+====
export namespace ContentServiceOrganizations {
    export type GetOrganizationBySlugArgs = {
        params: {
            slug: string;
        };
    };
    export type GetOrganizationByIdArgs = {
        params: {
            id: string;
        };
    };
    export interface PatchOrganizationDto {
        name?: string;
        description?: string;
        iconImageId?: string;
    }
    export type PatchOrganizationArgs = {
        params: {
            id: string;
        };
        data: PatchOrganizationDto;
    };
    export interface CreateOrganizationDto {
        slugProperCase: string;
        name: string;
    }
    export type CreateOrganizationArgs = {
        data: CreateOrganizationDto;
    };
    export type GetMemberArgs = {
        params: {
            id: string;
            uid: string;
        };
    };
    export interface AddMemberDto {
        memberUsername: string;
        roleName: string;
    }
    export type PutMemberArgs = {
        data: AddMemberDto;
        params: {
            id: string;
        };
    };
    export type DeleteMemberArgs = {
        params: {
            id: string;
            uid: string;
        };
    };
    export type GetSignedOrgImageArgs = {
        params: {
            id: string;
        };
        query: {
            contentType: string;
            contentLength: string;
        };
    };
    export interface AugmentedMember extends ContentServicePrisma.Member {
        username?: string;
        usernameLower?: string;
    }
    export interface OrganizationView extends ContentServicePrisma.Organization {
        games: ContentServicePrisma.Game[];
        packages: ContentServicePrisma.Package[];
        members: AugmentedMember[];
    }
    export interface PublicImageResource {
        imageId: string;
        name: string | null;
        description: string | null;
        size: number;
        createdAt: string;
    }
    export interface SignedImageUrl extends PublicImageResource {
        url: string;
    }

    export interface ContentServiceOrganizationsClient {
        getOrganizationBySlug(
            args: GetOrganizationBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{ organization: OrganizationView }>;
        getOrganizationById(
            args: GetOrganizationByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServicePrisma.Organization | undefined }>;
        patchOrganization(
            args: PatchOrganizationArgs,
            options?: RequestOptions,
        ): Promise<{ organization: ContentServicePrisma.Organization }>;
        createOrganization(
            args: CreateOrganizationArgs["data"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServicePrisma.Organization | undefined }>;
        getMember(
            args: GetMemberArgs["params"],
            options?: RequestOptions,
        ): Promise<{ member: ContentServicePrisma.Member | undefined }>;
        putMember(args: PutMemberArgs, options?: RequestOptions): Promise<AugmentedMember[]>;
        deleteMember(args: DeleteMemberArgs["params"], options?: RequestOptions): Promise<AugmentedMember[]>;
        getSignedOrgImage(args: GetSignedOrgImageArgs, options?: RequestOptions): Promise<SignedImageUrl>;
    }

    export class ContentServiceOrganizationsBaseClient implements ContentServiceOrganizationsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getOrganizationBySlug(
            args: GetOrganizationBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{ organization: OrganizationView }> {
            return await this.makeRequest({
                method: "GET",
                path: `/organizations/slug/${encodeURIComponent(args.slug)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getOrganizationById(
            args: GetOrganizationByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServicePrisma.Organization | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/organizations/organization-id/${encodeURIComponent(args.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async patchOrganization(
            args: PatchOrganizationArgs,
            options?: RequestOptions,
        ): Promise<{ organization: ContentServicePrisma.Organization }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async createOrganization(
            args: CreateOrganizationArgs["data"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServicePrisma.Organization | undefined }> {
            return await this.makeRequest({
                method: "POST",
                path: `/organizations/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async getMember(
            args: GetMemberArgs["params"],
            options?: RequestOptions,
        ): Promise<{ member: ContentServicePrisma.Member | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/organizations/organization-id/${encodeURIComponent(args.id)}/member-uid/${encodeURIComponent(args.uid)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async putMember(args: PutMemberArgs, options?: RequestOptions): Promise<AugmentedMember[]> {
            return await this.makeRequest({
                method: "PUT",
                path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}/member`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async deleteMember(args: DeleteMemberArgs["params"], options?: RequestOptions): Promise<AugmentedMember[]> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/organizations/organization-id/${encodeURIComponent(args.id)}/member-uid/${encodeURIComponent(args.uid)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getSignedOrgImage(args: GetSignedOrgImageArgs, options?: RequestOptions): Promise<SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                path: `/organizations/thumbnails/organization-id/${encodeURIComponent(args.params.id)}/signed-url`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Packages TYPES ====+====
export namespace ContentServicePackages {
    export type GetPackageBySlugArgs = {
        params: {
            orgSlug: string;
            packageSlug: string;
        };
    };
    export type GetPackageByIdArgs = {
        params: {
            id: string;
        };
    };
    export interface PatchPackageDto {
        name?: string;
        description?: string;
        iconImageId?: string;
        archived?: boolean;
    }
    export type PatchPackageArgs = {
        params: {
            id: string;
        };
        data: PatchPackageDto;
    };
    export interface CreatePackageDto {
        name: string;
        slugProperCase: string;
        organizationId: string;
    }
    export type CreatePackageArgs = {
        data: CreatePackageDto;
    };
    export type GetSignedPackageImageArgs = {
        params: {
            id: string;
        };
        query: {
            contentType: string;
            contentLength: string;
        };
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const DeploymentPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        Android: "Android",
    } as const;
    export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];
    export interface PackageUpdateNotificationVersion {
        packageVersionId: string;
        assetVersionNumber: number;
        codeVersionNumber: number;
        creationTime: string;
        platforms?: DeploymentPlatform[];
    }
    export interface PackageUpdateNotificationDto {
        version: PackageUpdateNotificationVersion;
        deployerName: string;
    }
    export type PackageUpdatedNotificationArgs = {
        params: {
            orgSlug: string;
            packageSlug: string;
        };
        data: PackageUpdateNotificationDto;
    };
    export interface PackageWithOrg extends ContentServicePrisma.Package {
        organization: ContentServicePrisma.Organization;
    }
    export interface PublicImageResource {
        imageId: string;
        name: string | null;
        description: string | null;
        size: number;
        createdAt: string;
    }
    export interface SignedImageUrl extends PublicImageResource {
        url: string;
    }

    export interface ContentServicePackagesClient {
        getPackageBySlug(
            args: GetPackageBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: PackageWithOrg }>;
        getPackageById(args: GetPackageByIdArgs["params"], options?: RequestOptions): Promise<{ pkg: PackageWithOrg }>;
        patchPackage(args: PatchPackageArgs, options?: RequestOptions): Promise<{ pkg: PackageWithOrg }>;
        createPackage(args: CreatePackageArgs["data"], options?: RequestOptions): Promise<{ pkg: PackageWithOrg }>;
        getSignedPackageImage(args: GetSignedPackageImageArgs, options?: RequestOptions): Promise<SignedImageUrl>;
        packageUpdatedNotification(args: PackageUpdatedNotificationArgs, options?: RequestOptions): Promise<void>;
    }

    export class ContentServicePackagesBaseClient implements ContentServicePackagesClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getPackageBySlug(
            args: GetPackageBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: PackageWithOrg }> {
            return await this.makeRequest({
                method: "GET",
                path: `/packages/slug/${encodeURIComponent(args.orgSlug)}/${encodeURIComponent(args.packageSlug)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getPackageById(
            args: GetPackageByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: PackageWithOrg }> {
            return await this.makeRequest({
                method: "GET",
                path: `/packages/package-id/${encodeURIComponent(args.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async patchPackage(args: PatchPackageArgs, options?: RequestOptions): Promise<{ pkg: PackageWithOrg }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/packages/package-id/${encodeURIComponent(args.params.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async createPackage(
            args: CreatePackageArgs["data"],
            options?: RequestOptions,
        ): Promise<{ pkg: PackageWithOrg }> {
            return await this.makeRequest({
                method: "POST",
                path: `/packages/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async getSignedPackageImage(
            args: GetSignedPackageImageArgs,
            options?: RequestOptions,
        ): Promise<SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                path: `/packages/thumbnails/package-id/${encodeURIComponent(args.params.id)}/signed-url`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async packageUpdatedNotification(
            args: PackageUpdatedNotificationArgs,
            options?: RequestOptions,
        ): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/packages/package-slug/${encodeURIComponent(args.params.orgSlug)}/${encodeURIComponent(args.params.packageSlug)}/updated`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Payments TYPES ====+====
export namespace ContentServicePayments {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const StandardSku = {
        CREDITS_10000: "10000-credits",
        CREDITS_20000: "20000-credits",
        CREDITS_50000: "50000-credits",
        CREDITS_100000: "100000-credits",
    } as const;
    export type StandardSku = (typeof StandardSku)[keyof typeof StandardSku];
    export interface CreateXsollaPaymentDto {
        username: string;
        productId: StandardSku;
    }
    export type CreatePaymentArgs = {
        data: CreateXsollaPaymentDto;
    };
    export type XsollaWebhookArgs = {
        data: any;
    };
    export interface CreateSteamPayment {
        steamId: string;
        languageCode: string;
        productId: StandardSku;
    }
    export type InitSteamPurchaseArgs = {
        data: CreateSteamPayment;
    };
    export type ExecuteSteamPurchaseArgs = {
        params: {
            orderId: string;
        };
    };

    export interface ContentServicePaymentsClient {
        createPayment(
            args: CreatePaymentArgs["data"],
            options?: RequestOptions,
        ): Promise<{ token: string; order_id: string }>;
        xsollaWebhook(args: XsollaWebhookArgs["data"], options?: RequestOptions): Promise<void>;
        initSteamPurchase(args: InitSteamPurchaseArgs["data"], options?: RequestOptions): Promise<void>;
        executeSteamPurchase(args: ExecuteSteamPurchaseArgs["params"], options?: RequestOptions): Promise<void>;
    }

    export class ContentServicePaymentsBaseClient implements ContentServicePaymentsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createPayment(
            args: CreatePaymentArgs["data"],
            options?: RequestOptions,
        ): Promise<{ token: string; order_id: string }> {
            return await this.makeRequest({
                method: "POST",
                path: `/payments/xsolla/create`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async xsollaWebhook(args: XsollaWebhookArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/payments/xsolla/webhook`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async initSteamPurchase(args: InitSteamPurchaseArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/payments/steam/init`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async executeSteamPurchase(args: ExecuteSteamPurchaseArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/payments/steam/order-id/${encodeURIComponent(args.orderId)}/finalize`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Payouts TYPES ====+====
export namespace ContentServicePayouts {
    export type GetPayoutsArgs = {
        query: {
            cursor?: string;
            state: ContentServicePrisma.CurrencyPayoutRequestState;
        };
    };
    export type GetRecentOrgPayoutRequestArgs = {
        params: {
            orgId: string;
        };
    };
    export interface ReqeustPayoutDto {
        organizationId: string;
        amount: number;
    }
    export type CreatePayoutRequestArgs = {
        data: ReqeustPayoutDto;
    };
    export interface UpdatePayoutDto {
        state: ContentServicePrisma.CurrencyPayoutRequestState;
    }
    export type UpdatePayoutArgs = {
        params: {
            payoutId: string;
        };
        data: UpdatePayoutDto;
    };
    export interface UpdateContactDto {
        email: string;
        fullName: string;
    }
    export type UpdateOrgContactArgs = {
        params: {
            orgId: string;
        };
        data: UpdateContactDto;
    };
    export interface PublicCurrencyPayoutRequestData {
        id: string;
        currencyType: ContentServicePrisma.CurrencyType;
        amount: number;
        processedAt: string | null;
        createdAt: string;
        state: ContentServicePrisma.CurrencyPayoutRequestState;
        organizationId: string;
    }

    export interface ContentServicePayoutsClient {
        getPayouts(
            args: GetPayoutsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ results: ContentServicePrisma.CurrencyPayoutRequest[]; cursor?: string }>;
        getRecentOrgPayoutRequest(
            args: GetRecentOrgPayoutRequestArgs["params"],
            options?: RequestOptions,
        ): Promise<{ payoutRequest: PublicCurrencyPayoutRequestData | null; payoutInfo: boolean }>;
        createPayoutRequest(
            args: CreatePayoutRequestArgs["data"],
            options?: RequestOptions,
        ): Promise<PublicCurrencyPayoutRequestData>;
        updatePayout(
            args: UpdatePayoutArgs,
            options?: RequestOptions,
        ): Promise<ContentServicePrisma.CurrencyPayoutRequest>;
        updateOrgContact(args: UpdateOrgContactArgs, options?: RequestOptions): Promise<void>;
    }

    export class ContentServicePayoutsBaseClient implements ContentServicePayoutsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getPayouts(
            args: GetPayoutsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ results: ContentServicePrisma.CurrencyPayoutRequest[]; cursor?: string }> {
            return await this.makeRequest({
                method: "GET",
                path: `/payouts/`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getRecentOrgPayoutRequest(
            args: GetRecentOrgPayoutRequestArgs["params"],
            options?: RequestOptions,
        ): Promise<{ payoutRequest: PublicCurrencyPayoutRequestData | null; payoutInfo: boolean }> {
            return await this.makeRequest({
                method: "GET",
                path: `/payouts/organization-id/${encodeURIComponent(args.orgId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async createPayoutRequest(
            args: CreatePayoutRequestArgs["data"],
            options?: RequestOptions,
        ): Promise<PublicCurrencyPayoutRequestData> {
            return await this.makeRequest({
                method: "POST",
                path: `/payouts/request`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async updatePayout(
            args: UpdatePayoutArgs,
            options?: RequestOptions,
        ): Promise<ContentServicePrisma.CurrencyPayoutRequest> {
            return await this.makeRequest({
                method: "PUT",
                path: `/payouts/payout-id/${encodeURIComponent(args.params.payoutId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async updateOrgContact(args: UpdateOrgContactArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "PUT",
                path: `/payouts/organization-id/${encodeURIComponent(args.params.orgId)}/contact`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Permissions TYPES ====+====
export namespace ContentServicePermissions {
    export interface PathPartDto {
        key: string;
        identifier?: string | undefined;
    }
    export interface CheckPermissionsDto {
        path: PathPartDto[];
        uid: string;
    }
    export type GetPermissionArgs = {
        data: CheckPermissionsDto;
    };
    export interface PermissionNode {
        displayName: string;
        pathKey: string;
        identifierName?: string;
        desc?: string;
        subtree?: PermissionNode[];
    }

    export interface ContentServicePermissionsClient {
        getPermission(
            args: GetPermissionArgs["data"],
            options?: RequestOptions,
        ): Promise<{
            hasPermission: boolean;
            message?: string;
            member?: ContentServicePrisma.Member & { role: ContentServicePrisma.OrganizationRole };
        }>;
        getSchema(options?: RequestOptions): Promise<{ schema: readonly PermissionNode[] | null }>;
    }

    export class ContentServicePermissionsBaseClient implements ContentServicePermissionsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getPermission(
            args: GetPermissionArgs["data"],
            options?: RequestOptions,
        ): Promise<{
            hasPermission: boolean;
            message?: string;
            member?: ContentServicePrisma.Member & { role: ContentServicePrisma.OrganizationRole };
        }> {
            return await this.makeRequest({
                method: "POST",
                path: `/permissions/validate`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async getSchema(options?: RequestOptions): Promise<{ schema: readonly PermissionNode[] | null }> {
            return await this.makeRequest({
                method: "GET",
                path: `/permissions/schema`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Webhooks TYPES ====+====
export namespace ContentServiceWebhooks {
    export interface CreateWebhookDto {
        url: string;
        resourceId: string;
    }
    export type CreateWebhookArgs = {
        data: CreateWebhookDto;
    };
    export type GetWebhooksArgs = {
        params: {
            resourceId: string;
        };
    };
    export type DeleteWebhookArgs = {
        params: {
            id: string;
        };
    };

    export interface ContentServiceWebhooksClient {
        createWebhook(args: CreateWebhookArgs["data"], options?: RequestOptions): Promise<ContentServicePrisma.Webhook>;
        getWebhooks(args: GetWebhooksArgs["params"], options?: RequestOptions): Promise<ContentServicePrisma.Webhook[]>;
        deleteWebhook(
            args: DeleteWebhookArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServicePrisma.Webhook>;
    }

    export class ContentServiceWebhooksBaseClient implements ContentServiceWebhooksClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createWebhook(
            args: CreateWebhookArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePrisma.Webhook> {
            return await this.makeRequest({
                method: "POST",
                path: `/webhooks/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async getWebhooks(
            args: GetWebhooksArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServicePrisma.Webhook[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/webhooks/resource-id/${encodeURIComponent(args.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async deleteWebhook(
            args: DeleteWebhookArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServicePrisma.Webhook> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/webhooks/webhook-id/${encodeURIComponent(args.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Gear TYPES ====+====
export namespace ContentServiceGear {
    export interface CreateItemClassDto {
        name: string;
        description: string;
        imageId: string;
        tags?: string[];
        default?: boolean;
        tradable?: boolean;
        marketable?: boolean;
        archived?: boolean;
    }
    export interface CreateGearDto extends CreateItemClassDto {
        airAssets?: string[];
        category: string;
        subcategory?: string;
    }
    export type CreateGearClassForResourceArgs = {
        data: CreateGearDto;
        params: {
            resourceId: string;
        };
    };
    export interface UpdateItemClassDto {
        name?: string;
        description?: string;
        imageId?: string;
        tags?: string[];
        default?: boolean;
        tradable?: boolean;
        marketable?: boolean;
        archived?: boolean;
    }
    export interface UpdateGearDto extends UpdateItemClassDto {
        airAssets?: string[];
        category?: string;
        subcategory?: string | null;
    }
    export type UpdateGearClassForResourceArgs = {
        params: {
            classId: string;
        };
        data: UpdateGearDto;
    };
    export type GetGearArgs = {
        params: {
            resourceId: string;
        };
    };
    export interface GetItemsDto {
        queryType?: "tag" | "class";
        query?: string[];
        resourceIds?: string[];
    }
    export type GetUserGearArgs = {
        query?: GetItemsDto;
    };
    export type GetUserGearForResourceArgs = {
        params: {
            uid: string;
        };
        query?: GetItemsDto;
    };
    export type GrantGearArgs = {
        params: {
            uid: string;
            classId: string;
        };
    };
    export type DeleteGearArgs = {
        params: {
            itemId: string;
        };
    };
    export interface SelectedItemClass {
        resourceType: ContentServicePrisma.ResourceType;
        resourceId: string;
        classId: string;
        name: string;
        imageId: string;
        tags: string[];
        description: string;
        default: boolean;
        tradable: { permitted: boolean };
        marketable: { permitted: boolean };
        gear: Omit<ContentServicePrisma.Gear, "classId" | "createdAt"> | null | undefined;
    }
    export interface SelectedGear extends SelectedItemClass {
        gear: { airAssets: string[]; category: string; subcategory: string | null };
    }
    export interface SelectedItem {
        class: SelectedItemClass;
        ownerId: string;
        instanceId: string;
        float: number;
        createdAt: string;
    }
    export interface SelectedGearItem extends SelectedItem {
        class: SelectedGear;
    }

    export interface ContentServiceGearClient {
        createGearClassForResource(
            args: CreateGearClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedGear>;
        updateGearClassForResource(
            args: UpdateGearClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedGear>;
        getGear(args: GetGearArgs["params"], options?: RequestOptions): Promise<SelectedGear[]>;
        getUserGear(args?: GetUserGearArgs["query"], options?: RequestOptions): Promise<SelectedGearItem[]>;
        getUserGearForResource(args: GetUserGearForResourceArgs, options?: RequestOptions): Promise<SelectedGearItem[]>;
        grantGear(args: GrantGearArgs["params"], options?: RequestOptions): Promise<SelectedGearItem>;
        deleteGear(args: DeleteGearArgs["params"], options?: RequestOptions): Promise<SelectedGearItem>;
    }

    export class ContentServiceGearBaseClient implements ContentServiceGearClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createGearClassForResource(
            args: CreateGearClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedGear> {
            return await this.makeRequest({
                method: "POST",
                path: `/gear/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async updateGearClassForResource(
            args: UpdateGearClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedGear> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/gear/class-id/${encodeURIComponent(args.params.classId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async getGear(args: GetGearArgs["params"], options?: RequestOptions): Promise<SelectedGear[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/gear/resource-id/${encodeURIComponent(args.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getUserGear(args?: GetUserGearArgs["query"], options?: RequestOptions): Promise<SelectedGearItem[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/gear/self`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getUserGearForResource(
            args: GetUserGearForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedGearItem[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/gear/uid/${encodeURIComponent(args.params.uid)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async grantGear(args: GrantGearArgs["params"], options?: RequestOptions): Promise<SelectedGearItem> {
            return await this.makeRequest({
                method: "POST",
                path: `/gear/uid/${encodeURIComponent(args.uid)}/class-id/${encodeURIComponent(args.classId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async deleteGear(args: DeleteGearArgs["params"], options?: RequestOptions): Promise<SelectedGearItem> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/gear/item-id/${encodeURIComponent(args.itemId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== ItemClasses TYPES ====+====
export namespace ContentServiceItemClasses {
    export interface CreateItemClassDto {
        name: string;
        description: string;
        imageId: string;
        tags?: string[];
        default?: boolean;
        tradable?: boolean;
        marketable?: boolean;
        archived?: boolean;
    }
    export type CreateItemClassForResourceArgs = {
        data: CreateItemClassDto;
        params: {
            resourceId: string;
        };
    };
    export interface UpdateItemClassDto {
        name?: string;
        description?: string;
        imageId?: string;
        tags?: string[];
        default?: boolean;
        tradable?: boolean;
        marketable?: boolean;
        archived?: boolean;
    }
    export type UpdateClassForResourceArgs = {
        data: UpdateItemClassDto;
        params: {
            classId: string;
        };
    };
    export type GetItemClassesForResourceArgs = {
        params: {
            resourceId: string;
        };
    };
    export type UploadItemImageForResourceArgs = {
        query: {
            contentType: string;
            contentLength: string;
        };
        params: {
            resourceId: string;
        };
    };
    export interface SelectedItemClass {
        resourceType: ContentServicePrisma.ResourceType;
        resourceId: string;
        classId: string;
        name: string;
        imageId: string;
        tags: string[];
        description: string;
        default: boolean;
        tradable: { permitted: boolean };
        marketable: { permitted: boolean };
        gear: Omit<ContentServicePrisma.Gear, "classId" | "createdAt"> | null | undefined;
    }
    export interface PublicImageResource {
        imageId: string;
        name: string | null;
        description: string | null;
        size: number;
        createdAt: string;
    }
    export interface SignedImageUrl extends PublicImageResource {
        url: string;
    }

    export interface ContentServiceItemClassesClient {
        getDefaultPlatformItems(options?: RequestOptions): Promise<SelectedItemClass[]>;
        createItemClassForResource(
            args: CreateItemClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedItemClass>;
        updateClassForResource(args: UpdateClassForResourceArgs, options?: RequestOptions): Promise<SelectedItemClass>;
        getItemClassesForResource(
            args: GetItemClassesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItemClass[]>;
        uploadItemImageForResource(
            args: UploadItemImageForResourceArgs,
            options?: RequestOptions,
        ): Promise<SignedImageUrl>;
    }

    export class ContentServiceItemClassesBaseClient implements ContentServiceItemClassesClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getDefaultPlatformItems(options?: RequestOptions): Promise<SelectedItemClass[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/item-classes/default-items/platform`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async createItemClassForResource(
            args: CreateItemClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedItemClass> {
            return await this.makeRequest({
                method: "POST",
                path: `/item-classes/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async updateClassForResource(
            args: UpdateClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedItemClass> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/item-classes/class-id/${encodeURIComponent(args.params.classId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async getItemClassesForResource(
            args: GetItemClassesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItemClass[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/item-classes/resource-id/${encodeURIComponent(args.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async uploadItemImageForResource(
            args: UploadItemImageForResourceArgs,
            options?: RequestOptions,
        ): Promise<SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                path: `/item-classes/images/resource-id/${encodeURIComponent(args.params.resourceId)}/signed-url`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== ItemTags TYPES ====+====
export namespace ContentServiceItemTags {
    export interface CreateTagDto {
        tagName: string;
    }
    export type CreateTagForResourceArgs = {
        data: CreateTagDto;
        params: {
            resourceId: string;
        };
    };
    export type GetItemTagsForResourceArgs = {
        params: {
            resourceId: string;
        };
    };
    export type DeleteTagForResourceArgs = {
        params: {
            tagName: string;
            resourceId: string;
        };
    };
    export interface SelectedItemTag {
        resourceType: ContentServicePrisma.ResourceType;
        resourceId: string;
        name: string;
        nameLower: string;
        createdAt: string;
    }

    export interface ContentServiceItemTagsClient {
        createTagForResource(args: CreateTagForResourceArgs, options?: RequestOptions): Promise<SelectedItemTag>;
        getItemTagsForResource(
            args: GetItemTagsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItemTag[]>;
        deleteTagForResource(
            args: DeleteTagForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItemTag>;
    }

    export class ContentServiceItemTagsBaseClient implements ContentServiceItemTagsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createTagForResource(args: CreateTagForResourceArgs, options?: RequestOptions): Promise<SelectedItemTag> {
            return await this.makeRequest({
                method: "PUT",
                path: `/item-tags/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async getItemTagsForResource(
            args: GetItemTagsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItemTag[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/item-tags/resource-id/${encodeURIComponent(args.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async deleteTagForResource(
            args: DeleteTagForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItemTag> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/item-tags/resource-id/${encodeURIComponent(args.resourceId)}/tag-name/${encodeURIComponent(args.tagName)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== ItemTransactions TYPES ====+====
export namespace ContentServiceItemTransactions {
    export interface ValidatedTradeHalf {
        uid: string;
        itemInstanceIds?: string[];
    }
    export interface ServiceBrokeredTradeDto {
        leftTradeHalf: ValidatedTradeHalf;
        rightTradeHalf: ValidatedTradeHalf;
    }
    export type TradeArgs = {
        data: ServiceBrokeredTradeDto;
    };

    export interface ContentServiceItemTransactionsClient {
        trade(args: TradeArgs["data"], options?: RequestOptions): Promise<ContentServicePrisma.Transaction>;
    }

    export class ContentServiceItemTransactionsBaseClient implements ContentServiceItemTransactionsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async trade(args: TradeArgs["data"], options?: RequestOptions): Promise<ContentServicePrisma.Transaction> {
            return await this.makeRequest({
                method: "POST",
                path: `/transactions/trade`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Items TYPES ====+====
export namespace ContentServiceItems {
    export interface GrantItemsDto {
        uids: string[];
        resourceType: ContentServicePrisma.ResourceType;
        resourceId: string;
    }
    export type GrantItemsArgs = {
        data: GrantItemsDto;
    };
    export type GrantPlatformItemsArgs = {
        params: {
            uid: string;
        };
    };
    export type GrantItemForResourceArgs = {
        params: {
            uid: string;
            classId: string;
        };
    };
    export type DeleteItemForResourceArgs = {
        params: {
            itemId: string;
        };
    };
    export interface GetItemsDto {
        queryType?: "tag" | "class";
        query?: string[];
        resourceIds?: string[];
    }
    export type GetUserInventoryArgs = {
        query?: GetItemsDto;
    };
    export type GetUserInventoryForResourceArgs = {
        params: {
            uid: string;
        };
        query?: GetItemsDto;
    };
    export interface SelectedItemClass {
        resourceType: ContentServicePrisma.ResourceType;
        resourceId: string;
        classId: string;
        name: string;
        imageId: string;
        tags: string[];
        description: string;
        default: boolean;
        tradable: { permitted: boolean };
        marketable: { permitted: boolean };
        gear: Omit<ContentServicePrisma.Gear, "classId" | "createdAt"> | null | undefined;
    }
    export interface SelectedItem {
        class: SelectedItemClass;
        ownerId: string;
        instanceId: string;
        float: number;
        createdAt: string;
    }

    export interface ContentServiceItemsClient {
        grantItems(args: GrantItemsArgs["data"], options?: RequestOptions): Promise<void>;
        grantPlatformItems(args: GrantPlatformItemsArgs["params"], options?: RequestOptions): Promise<void>;
        grantItemForResource(args: GrantItemForResourceArgs["params"], options?: RequestOptions): Promise<SelectedItem>;
        deleteItemForResource(
            args: DeleteItemForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItem>;
        getUserInventory(args?: GetUserInventoryArgs["query"], options?: RequestOptions): Promise<SelectedItem[]>;
        getUserInventoryForResource(
            args: GetUserInventoryForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedItem[]>;
    }

    export class ContentServiceItemsBaseClient implements ContentServiceItemsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async grantItems(args: GrantItemsArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/items/default-items/grant`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async grantPlatformItems(args: GrantPlatformItemsArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/items/default-items/uid/${encodeURIComponent(args.uid)}/grant-platform`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async grantItemForResource(
            args: GrantItemForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItem> {
            return await this.makeRequest({
                method: "POST",
                path: `/items/uid/${encodeURIComponent(args.uid)}/class-id/${encodeURIComponent(args.classId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async deleteItemForResource(
            args: DeleteItemForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<SelectedItem> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/items/item-id/${encodeURIComponent(args.itemId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getUserInventory(
            args?: GetUserInventoryArgs["query"],
            options?: RequestOptions,
        ): Promise<SelectedItem[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/items/self`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getUserInventoryForResource(
            args: GetUserInventoryForResourceArgs,
            options?: RequestOptions,
        ): Promise<SelectedItem[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/items/uid/${encodeURIComponent(args.params.uid)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Outfits TYPES ====+====
export namespace ContentServiceOutfits {
    export type GetUserActiveOutfitArgs = {
        params: {
            uid: string;
        };
    };
    export type GetOutfitArgs = {
        params: {
            outfitId: string;
        };
    };
    export type LoadOutfitArgs = {
        params: {
            outfitId: string;
        };
    };
    export interface CreateOutfitDto {
        name: string;
        gear?: string[];
        skinColor: string;
        metadata?: object | undefined;
    }
    export type CreateOutfitArgs = {
        data: CreateOutfitDto;
    };
    export interface UpdateOutfitDto {
        name?: string;
        gear?: string[];
        skinColor?: string;
        metadata?: object | undefined;
    }
    export type UpdateOutfitArgs = {
        params: {
            outfitId: string;
        };
        data: UpdateOutfitDto;
    };
    export interface SelectedItemClass {
        resourceType: ContentServicePrisma.ResourceType;
        resourceId: string;
        classId: string;
        name: string;
        imageId: string;
        tags: string[];
        description: string;
        default: boolean;
        tradable: { permitted: boolean };
        marketable: { permitted: boolean };
        gear: Omit<ContentServicePrisma.Gear, "classId" | "createdAt"> | null | undefined;
    }
    export interface SelectedItem {
        class: SelectedItemClass;
        ownerId: string;
        instanceId: string;
        float: number;
        createdAt: string;
    }
    export interface SelectedGear extends SelectedItemClass {
        gear: { airAssets: string[]; category: string; subcategory: string | null };
    }
    export interface SelectedGearItem extends SelectedItem {
        class: SelectedGear;
    }
    export interface SelectedOutfit {
        outfitId: string;
        name: string;
        skinColor: string;
        gear: SelectedGearItem[];
        metadata: unknown | null;
        equipped: boolean;
        createdAt: string;
    }

    export interface ContentServiceOutfitsClient {
        getOutfits(options?: RequestOptions): Promise<SelectedOutfit[]>;
        getActiveOutfit(options?: RequestOptions): Promise<{ outfit: SelectedOutfit | undefined }>;
        getUserActiveOutfit(
            args: GetUserActiveOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: SelectedOutfit | undefined }>;
        getOutfit(
            args: GetOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: SelectedOutfit | undefined }>;
        loadOutfit(args: LoadOutfitArgs["params"], options?: RequestOptions): Promise<{ outfit: SelectedOutfit }>;
        createOutfit(args: CreateOutfitArgs["data"], options?: RequestOptions): Promise<{ outfit: SelectedOutfit }>;
        updateOutfit(args: UpdateOutfitArgs, options?: RequestOptions): Promise<{ outfit: SelectedOutfit }>;
    }

    export class ContentServiceOutfitsBaseClient implements ContentServiceOutfitsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getOutfits(options?: RequestOptions): Promise<SelectedOutfit[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/outfits/`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getActiveOutfit(options?: RequestOptions): Promise<{ outfit: SelectedOutfit | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/outfits/equipped/self`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getUserActiveOutfit(
            args: GetUserActiveOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: SelectedOutfit | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/outfits/uid/${encodeURIComponent(args.uid)}/equipped`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getOutfit(
            args: GetOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: SelectedOutfit | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/outfits/outfit-id/${encodeURIComponent(args.outfitId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async loadOutfit(
            args: LoadOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: SelectedOutfit }> {
            return await this.makeRequest({
                method: "POST",
                path: `/outfits/outfit-id/${encodeURIComponent(args.outfitId)}/equip`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async createOutfit(
            args: CreateOutfitArgs["data"],
            options?: RequestOptions,
        ): Promise<{ outfit: SelectedOutfit }> {
            return await this.makeRequest({
                method: "POST",
                path: `/outfits/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async updateOutfit(args: UpdateOutfitArgs, options?: RequestOptions): Promise<{ outfit: SelectedOutfit }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/outfits/outfit-id/${encodeURIComponent(args.params.outfitId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== OrganizationRoles TYPES ====+====
export namespace ContentServiceOrganizationRoles {
    export interface PermissionGroup {
        [permissionKey: string]: PermissionEntry;
    }
    export type PermissionEntry<T extends PermissionGroup = PermissionGroup> = T | boolean;
    export interface OrganizationRolePermissionsDto {
        permissions: PermissionEntry;
    }
    export interface CreateRoleDto {
        name: string;
        permissionsData: OrganizationRolePermissionsDto;
    }
    export type CreateRoleArgs = {
        params: {
            orgId: string;
        };
        data: CreateRoleDto;
    };
    export interface UpdateRoleDto {
        name: string;
        permissionsData: OrganizationRolePermissionsDto;
    }
    export type UpdateRoleArgs = {
        params: {
            roleName: string;
            orgId: string;
        };
        data: UpdateRoleDto;
    };
    export type DeleteRoleArgs = {
        params: {
            orgId: string;
            roleName: string;
        };
    };
    export type GetRolesArgs = {
        params: {
            orgId: string;
        };
    };

    export interface ContentServiceOrganizationRolesClient {
        createRole(
            args: CreateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServicePrisma.OrganizationRole }>;
        updateRole(
            args: UpdateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServicePrisma.OrganizationRole }>;
        deleteRole(
            args: DeleteRoleArgs["params"],
            options?: RequestOptions,
        ): Promise<{ role: ContentServicePrisma.OrganizationRole | null }>;
        getRoles(
            args: GetRolesArgs["params"],
            options?: RequestOptions,
        ): Promise<{ roles: ContentServicePrisma.OrganizationRole[] }>;
    }

    export class ContentServiceOrganizationRolesBaseClient implements ContentServiceOrganizationRolesClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createRole(
            args: CreateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServicePrisma.OrganizationRole }> {
            return await this.makeRequest({
                method: "POST",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}/create`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async updateRole(
            args: UpdateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServicePrisma.OrganizationRole }> {
            return await this.makeRequest({
                method: "PUT",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}/role-name/${encodeURIComponent(args.params.roleName)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async deleteRole(
            args: DeleteRoleArgs["params"],
            options?: RequestOptions,
        ): Promise<{ role: ContentServicePrisma.OrganizationRole | null }> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.orgId)}/role-name/${encodeURIComponent(args.roleName)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getRoles(
            args: GetRolesArgs["params"],
            options?: RequestOptions,
        ): Promise<{ roles: ContentServicePrisma.OrganizationRole[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.orgId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Products TYPES ====+====
export namespace ContentServiceProducts {
    export interface CurrencyProductItemDto {
        itemClassId: string;
        quantity: number;
    }
    export interface CreateProductDto {
        name: string;
        resourceId: string;
        resourceType: ContentServicePrisma.ResourceType;
        price: number;
        active: boolean;
        unique: boolean;
        giftable: boolean;
        currencyProductItems?: CurrencyProductItemDto[];
    }
    export type CreateProductArgs = {
        data: CreateProductDto;
    };
    export interface UpdateProductDto {
        name?: string;
        price?: number;
        active?: boolean;
        unique?: boolean;
        giftable?: boolean;
        currencyProductItems?: CurrencyProductItemDto[];
    }
    export type UpdateProductArgs = {
        params: {
            id: string;
        };
        data: UpdateProductDto;
    };
    export type DeleteProductArgs = {
        params: {
            id: string;
        };
    };
    export type GetProductsArgs = {
        query: {
            resourceId: string;
        };
    };
    export type GetProductArgs = {
        params: {
            id: string;
            productId: string;
        };
    };
    export interface CurrencyProductWithItems extends ContentServicePrisma.CurrencyProduct {
        currencyProductItems: ContentServicePrisma.CurrencyProductItem[];
    }

    export interface ContentServiceProductsClient {
        createProduct(
            args: CreateProductArgs["data"],
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems }>;
        updateProduct(
            args: UpdateProductArgs,
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems }>;
        deleteProduct(
            args: DeleteProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems }>;
        getProducts(args: GetProductsArgs["query"], options?: RequestOptions): Promise<CurrencyProductWithItems[]>;
        getProduct(
            args: GetProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems | undefined }>;
    }

    export class ContentServiceProductsBaseClient implements ContentServiceProductsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createProduct(
            args: CreateProductArgs["data"],
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems }> {
            return await this.makeRequest({
                method: "POST",
                path: `/shop/products/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async updateProduct(
            args: UpdateProductArgs,
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/shop/products/product-id/${encodeURIComponent(args.params.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args.data,
                retryKey: options?.retryKey,
            });
        }
        async deleteProduct(
            args: DeleteProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems }> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/shop/products/product-id/${encodeURIComponent(args.id)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getProducts(
            args: GetProductsArgs["query"],
            options?: RequestOptions,
        ): Promise<CurrencyProductWithItems[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/products/`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getProduct(
            args: GetProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: CurrencyProductWithItems | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/products/product-id/${encodeURIComponent(args.productId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== Purchase TYPES ====+====
export namespace ContentServicePurchase {
    export interface ValidatePurchaseDto {
        productId: string;
        receiverUid: string;
        quantity: number;
    }
    export type ValidatePurchaseArgs = {
        data: ValidatePurchaseDto;
    };
    export interface PurchaseDto {
        productId: string;
        receiverUid: string;
        quantity: number;
        total: number;
    }
    export type PurchaseArgs = {
        data: PurchaseDto;
    };
    export interface ClaimPurchaseDto {
        receiptId: string;
    }
    export type ClaimReceiptArgs = {
        data: ClaimPurchaseDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ClaimResult = {
        COMPLETED: "COMPLETED",
        FAILED: "FAILED",
    } as const;
    export type ClaimResult = (typeof ClaimResult)[keyof typeof ClaimResult];
    export interface CompleteClaimDto {
        receiptId: string;
        result: ClaimResult;
    }
    export type CompleteReceiptArgs = {
        data: CompleteClaimDto;
    };
    export interface ValidatedPurchase {
        productId: string;
        quantity: number;
        total: number;
        product: ContentServicePrisma.CurrencyProduct;
    }
    export interface ClaimedCurrencyTransaction {
        id: string;
        purchaserUid: string;
        receiverUid: string;
        price: number;
        quantity: number;
        total: number;
        productId: string;
        product: ContentServicePrisma.CurrencyProduct;
        createdAt: string;
    }

    export interface ContentServicePurchaseClient {
        validatePurchase(args: ValidatePurchaseArgs["data"], options?: RequestOptions): Promise<ValidatedPurchase>;
        purchase(args: PurchaseArgs["data"], options?: RequestOptions): Promise<{ receiptId: string }>;
        claimReceipt(args: ClaimReceiptArgs["data"], options?: RequestOptions): Promise<ClaimedCurrencyTransaction>;
        completeReceipt(args: CompleteReceiptArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class ContentServicePurchaseBaseClient implements ContentServicePurchaseClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async validatePurchase(
            args: ValidatePurchaseArgs["data"],
            options?: RequestOptions,
        ): Promise<ValidatedPurchase> {
            return await this.makeRequest({
                method: "POST",
                path: `/shop/purchase/validate`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async purchase(args: PurchaseArgs["data"], options?: RequestOptions): Promise<{ receiptId: string }> {
            return await this.makeRequest({
                method: "POST",
                path: `/shop/purchase/`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async claimReceipt(
            args: ClaimReceiptArgs["data"],
            options?: RequestOptions,
        ): Promise<ClaimedCurrencyTransaction> {
            return await this.makeRequest({
                method: "POST",
                path: `/shop/purchase/receipt/claim`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
        async completeReceipt(args: CompleteReceiptArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/shop/purchase/receipt/complete`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
    }
}
// ====+==== ShopTransactions TYPES ====+====
export namespace ContentServiceShopTransactions {
    export type GetTransactionsForResourceArgs = {
        query?: {
            cursor?: string;
        };
        params: {
            resourceId: string;
        };
    };
    export type GetResourceTransactionArgs = {
        params: {
            transactionId: string;
            resourceId: string;
        };
    };
    export type GetUserTransactionsArgs = {
        query?: {
            cursor?: string;
        };
    };
    export type GetTransactionForProductArgs = {
        params: {
            productId: string;
            userId: string;
        };
    };
    export type GetRefundDetailsArgs = {
        params: {
            transactionId: string;
        };
    };
    export interface RefundDto {
        transactionId: string;
    }
    export type RefundTransactionArgs = {
        data: RefundDto;
    };
    export interface OwnershipValidationResult {
        valid: boolean;
        results: { instanceId: string; valid: boolean; className?: string }[];
    }
    export interface RefundDetails {
        payerResourceId: string;
        payerResourceType: ContentServicePrisma.ResourceType;
        usingEarnedCurrency: boolean;
        sellerAmount: number;
        platformAmount: number;
        usageAmount: number;
        ableToRefund: boolean;
        itemsToRefund: OwnershipValidationResult["results"];
        reasons: string[];
        warnings: string[];
    }
    export interface CurrencyTransactionWithSummary extends ContentServicePrisma.CurrencyTransaction {
        summary: ContentServicePrisma.CurrencyEarningsSummary | undefined;
    }

    export interface ContentServiceShopTransactionsClient {
        getTransactionsForResource(
            args: GetTransactionsForResourceArgs,
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServicePrisma.CurrencyTransaction[] }>;
        getResourceTransaction(
            args: GetResourceTransactionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServicePrisma.CurrencyTransaction | undefined }>;
        getUserTransactions(
            args?: GetUserTransactionsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServicePrisma.CurrencyTransaction[] }>;
        getTransactionForProduct(
            args: GetTransactionForProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServicePrisma.CurrencyTransaction | undefined }>;
        getRefundDetails(
            args: GetRefundDetailsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ details: RefundDetails | undefined }>;
        refundTransaction(
            args: RefundTransactionArgs["data"],
            options?: RequestOptions,
        ): Promise<{ summary: CurrencyTransactionWithSummary | undefined }>;
    }

    export class ContentServiceShopTransactionsBaseClient implements ContentServiceShopTransactionsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getTransactionsForResource(
            args: GetTransactionsForResourceArgs,
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServicePrisma.CurrencyTransaction[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/transactions/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args.query,
                retryKey: options?.retryKey,
            });
        }
        async getResourceTransaction(
            args: GetResourceTransactionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServicePrisma.CurrencyTransaction | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/transactions/resource-id/${encodeURIComponent(args.resourceId)}/transaction-id/${encodeURIComponent(args.transactionId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getUserTransactions(
            args?: GetUserTransactionsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServicePrisma.CurrencyTransaction[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/transactions/self`,
                authentication: options?.authentication,
                headers: options?.headers,
                query: args,
                retryKey: options?.retryKey,
            });
        }
        async getTransactionForProduct(
            args: GetTransactionForProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServicePrisma.CurrencyTransaction | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/transactions/user-id/${encodeURIComponent(args.userId)}/product-id/${encodeURIComponent(args.productId)}`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async getRefundDetails(
            args: GetRefundDetailsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ details: RefundDetails | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/shop/transactions/transaction-id/${encodeURIComponent(args.transactionId)}/refund/details`,
                authentication: options?.authentication,
                headers: options?.headers,
                retryKey: options?.retryKey,
            });
        }
        async refundTransaction(
            args: RefundTransactionArgs["data"],
            options?: RequestOptions,
        ): Promise<{ summary: CurrencyTransactionWithSummary | undefined }> {
            return await this.makeRequest({
                method: "POST",
                path: `/shop/transactions/transaction/refund`,
                authentication: options?.authentication,
                headers: options?.headers,
                body: args,
                retryKey: options?.retryKey,
            });
        }
    }
}

export interface ContentServiceClient {
    artifacts: ContentServiceArtifacts.ContentServiceArtifactsClient;
    currency: ContentServiceCurrency.ContentServiceCurrencyClient;
    favorites: ContentServiceFavorites.ContentServiceFavoritesClient;
    games: ContentServiceGames.ContentServiceGamesClient;
    images: ContentServiceImages.ContentServiceImagesClient;
    memberships: ContentServiceMemberships.ContentServiceMembershipsClient;
    organizations: ContentServiceOrganizations.ContentServiceOrganizationsClient;
    packages: ContentServicePackages.ContentServicePackagesClient;
    payments: ContentServicePayments.ContentServicePaymentsClient;
    payouts: ContentServicePayouts.ContentServicePayoutsClient;
    permissions: ContentServicePermissions.ContentServicePermissionsClient;
    webhooks: ContentServiceWebhooks.ContentServiceWebhooksClient;
    gear: ContentServiceGear.ContentServiceGearClient;
    itemClasses: ContentServiceItemClasses.ContentServiceItemClassesClient;
    itemTags: ContentServiceItemTags.ContentServiceItemTagsClient;
    itemTransactions: ContentServiceItemTransactions.ContentServiceItemTransactionsClient;
    items: ContentServiceItems.ContentServiceItemsClient;
    outfits: ContentServiceOutfits.ContentServiceOutfitsClient;
    organizationRoles: ContentServiceOrganizationRoles.ContentServiceOrganizationRolesClient;
    products: ContentServiceProducts.ContentServiceProductsClient;
    purchase: ContentServicePurchase.ContentServicePurchaseClient;
    shopTransactions: ContentServiceShopTransactions.ContentServiceShopTransactionsClient;
}

export class ContentServiceBaseClient implements ContentServiceClient {
    public readonly artifacts: ContentServiceArtifacts.ContentServiceArtifactsClient;
    public readonly currency: ContentServiceCurrency.ContentServiceCurrencyClient;
    public readonly favorites: ContentServiceFavorites.ContentServiceFavoritesClient;
    public readonly games: ContentServiceGames.ContentServiceGamesClient;
    public readonly images: ContentServiceImages.ContentServiceImagesClient;
    public readonly memberships: ContentServiceMemberships.ContentServiceMembershipsClient;
    public readonly organizations: ContentServiceOrganizations.ContentServiceOrganizationsClient;
    public readonly packages: ContentServicePackages.ContentServicePackagesClient;
    public readonly payments: ContentServicePayments.ContentServicePaymentsClient;
    public readonly payouts: ContentServicePayouts.ContentServicePayoutsClient;
    public readonly permissions: ContentServicePermissions.ContentServicePermissionsClient;
    public readonly webhooks: ContentServiceWebhooks.ContentServiceWebhooksClient;
    public readonly gear: ContentServiceGear.ContentServiceGearClient;
    public readonly itemClasses: ContentServiceItemClasses.ContentServiceItemClassesClient;
    public readonly itemTags: ContentServiceItemTags.ContentServiceItemTagsClient;
    public readonly itemTransactions: ContentServiceItemTransactions.ContentServiceItemTransactionsClient;
    public readonly items: ContentServiceItems.ContentServiceItemsClient;
    public readonly outfits: ContentServiceOutfits.ContentServiceOutfitsClient;
    public readonly organizationRoles: ContentServiceOrganizationRoles.ContentServiceOrganizationRolesClient;
    public readonly products: ContentServiceProducts.ContentServiceProductsClient;
    public readonly purchase: ContentServicePurchase.ContentServicePurchaseClient;
    public readonly shopTransactions: ContentServiceShopTransactions.ContentServiceShopTransactionsClient;

    constructor(makeRequest: MakeRequest) {
        this.artifacts = new ContentServiceArtifacts.ContentServiceArtifactsBaseClient(makeRequest);
        this.currency = new ContentServiceCurrency.ContentServiceCurrencyBaseClient(makeRequest);
        this.favorites = new ContentServiceFavorites.ContentServiceFavoritesBaseClient(makeRequest);
        this.games = new ContentServiceGames.ContentServiceGamesBaseClient(makeRequest);
        this.images = new ContentServiceImages.ContentServiceImagesBaseClient(makeRequest);
        this.memberships = new ContentServiceMemberships.ContentServiceMembershipsBaseClient(makeRequest);
        this.organizations = new ContentServiceOrganizations.ContentServiceOrganizationsBaseClient(makeRequest);
        this.packages = new ContentServicePackages.ContentServicePackagesBaseClient(makeRequest);
        this.payments = new ContentServicePayments.ContentServicePaymentsBaseClient(makeRequest);
        this.payouts = new ContentServicePayouts.ContentServicePayoutsBaseClient(makeRequest);
        this.permissions = new ContentServicePermissions.ContentServicePermissionsBaseClient(makeRequest);
        this.webhooks = new ContentServiceWebhooks.ContentServiceWebhooksBaseClient(makeRequest);
        this.gear = new ContentServiceGear.ContentServiceGearBaseClient(makeRequest);
        this.itemClasses = new ContentServiceItemClasses.ContentServiceItemClassesBaseClient(makeRequest);
        this.itemTags = new ContentServiceItemTags.ContentServiceItemTagsBaseClient(makeRequest);
        this.itemTransactions = new ContentServiceItemTransactions.ContentServiceItemTransactionsBaseClient(
            makeRequest,
        );
        this.items = new ContentServiceItems.ContentServiceItemsBaseClient(makeRequest);
        this.outfits = new ContentServiceOutfits.ContentServiceOutfitsBaseClient(makeRequest);
        this.organizationRoles = new ContentServiceOrganizationRoles.ContentServiceOrganizationRolesBaseClient(
            makeRequest,
        );
        this.products = new ContentServiceProducts.ContentServiceProductsBaseClient(makeRequest);
        this.purchase = new ContentServicePurchase.ContentServicePurchaseBaseClient(makeRequest);
        this.shopTransactions = new ContentServiceShopTransactions.ContentServiceShopTransactionsBaseClient(
            makeRequest,
        );
    }
}
