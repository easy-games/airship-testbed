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
export namespace ContentServiceDatabaseTypes {
    export type Artifact = {
        id: string;
        gameId: string | undefined;
        uploadedBy: string | undefined;
        owner: ContentServiceDatabaseTypes.ArtifactOwner;
        type: string;
        name: string;
        note: string | undefined;
        createdAt: string;
        size: number;
        uploadedAt: string | undefined;
    };

    export const ArtifactOwner = {
        Platform: "Platform",
        Game: "Game",
    } as const;
    export type ArtifactOwner = (typeof ArtifactOwner)[keyof typeof ArtifactOwner];

    export type CurrencyEarningsSummary = {
        id: string;
        year: number;
        week: number;
        organizationId: string;
        resourceId: string;
        resourceType: ContentServiceDatabaseTypes.ResourceType;
        currencyType: ContentServiceDatabaseTypes.CurrencyType;
        revenue: number;
        platformFeePercent: number;
        usageFeeAmount: number;
        playtimeBonusAmount: number;
        processed: boolean;
        processedAt: string | undefined;
        createdAt: string;
        platformFeeAmount: number | undefined;
        finalBalance: number | undefined;
        usageData: unknown | undefined;
    };

    export const CurrencyPayoutRequestState = {
        PROCESSING: "PROCESSING",
        PAID: "PAID",
        REJECTED: "REJECTED",
    } as const;
    export type CurrencyPayoutRequestState =
        (typeof CurrencyPayoutRequestState)[keyof typeof CurrencyPayoutRequestState];

    export type CurrencyProduct = {
        id: string;
        resourceId: string;
        resourceType: ContentServiceDatabaseTypes.ResourceType;
        name: string;
        price: number;
        active: boolean;
        unique: boolean;
        giftable: boolean;
        deleted: boolean;
        createdAt: string;
        fullfillmentMethod: ContentServiceDatabaseTypes.ProductFullfillmentMethod;
    };

    export type CurrencyProductItem = {
        currencyProductId: string;
        itemClassId: string;
        quantity: number;
        createdAt: string;
        updatedAt: string;
    };

    export type CurrencyTransaction = {
        id: string;
        purchaserUid: string;
        receiverUid: string;
        status: ContentServiceDatabaseTypes.CurrencyTransactionStatus;
        price: number;
        quantity: number;
        total: number;
        productId: string;
        productResourceId: string;
        productResourceType: ContentServiceDatabaseTypes.ResourceType;
        productName: string;
        createdAt: string;
        completedAt: string | undefined;
        summaryId: string | undefined;
        itemTransactionId: string | undefined;
        refundItemTransactionId: string | undefined;
    };

    export const CurrencyTransactionStatus = {
        PENDING: "PENDING",
        PROCESSING: "PROCESSING",
        FULFILLED: "FULFILLED",
        REFUNDED: "REFUNDED",
    } as const;
    export type CurrencyTransactionStatus = (typeof CurrencyTransactionStatus)[keyof typeof CurrencyTransactionStatus];

    export const CurrencyType = {
        CREDITS: "CREDITS",
        EARNED_CREDITS: "EARNED_CREDITS",
    } as const;
    export type CurrencyType = (typeof CurrencyType)[keyof typeof CurrencyType];

    export type Game = {
        id: string;
        slug: string | undefined;
        slugProperCase: string | undefined;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ContentServiceDatabaseTypes.GameVisibility;
        lastVersionUpdate: string | undefined;
        archivedAt: string | undefined;
        loadingScreenImageId: string | undefined;
        logoImageId: string | undefined;
        links: unknown | undefined;
        videoId: string | undefined;
        platforms: string[];
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        adminForceVisibility: ContentServiceDatabaseTypes.GameVisibility | undefined;
        adminHideUntilNextPublish: boolean;
    };

    export const GameVisibility = {
        PUBLIC: "PUBLIC",
        PRIVATE: "PRIVATE",
        UNLISTED: "UNLISTED",
    } as const;
    export type GameVisibility = (typeof GameVisibility)[keyof typeof GameVisibility];

    export type Gear = {
        classId: string;
        createdAt: string;
        airAssets: string[];
        category: string;
        subcategory: string | undefined;
    };

    export const ImageOwnerType = {
        GAME: "GAME",
        ORGANIZATION: "ORGANIZATION",
        USER: "USER",
        PACKAGE: "PACKAGE",
    } as const;
    export type ImageOwnerType = (typeof ImageOwnerType)[keyof typeof ImageOwnerType];

    export type Member = {
        uid: string;
        organizationId: string;
        roleName: string;
        createdAt: string;
        joinedAt: string | undefined;
        status: ContentServiceDatabaseTypes.MemberStatus;
    };

    export const MemberStatus = {
        INVITED: "INVITED",
        ACTIVE: "ACTIVE",
    } as const;
    export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

    export type Organization = {
        id: string;
        slug: string;
        slugProperCase: string;
        name: string;
        description: string;
        iconImageId: string;
        createdAt: string;
        adminBanned: boolean;
    };

    export type OrganizationRole = {
        roleName: string;
        createdAt: string;
        organizationId: string;
        permissionsData: unknown;
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

    export const ProductFullfillmentMethod = {
        RECEIPT: "RECEIPT",
        IMMEDIATE: "IMMEDIATE",
    } as const;
    export type ProductFullfillmentMethod = (typeof ProductFullfillmentMethod)[keyof typeof ProductFullfillmentMethod];

    export const ResourceType = {
        GAME: "GAME",
        ORGANIZATION: "ORGANIZATION",
    } as const;
    export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType];

    export type Transaction = {
        type: ContentServiceDatabaseTypes.TransactionType;
        createdAt: string;
        transactionId: string;
        details: ContentServiceDatabaseTypes.TransactionDetails | undefined;
    };

    export interface TransactionDetails {
        itemsGained?: { uid: string; classId: string; resourceType: string; resourceId: string; instanceId: string }[];
        itemsLost?: { uid: string; classId: string; resourceType: string; resourceId: string; instanceId: string }[];
    }

    export const TransactionType = {
        GRANT_ITEM: "GRANT_ITEM",
        DELETE_ITEM: "DELETE_ITEM",
        GAME_BROKERED_TRADE: "GAME_BROKERED_TRADE",
        GRANT_DEFAULT_ITEMS: "GRANT_DEFAULT_ITEMS",
        CURRENCY_PRODUCT_TRANSACTION: "CURRENCY_PRODUCT_TRANSACTION",
        CURRENCY_PRODUCT_REFUND: "CURRENCY_PRODUCT_REFUND",
    } as const;
    export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

    export type Webhook = {
        id: string;
        url: string;
        resourceId: string;
        createdAt: string;
    };
}

// ====+==== Internal Types ====+====
export namespace InternalContentServiceTypes {
    export const DeploymentPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        Android: "Android",
    } as const;
    export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];

    export type Override<SourceType, ReplacementType, OmitKeys extends keyof SourceType = never> = Omit<
        SourceType,
        (keyof ReplacementType & keyof SourceType) | OmitKeys
    > &
        ReplacementType;
}

// ====+==== Artifacts Types ====+====
export namespace ContentServiceArtifacts {
    export const ArtifactType = {
        MICRO_PROFILE: "MICRO_PROFILE",
        CLIENT_DEBUG_ARCHIVE: "CLIENT_DEBUG_ARCHIVE",
    } as const;
    export type ArtifactType = (typeof ArtifactType)[keyof typeof ArtifactType];

    export type DownloadArtifactArgs = {
        params: {
            artifactId: string;
        };
    };

    export type GetArtifactsArgs = {
        params: {
            gameId: string;
            type: ContentServiceArtifacts.ArtifactType;
        };
        query?: {
            cursor?: string;
        };
    };

    export type GetPlatformSignedUrlArgs = {
        data: ContentServiceArtifacts.SignedArtifactUploadUrlDto;
    };

    export type GetSignedUrlArgs = {
        data: ContentServiceArtifacts.SignedArtifactUploadUrlDto;
    };

    export interface SignedArtifactUploadUrlDto {
        type: ContentServiceArtifacts.ArtifactType;
        name: string;
        note?: string;
        contentType: string;
        contentLength: number;
    }

    export interface ClientSpec {
        downloadArtifact(args: DownloadArtifactArgs["params"], options?: RequestOptions): Promise<{ url: string }>;
        getArtifacts(
            args: GetArtifactsArgs,
            options?: RequestOptions,
        ): Promise<{ results: ContentServiceDatabaseTypes.Artifact[]; cursor?: string }>;
        getPlatformSignedUrl(
            args: GetPlatformSignedUrlArgs["data"],
            options?: RequestOptions,
        ): Promise<{ id: string; url: string }>;
        getSignedUrl(args: GetSignedUrlArgs["data"], options?: RequestOptions): Promise<{ id: string; url: string }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async downloadArtifact(
            args: DownloadArtifactArgs["params"],
            options?: RequestOptions,
        ): Promise<{ url: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Artifacts:downloadArtifact",
                path: `/artifacts/artifact-id/${encodeURIComponent(args.artifactId)}`,
                retryKey: options?.retryKey ?? "ContentService:Artifacts:downloadArtifact",
            });
        }
        async getArtifacts(
            args: GetArtifactsArgs,
            options?: RequestOptions,
        ): Promise<{ results: ContentServiceDatabaseTypes.Artifact[]; cursor?: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Artifacts:getArtifacts",
                path: `/artifacts/game-id/${encodeURIComponent(args.params.gameId)}/type/${encodeURIComponent(args.params.type)}`,
                retryKey: options?.retryKey ?? "ContentService:Artifacts:getArtifacts",
                query: args.query,
            });
        }
        async getPlatformSignedUrl(
            args: GetPlatformSignedUrlArgs["data"],
            options?: RequestOptions,
        ): Promise<{ id: string; url: string }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Artifacts:getPlatformSignedUrl",
                path: `/artifacts/platform/signed-url`,
                retryKey: options?.retryKey ?? "ContentService:Artifacts:getPlatformSignedUrl",
                body: args,
            });
        }
        async getSignedUrl(
            args: GetSignedUrlArgs["data"],
            options?: RequestOptions,
        ): Promise<{ id: string; url: string }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Artifacts:getSignedUrl",
                path: `/artifacts/signed-url`,
                retryKey: options?.retryKey ?? "ContentService:Artifacts:getSignedUrl",
                body: args,
            });
        }
    }
}

// ====+==== Currency Types ====+====
export namespace ContentServiceCurrency {
    export type CurrencyEarningsSummaries = {
        [Key in ContentServiceDatabaseTypes.CurrencyType]: ContentServiceDatabaseTypes.CurrencyEarningsSummary;
    };

    export type CurrencyValues = { [Key in ContentServiceDatabaseTypes.CurrencyType]: number };

    export type GetEarningsForResourceArgs = {
        params: {
            resourceId: string;
        };
    };

    export type GetGameEarningsArgs = {
        query?: ContentServiceCurrency.GetGameEarningsDto;
        params: {
            orgId: string;
            gameId: string;
        };
    };

    export interface GetGameEarningsDto {
        limit?: number;
        skip?: number;
    }

    export type GetOrgCurrencyArgs = {
        params: {
            orgId: string;
        };
    };

    export type GetOrgEarningsArgs = {
        params: {
            orgId: string;
        };
        query?: {
            cursor?: string;
        };
    };

    export type GetSummaryArgs = {
        params: {
            orgId: string;
            summaryId: string;
        };
    };

    export interface ClientSpec {
        getCurrency(options?: RequestOptions): Promise<ContentServiceCurrency.CurrencyValues>;
        getEarningsForResource(
            args: GetEarningsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceCurrency.CurrencyEarningsSummaries>;
        getGameEarnings(
            args: GetGameEarningsArgs,
            options?: RequestOptions,
        ): Promise<{ summaries: ContentServiceDatabaseTypes.CurrencyEarningsSummary[] }>;
        getOrgCurrency(
            args: GetOrgCurrencyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ owned: ContentServiceCurrency.CurrencyValues; pending: ContentServiceCurrency.CurrencyValues }>;
        getOrgEarnings(
            args: GetOrgEarningsArgs,
            options?: RequestOptions,
        ): Promise<{ cursor: string | undefined; results: ContentServiceDatabaseTypes.CurrencyEarningsSummary[] }>;
        getSummary(
            args: GetSummaryArgs["params"],
            options?: RequestOptions,
        ): Promise<{ summary: ContentServiceDatabaseTypes.CurrencyEarningsSummary | undefined }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getCurrency(options?: RequestOptions): Promise<ContentServiceCurrency.CurrencyValues> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Currency:getCurrency",
                path: `/currency/`,
                retryKey: options?.retryKey ?? "ContentService:Currency:getCurrency",
            });
        }
        async getEarningsForResource(
            args: GetEarningsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceCurrency.CurrencyEarningsSummaries> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Currency:getEarningsForResource",
                path: `/currency/resource-id/${encodeURIComponent(args.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:Currency:getEarningsForResource",
            });
        }
        async getGameEarnings(
            args: GetGameEarningsArgs,
            options?: RequestOptions,
        ): Promise<{ summaries: ContentServiceDatabaseTypes.CurrencyEarningsSummary[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Currency:getGameEarnings",
                path: `/currency/organization-id/${encodeURIComponent(args.params.orgId)}/game/${encodeURIComponent(args.params.gameId)}/summaries`,
                retryKey: options?.retryKey ?? "ContentService:Currency:getGameEarnings",
                query: args.query,
            });
        }
        async getOrgCurrency(
            args: GetOrgCurrencyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ owned: ContentServiceCurrency.CurrencyValues; pending: ContentServiceCurrency.CurrencyValues }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Currency:getOrgCurrency",
                path: `/currency/organization-id/${encodeURIComponent(args.orgId)}`,
                retryKey: options?.retryKey ?? "ContentService:Currency:getOrgCurrency",
            });
        }
        async getOrgEarnings(
            args: GetOrgEarningsArgs,
            options?: RequestOptions,
        ): Promise<{ cursor: string | undefined; results: ContentServiceDatabaseTypes.CurrencyEarningsSummary[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Currency:getOrgEarnings",
                path: `/currency/organization-id/${encodeURIComponent(args.params.orgId)}/summaries`,
                retryKey: options?.retryKey ?? "ContentService:Currency:getOrgEarnings",
                query: args.query,
            });
        }
        async getSummary(
            args: GetSummaryArgs["params"],
            options?: RequestOptions,
        ): Promise<{ summary: ContentServiceDatabaseTypes.CurrencyEarningsSummary | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Currency:getSummary",
                path: `/currency/organization-id/${encodeURIComponent(args.orgId)}/summary/${encodeURIComponent(args.summaryId)}`,
                retryKey: options?.retryKey ?? "ContentService:Currency:getSummary",
            });
        }
    }
}

// ====+==== Favorites Types ====+====
export namespace ContentServiceFavorites {
    export const FavoritesType = {
        GAME: "GAME",
    } as const;
    export type FavoritesType = (typeof FavoritesType)[keyof typeof FavoritesType];

    export type GetFavoritesArgs = {
        params: {
            favorites_type: ContentServiceFavorites.FavoritesType;
        };
    };

    export type SetFavoriteArgs = {
        data: ContentServiceFavorites.SetFavoriteDto;
        params: {
            favorites_type: ContentServiceFavorites.FavoritesType;
        };
    };

    export interface SetFavoriteDto {
        resourceId: string;
        isFavorite: boolean;
    }

    export interface ClientSpec {
        getFavorites(
            args: GetFavoritesArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            type: ContentServiceFavorites.FavoritesType;
            data: { resourceId: string; resource: ContentServiceGames.PublicGameWithLiveStats; createdAt: string }[];
        }>;
        setFavorite(args: SetFavoriteArgs, options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getFavorites(
            args: GetFavoritesArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            type: ContentServiceFavorites.FavoritesType;
            data: { resourceId: string; resource: ContentServiceGames.PublicGameWithLiveStats; createdAt: string }[];
        }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Favorites:getFavorites",
                path: `/favorites/${encodeURIComponent(args.favorites_type)}/`,
                retryKey: options?.retryKey ?? "ContentService:Favorites:getFavorites",
            });
        }
        async setFavorite(args: SetFavoriteArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Favorites:setFavorite",
                path: `/favorites/${encodeURIComponent(args.params.favorites_type)}/`,
                retryKey: options?.retryKey ?? "ContentService:Favorites:setFavorite",
                body: args.data,
            });
        }
    }
}

// ====+==== Games Types ====+====
export namespace ContentServiceGames {
    export interface AutocompleteDto {
        name: string;
        showHidden?: boolean;
        limit?: number;
        platform?: InternalContentServiceTypes.DeploymentPlatform;
    }

    export type AutocompleteGameArgs = {
        query: ContentServiceGames.AutocompleteDto;
    };

    export interface AutocompleteSearchGame
        extends Pick<
                ContentServiceGames.PublicGame,
                | "id"
                | "name"
                | "iconImageId"
                | "organizationId"
                | "plays"
                | "favorites"
                | "plays24h"
                | "uniquePlays24h"
                | "platforms"
            >,
            ContentServiceGames.WithLiveStats {
        lastVersionUpdate: string;
        organization?: Pick<ContentServiceDatabaseTypes.Organization, "name" | "iconImageId">;
    }

    export type CreateGameArgs = {
        data: ContentServiceGames.CreateGameDto;
    };

    export interface CreateGameDto {
        name: string;
        organizationId: string;
        visibility?: ContentServiceDatabaseTypes.GameVisibility;
    }

    export interface GameLink {
        type: ContentServiceGames.GameLinkType;
        url: string;
    }

    export interface GameLinkDto {
        type: ContentServiceGames.GameLinkType;
        url: string;
    }

    export const GameLinkType = {
        DISCORD: "DISCORD",
    } as const;
    export type GameLinkType = (typeof GameLinkType)[keyof typeof GameLinkType];

    export interface GameSortsDto {
        showHidden?: boolean;
        platform?: InternalContentServiceTypes.DeploymentPlatform;
    }

    export type GetGameByIdArgs = {
        params: {
            id: string;
        };
        query?: {
            liveStats?: string;
        };
    };

    export type GetGameBySlugArgs = {
        params: {
            slug: string;
        };
        query?: {
            liveStats?: string;
        };
    };

    export type GetGameSortsArgs = {
        query?: ContentServiceGames.GameSortsDto;
    };

    export type GetSignedGameImageArgs = {
        params: {
            id: string;
            namespace: ContentServiceImages.ImageNamespace;
        };
        query: ContentServiceGames.UploadImageQuery;
    };

    export type PatchGameArgs = {
        params: {
            id: string;
        };
        data: ContentServiceGames.PatchGameDto;
    };

    export interface PatchGameDto {
        name?: string;
        slugProperCase?: string;
        description?: string;
        iconImageId?: string;
        loadingScreenImageId?: string | undefined;
        logoImageId?: string | undefined;
        videoId?: string | undefined;
        links?: ContentServiceGames.GameLinkDto[] | undefined;
        visibility?: ContentServiceDatabaseTypes.GameVisibility;
        archived?: boolean;
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
        visibility: ContentServiceDatabaseTypes.GameVisibility;
        lastVersionUpdate: string | undefined;
        archivedAt: string | undefined;
        loadingScreenImageId: string | undefined;
        logoImageId: string | undefined;
        videoId: string | undefined;
        links: ContentServiceGames.GameLink[] | undefined;
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        platforms: InternalContentServiceTypes.DeploymentPlatform[];
        liveStats?: { playerCount: number };
        organization?: ContentServiceDatabaseTypes.Organization;
    }

    export type PublicGameWithLiveStats = ContentServiceGames.PublicGame & ContentServiceGames.WithLiveStats;

    export type PublicGameWithLiveStatsAndOrg = ContentServiceGames.PublicGame &
        ContentServiceGames.WithLiveStats &
        ContentServiceGames.WithOrg;

    export type PublicGameWithOrg = ContentServiceGames.PublicGame & ContentServiceGames.WithOrg;

    export interface UploadImageQuery {
        contentType: string;
        contentLength: number;
        name?: string;
        description?: string;
    }

    export interface WithLiveStats {
        liveStats: { playerCount: number };
    }

    export interface WithOrg {
        organization: ContentServiceDatabaseTypes.Organization;
    }

    export interface ClientSpec {
        autocompleteGame(
            args: AutocompleteGameArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceGames.AutocompleteSearchGame[]>;
        createGame(
            args: CreateGameArgs["data"],
            options?: RequestOptions,
        ): Promise<{ game: ContentServiceGames.PublicGameWithOrg }>;
        getGameById(
            args: GetGameByIdArgs,
            options?: RequestOptions,
        ): Promise<{ game: ContentServiceGames.PublicGameWithOrg | undefined }>;
        getGameBySlug(
            args: GetGameBySlugArgs,
            options?: RequestOptions,
        ): Promise<{
            game: ContentServiceGames.PublicGameWithOrg | ContentServiceGames.PublicGameWithLiveStatsAndOrg | undefined;
        }>;
        getGameSorts(
            args?: GetGameSortsArgs["query"],
            options?: RequestOptions,
        ): Promise<{
            popular: ContentServiceGames.PublicGameWithLiveStatsAndOrg[];
            featured: ContentServiceGames.PublicGameWithLiveStatsAndOrg[];
            recentlyUpdated: ContentServiceGames.PublicGameWithLiveStatsAndOrg[];
        }>;
        getSignedGameImage(
            args: GetSignedGameImageArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl>;
        patchGame(
            args: PatchGameArgs,
            options?: RequestOptions,
        ): Promise<{ game: ContentServiceGames.PublicGameWithOrg }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async autocompleteGame(
            args: AutocompleteGameArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceGames.AutocompleteSearchGame[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Games:autocompleteGame",
                path: `/games/autocomplete`,
                retryKey: options?.retryKey ?? "ContentService:Games:autocompleteGame",
                query: args,
            });
        }
        async createGame(
            args: CreateGameArgs["data"],
            options?: RequestOptions,
        ): Promise<{ game: ContentServiceGames.PublicGameWithOrg }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Games:createGame",
                path: `/games/`,
                retryKey: options?.retryKey ?? "ContentService:Games:createGame",
                body: args,
            });
        }
        async getGameById(
            args: GetGameByIdArgs,
            options?: RequestOptions,
        ): Promise<{ game: ContentServiceGames.PublicGameWithOrg | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Games:getGameById",
                path: `/games/game-id/${encodeURIComponent(args.params.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Games:getGameById",
                query: args.query,
            });
        }
        async getGameBySlug(
            args: GetGameBySlugArgs,
            options?: RequestOptions,
        ): Promise<{
            game: ContentServiceGames.PublicGameWithOrg | ContentServiceGames.PublicGameWithLiveStatsAndOrg | undefined;
        }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Games:getGameBySlug",
                path: `/games/slug/${encodeURIComponent(args.params.slug)}`,
                retryKey: options?.retryKey ?? "ContentService:Games:getGameBySlug",
                query: args.query,
            });
        }
        async getGameSorts(
            args?: GetGameSortsArgs["query"],
            options?: RequestOptions,
        ): Promise<{
            popular: ContentServiceGames.PublicGameWithLiveStatsAndOrg[];
            featured: ContentServiceGames.PublicGameWithLiveStatsAndOrg[];
            recentlyUpdated: ContentServiceGames.PublicGameWithLiveStatsAndOrg[];
        }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Games:getGameSorts",
                path: `/games/`,
                retryKey: options?.retryKey ?? "ContentService:Games:getGameSorts",
                query: args,
            });
        }
        async getSignedGameImage(
            args: GetSignedGameImageArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Games:getSignedGameImage",
                path: `/games/game-id/${encodeURIComponent(args.params.id)}/namespace/${encodeURIComponent(args.params.namespace)}/signed-url`,
                retryKey: options?.retryKey ?? "ContentService:Games:getSignedGameImage",
                query: args.query,
            });
        }
        async patchGame(
            args: PatchGameArgs,
            options?: RequestOptions,
        ): Promise<{ game: ContentServiceGames.PublicGameWithOrg }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "ContentService:Games:patchGame",
                path: `/games/game-id/${encodeURIComponent(args.params.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Games:patchGame",
                body: args.data,
            });
        }
    }
}

// ====+==== Gear Types ====+====
export namespace ContentServiceGear {
    export type GetGearArgs = {
        params: {
            resourceId: string;
        };
    };

    export type GetGearFromClassIdArgs = {
        params: {
            classId: string;
        };
    };

    export type GetUserGearArgs = {
        query?: ContentServiceItems.GetItemsDto;
    };

    export type GetUserGearForResourceArgs = {
        params: {
            uid: string;
        };
        query?: ContentServiceItems.GetItemsDto;
    };

    export interface SelectedGear extends ContentServiceItemClasses.SelectedItemClass {
        gear: { airAssets: string[]; category: string; subcategory: string | undefined };
    }

    export interface SelectedGearItem extends ContentServiceItems.SelectedItem {
        class: ContentServiceGear.SelectedGear;
    }

    export interface ClientSpec {
        getGear(args: GetGearArgs["params"], options?: RequestOptions): Promise<ContentServiceGear.SelectedGear[]>;
        getGearFromClassId(
            args: GetGearFromClassIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ gear: ContentServiceGear.SelectedGear | undefined }>;
        getUserGear(
            args?: GetUserGearArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceGear.SelectedGearItem[]>;
        getUserGearForResource(
            args: GetUserGearForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceGear.SelectedGearItem[]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getGear(
            args: GetGearArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceGear.SelectedGear[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Gear:getGear",
                path: `/gear/resource-id/${encodeURIComponent(args.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:Gear:getGear",
            });
        }
        async getGearFromClassId(
            args: GetGearFromClassIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ gear: ContentServiceGear.SelectedGear | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Gear:getGearFromClassId",
                path: `/gear/class-id/${encodeURIComponent(args.classId)}`,
                retryKey: options?.retryKey ?? "ContentService:Gear:getGearFromClassId",
            });
        }
        async getUserGear(
            args?: GetUserGearArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceGear.SelectedGearItem[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Gear:getUserGear",
                path: `/gear/self`,
                retryKey: options?.retryKey ?? "ContentService:Gear:getUserGear",
                query: args,
            });
        }
        async getUserGearForResource(
            args: GetUserGearForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceGear.SelectedGearItem[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Gear:getUserGearForResource",
                path: `/gear/uid/${encodeURIComponent(args.params.uid)}`,
                retryKey: options?.retryKey ?? "ContentService:Gear:getUserGearForResource",
                query: args.query,
            });
        }
    }
}

// ====+==== Images Types ====+====
export namespace ContentServiceImages {
    export type CreateImageArgs = {
        data: ContentServiceImages.CreateImageBody;
    };

    export interface CreateImageBody {
        ownerId?: string;
        ownerType?: ContentServiceDatabaseTypes.ImageOwnerType;
        resourceId?: string;
        namespace: ContentServiceImages.ImageNamespace;
        contentType: string;
        contentLength: number;
        name?: string;
        description?: string;
    }

    export type GetImagesForResourceArgs = {
        params: {
            resourceType: string;
            resourceId: string;
            namespace: string;
        };
    };

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

    export interface PublicImageResource {
        imageId: string;
        name: string | undefined;
        description: string | undefined;
        size: number;
        createdAt: string;
    }

    export type ScheduleDeleteImageArgs = {
        data: ContentServiceImages.ScheduleDeletionBody;
    };

    export interface ScheduleDeletionBody {
        imageId: string;
        scheduleTime: string;
    }

    export interface SignedImageUrl extends ContentServiceImages.PublicImageResource {
        url: string;
    }

    export interface ClientSpec {
        createImage(
            args: CreateImageArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl>;
        getImagesForResource(
            args: GetImagesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<{ images: ContentServiceImages.PublicImageResource[] }>;
        scheduleDeleteImage(args: ScheduleDeleteImageArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createImage(
            args: CreateImageArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Images:createImage",
                path: `/images/`,
                retryKey: options?.retryKey ?? "ContentService:Images:createImage",
                body: args,
            });
        }
        async getImagesForResource(
            args: GetImagesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<{ images: ContentServiceImages.PublicImageResource[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Images:getImagesForResource",
                path: `/images/resource-type/${encodeURIComponent(args.resourceType)}/resource-id/${encodeURIComponent(args.resourceId)}/namespace/${encodeURIComponent(args.namespace)}`,
                retryKey: options?.retryKey ?? "ContentService:Images:getImagesForResource",
            });
        }
        async scheduleDeleteImage(args: ScheduleDeleteImageArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Images:scheduleDeleteImage",
                path: `/images/schedule-delete`,
                retryKey: options?.retryKey ?? "ContentService:Images:scheduleDeleteImage",
                body: args,
            });
        }
    }
}

// ====+==== ItemClasses Types ====+====
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
        data: ContentServiceItemClasses.CreateItemClassDto;
        params: {
            resourceId: string;
        };
    };

    export type GetItemClassesForResourceArgs = {
        params: {
            resourceId: string;
        };
    };

    export interface SelectedItemClass {
        resourceType: ContentServiceDatabaseTypes.ResourceType;
        resourceId: string;
        classId: string;
        name: string;
        imageId: string;
        tags: string[];
        description: string;
        default: boolean;
        tradable: { permitted: boolean };
        marketable: { permitted: boolean };
        archivedAt: string | undefined;
        gear: Partial<ContentServiceDatabaseTypes.Gear> | undefined | undefined;
    }

    export type UpdateClassForResourceArgs = {
        data: ContentServiceItemClasses.UpdateItemClassDto;
        params: {
            classId: string;
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

    export type UploadItemImageForResourceArgs = {
        query: {
            contentType: string;
            contentLength: string;
        };
        params: {
            resourceId: string;
        };
    };

    export interface ClientSpec {
        createItemClassForResource(
            args: CreateItemClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItemClasses.SelectedItemClass>;
        getItemClassesForResource(
            args: GetItemClassesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItemClasses.SelectedItemClass[]>;
        updateClassForResource(
            args: UpdateClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItemClasses.SelectedItemClass>;
        uploadItemImageForResource(
            args: UploadItemImageForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createItemClassForResource(
            args: CreateItemClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItemClasses.SelectedItemClass> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:ItemClasses:createItemClassForResource",
                path: `/item-classes/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:ItemClasses:createItemClassForResource",
                body: args.data,
            });
        }
        async getItemClassesForResource(
            args: GetItemClassesForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItemClasses.SelectedItemClass[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ItemClasses:getItemClassesForResource",
                path: `/item-classes/resource-id/${encodeURIComponent(args.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:ItemClasses:getItemClassesForResource",
            });
        }
        async updateClassForResource(
            args: UpdateClassForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItemClasses.SelectedItemClass> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "ContentService:ItemClasses:updateClassForResource",
                path: `/item-classes/class-id/${encodeURIComponent(args.params.classId)}`,
                retryKey: options?.retryKey ?? "ContentService:ItemClasses:updateClassForResource",
                body: args.data,
            });
        }
        async uploadItemImageForResource(
            args: UploadItemImageForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ItemClasses:uploadItemImageForResource",
                path: `/item-classes/images/resource-id/${encodeURIComponent(args.params.resourceId)}/signed-url`,
                retryKey: options?.retryKey ?? "ContentService:ItemClasses:uploadItemImageForResource",
                query: args.query,
            });
        }
    }
}

// ====+==== Items Types ====+====
export namespace ContentServiceItems {
    export type DeleteItemForResourceArgs = {
        params: {
            itemId: string;
        };
    };

    export type GetItemByInstanceIdArgs = {
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
        query?: ContentServiceItems.GetItemsDto;
    };

    export type GetUserInventoryForResourceArgs = {
        params: {
            uid: string;
        };
        query?: ContentServiceItems.GetItemsDto;
    };

    export type GrantItemForResourceArgs = {
        params: {
            uid: string;
            classId: string;
        };
        query?: {
            ignoreIfHasInstance?: boolean;
        };
    };

    export interface OwnershipValidationResult {
        valid: boolean;
        results: { instanceId: string; valid: boolean; className?: string }[];
    }

    export interface SelectedItem {
        class: ContentServiceItemClasses.SelectedItemClass;
        ownerId: string;
        instanceId: string;
        float: number;
        createdAt: string;
    }

    export interface ClientSpec {
        deleteItemForResource(
            args: DeleteItemForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem>;
        getItemByInstanceId(
            args: GetItemByInstanceIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ item: ContentServiceItems.SelectedItem | undefined }>;
        getUserInventory(
            args?: GetUserInventoryArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem[]>;
        getUserInventoryForResource(
            args: GetUserInventoryForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem[]>;
        grantItemForResource(
            args: GrantItemForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async deleteItemForResource(
            args: DeleteItemForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ContentService:Items:deleteItemForResource",
                path: `/items/item-id/${encodeURIComponent(args.itemId)}`,
                retryKey: options?.retryKey ?? "ContentService:Items:deleteItemForResource",
            });
        }
        async getItemByInstanceId(
            args: GetItemByInstanceIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ item: ContentServiceItems.SelectedItem | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Items:getItemByInstanceId",
                path: `/items/item-id/${encodeURIComponent(args.itemId)}`,
                retryKey: options?.retryKey ?? "ContentService:Items:getItemByInstanceId",
            });
        }
        async getUserInventory(
            args?: GetUserInventoryArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Items:getUserInventory",
                path: `/items/self`,
                retryKey: options?.retryKey ?? "ContentService:Items:getUserInventory",
                query: args,
            });
        }
        async getUserInventoryForResource(
            args: GetUserInventoryForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Items:getUserInventoryForResource",
                path: `/items/uid/${encodeURIComponent(args.params.uid)}`,
                retryKey: options?.retryKey ?? "ContentService:Items:getUserInventoryForResource",
                query: args.query,
            });
        }
        async grantItemForResource(
            args: GrantItemForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItems.SelectedItem> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Items:grantItemForResource",
                path: `/items/uid/${encodeURIComponent(args.params.uid)}/class-id/${encodeURIComponent(args.params.classId)}`,
                retryKey: options?.retryKey ?? "ContentService:Items:grantItemForResource",
                query: args.query,
            });
        }
    }
}

// ====+==== ItemTags Types ====+====
export namespace ContentServiceItemTags {
    export interface CreateTagDto {
        tagName: string;
    }

    export type CreateTagForResourceArgs = {
        data: ContentServiceItemTags.CreateTagDto;
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

    export type GetItemTagsForResourceArgs = {
        params: {
            resourceId: string;
        };
    };

    export interface SelectedItemTag {
        resourceType: ContentServiceDatabaseTypes.ResourceType;
        resourceId: string;
        name: string;
        nameLower: string;
        createdAt: string;
    }

    export interface ClientSpec {
        createTagForResource(
            args: CreateTagForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItemTags.SelectedItemTag>;
        deleteTagForResource(
            args: DeleteTagForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItemTags.SelectedItemTag>;
        getItemTagsForResource(
            args: GetItemTagsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItemTags.SelectedItemTag[]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createTagForResource(
            args: CreateTagForResourceArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceItemTags.SelectedItemTag> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "ContentService:ItemTags:createTagForResource",
                path: `/item-tags/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:ItemTags:createTagForResource",
                body: args.data,
            });
        }
        async deleteTagForResource(
            args: DeleteTagForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItemTags.SelectedItemTag> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ContentService:ItemTags:deleteTagForResource",
                path: `/item-tags/resource-id/${encodeURIComponent(args.resourceId)}/tag-name/${encodeURIComponent(args.tagName)}`,
                retryKey: options?.retryKey ?? "ContentService:ItemTags:deleteTagForResource",
            });
        }
        async getItemTagsForResource(
            args: GetItemTagsForResourceArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceItemTags.SelectedItemTag[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ItemTags:getItemTagsForResource",
                path: `/item-tags/resource-id/${encodeURIComponent(args.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:ItemTags:getItemTagsForResource",
            });
        }
    }
}

// ====+==== ItemTransactions Types ====+====
export namespace ContentServiceItemTransactions {
    export interface ServiceBrokeredTradeDto {
        leftTradeHalf: ContentServiceItemTransactions.ValidatedTradeHalf;
        rightTradeHalf: ContentServiceItemTransactions.ValidatedTradeHalf;
    }

    export type TradeArgs = {
        data: ContentServiceItemTransactions.ServiceBrokeredTradeDto;
    };

    export interface ValidatedTradeHalf {
        uid: string;
        itemInstanceIds?: string[];
    }

    export interface ClientSpec {
        trade(args: TradeArgs["data"], options?: RequestOptions): Promise<ContentServiceDatabaseTypes.Transaction>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async trade(
            args: TradeArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Transaction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:ItemTransactions:trade",
                path: `/transactions/trade`,
                retryKey: options?.retryKey ?? "ContentService:ItemTransactions:trade",
                body: args,
            });
        }
    }
}

// ====+==== Memberships Types ====+====
export namespace ContentServiceMemberships {
    export type GetMembershipForGameArgs = {
        params: {
            userId: string;
        };
    };

    export type GetUserGameOwnershipArgs<T extends boolean> = {
        query?: {
            liveStats?: T;
        };
    };

    export type GetUserMembershipsArgs = {
        query?: {
            includeInactive?: boolean;
        };
    };

    export type MemberWithOrg = ContentServiceDatabaseTypes.Member & ContentServiceGames.WithOrg;

    export type MemberWithOrgAndRole = ContentServiceMemberships.MemberWithOrg & ContentServiceMemberships.WithRole;

    export interface WithRole {
        role: ContentServiceOrganizationRoles.PublicOrganizationRole;
    }

    export interface ClientSpec {
        getMembershipForGame(
            args: GetMembershipForGameArgs["params"],
            options?: RequestOptions,
        ): Promise<{ isMember: boolean; membershipData: ContentServiceDatabaseTypes.Member | false }>;
        getUserGameOwnership<T extends boolean>(
            args?: GetUserGameOwnershipArgs<T>["query"],
            options?: RequestOptions,
        ): Promise<
            T extends true
                ? ContentServiceGames.PublicGameWithLiveStatsAndOrg[]
                : ContentServiceGames.PublicGameWithOrg[]
        >;
        getUserMemberships(
            args?: GetUserMembershipsArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceMemberships.MemberWithOrgAndRole[]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getMembershipForGame(
            args: GetMembershipForGameArgs["params"],
            options?: RequestOptions,
        ): Promise<{ isMember: boolean; membershipData: ContentServiceDatabaseTypes.Member | false }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Memberships:getMembershipForGame",
                path: `/memberships/game-organization/user-id/${encodeURIComponent(args.userId)}`,
                retryKey: options?.retryKey ?? "ContentService:Memberships:getMembershipForGame",
            });
        }
        async getUserGameOwnership<T extends boolean>(
            args?: GetUserGameOwnershipArgs<T>["query"],
            options?: RequestOptions,
        ): Promise<
            T extends true
                ? ContentServiceGames.PublicGameWithLiveStatsAndOrg[]
                : ContentServiceGames.PublicGameWithOrg[]
        > {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Memberships:getUserGameOwnership",
                path: `/memberships/games/self`,
                retryKey: options?.retryKey ?? "ContentService:Memberships:getUserGameOwnership",
                query: args,
            });
        }
        async getUserMemberships(
            args?: GetUserMembershipsArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceMemberships.MemberWithOrgAndRole[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Memberships:getUserMemberships",
                path: `/memberships/organizations/self`,
                retryKey: options?.retryKey ?? "ContentService:Memberships:getUserMemberships",
                query: args,
            });
        }
    }
}

// ====+==== OrganizationRoles Types ====+====
export namespace ContentServiceOrganizationRoles {
    export type CreateRoleArgs = {
        params: {
            orgId: string;
        };
        data: ContentServiceOrganizationRoles.CreateRoleDto;
    };

    export interface CreateRoleDto {
        name: string;
        permissionsData: ContentServicePermissions.OrganizationRolePermissionsDto;
    }

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
        query?: {
            includeInactiveMembers?: any;
        };
    };

    export interface OrganizationRolePermissionsData {
        permissions: ContentServicePermissions.PermissionEntry;
        schemaVersion: 0;
    }

    export type PublicOrganizationRole = InternalContentServiceTypes.Override<
        ContentServiceDatabaseTypes.OrganizationRole,
        { permissionsData: ContentServiceOrganizationRoles.OrganizationRolePermissionsData }
    >;

    export type PublicOrganizationRoleWithMembers = ContentServiceOrganizationRoles.PublicOrganizationRole & {
        members: { uid: string }[];
    };

    export type UpdateRoleArgs = {
        params: {
            roleName: string;
            orgId: string;
        };
        data: ContentServiceOrganizationRoles.UpdateRoleDto;
    };

    export interface UpdateRoleDto {
        name: string;
        permissionsData: ContentServicePermissions.OrganizationRolePermissionsDto;
    }

    export interface ClientSpec {
        createRole(
            args: CreateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServiceOrganizationRoles.PublicOrganizationRole }>;
        deleteRole(
            args: DeleteRoleArgs["params"],
            options?: RequestOptions,
        ): Promise<{ role: ContentServiceOrganizationRoles.PublicOrganizationRole | undefined }>;
        getRoles(
            args: GetRolesArgs,
            options?: RequestOptions,
        ): Promise<{ roles: ContentServiceOrganizationRoles.PublicOrganizationRoleWithMembers[] }>;
        updateRole(
            args: UpdateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServiceOrganizationRoles.PublicOrganizationRole }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createRole(
            args: CreateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServiceOrganizationRoles.PublicOrganizationRole }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:OrganizationRoles:createRole",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}/create`,
                retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:createRole",
                body: args.data,
            });
        }
        async deleteRole(
            args: DeleteRoleArgs["params"],
            options?: RequestOptions,
        ): Promise<{ role: ContentServiceOrganizationRoles.PublicOrganizationRole | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ContentService:OrganizationRoles:deleteRole",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.orgId)}/role-name/${encodeURIComponent(args.roleName)}`,
                retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:deleteRole",
            });
        }
        async getRoles(
            args: GetRolesArgs,
            options?: RequestOptions,
        ): Promise<{ roles: ContentServiceOrganizationRoles.PublicOrganizationRoleWithMembers[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:OrganizationRoles:getRoles",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}`,
                retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:getRoles",
                query: args.query,
            });
        }
        async updateRole(
            args: UpdateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ role: ContentServiceOrganizationRoles.PublicOrganizationRole }> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "ContentService:OrganizationRoles:updateRole",
                path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}/role-name/${encodeURIComponent(args.params.roleName)}`,
                retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:updateRole",
                body: args.data,
            });
        }
    }
}

// ====+==== Organizations Types ====+====
export namespace ContentServiceOrganizations {
    export interface AddMemberDto {
        memberUsername: string;
        roleName: string;
    }

    export interface AugmentedMember extends ContentServiceDatabaseTypes.Member {
        username?: string;
        usernameLower?: string;
    }

    export type CreateOrganizationArgs = {
        data: ContentServiceOrganizations.CreateOrganizationDto;
    };

    export interface CreateOrganizationDto {
        slugProperCase: string;
        name: string;
    }

    export type DeleteMemberArgs = {
        params: {
            id: string;
            uid: string;
        };
    };

    export type GetOrganizationByIdArgs = {
        params: {
            id: string;
        };
    };

    export type GetOrganizationBySlugArgs = {
        params: {
            slug: string;
        };
        query?: {
            includeInactiveMembers?: boolean;
        };
    };

    export type GetPublicOrganizationBySlugArgs = {
        params: {
            slug: string;
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

    export interface OrganizationView extends ContentServiceDatabaseTypes.Organization {
        games: ContentServiceDatabaseTypes.Game[];
        packages: ContentServiceDatabaseTypes.Package[];
        members: ContentServiceOrganizations.AugmentedMember[];
    }

    export type PatchOrganizationArgs = {
        params: {
            id: string;
        };
        data: ContentServiceOrganizations.PatchOrganizationDto;
    };

    export interface PatchOrganizationDto {
        name?: string;
        description?: string;
        iconImageId?: string;
    }

    export interface PublicOrganization {
        name: string;
        id: string;
        slug: string;
        slugProperCase: string;
        description: string;
        iconImageId: string;
        createdAt: string;
        games?: ContentServiceGames.PublicGame[];
    }

    export type PutMemberArgs = {
        data: ContentServiceOrganizations.AddMemberDto;
        params: {
            id: string;
        };
    };

    export type RecognizeMemberInviteArgs = {
        params: {
            id: string;
        };
        query: {
            acceptInvite: boolean;
        };
    };

    export interface WithPublicGames {
        games: ContentServiceGames.PublicGame[];
    }

    export interface ClientSpec {
        createOrganization(
            args: CreateOrganizationArgs["data"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceDatabaseTypes.Organization | undefined }>;
        deleteMember(
            args: DeleteMemberArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceOrganizations.AugmentedMember[]>;
        getOrganizationById(
            args: GetOrganizationByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceDatabaseTypes.Organization | undefined }>;
        getOrganizationBySlug(
            args: GetOrganizationBySlugArgs,
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceOrganizations.OrganizationView }>;
        getPublicOrganizationBySlug(
            args: GetPublicOrganizationBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            organization:
                | (ContentServiceOrganizations.PublicOrganization & ContentServiceOrganizations.WithPublicGames)
                | undefined;
        }>;
        getSignedOrgImage(
            args: GetSignedOrgImageArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl>;
        patchOrganization(
            args: PatchOrganizationArgs,
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceDatabaseTypes.Organization }>;
        putMember(
            args: PutMemberArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceOrganizations.AugmentedMember[]>;
        recognizeMemberInvite(
            args: RecognizeMemberInviteArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Member>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createOrganization(
            args: CreateOrganizationArgs["data"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceDatabaseTypes.Organization | undefined }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Organizations:createOrganization",
                path: `/organizations/`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:createOrganization",
                body: args,
            });
        }
        async deleteMember(
            args: DeleteMemberArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceOrganizations.AugmentedMember[]> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ContentService:Organizations:deleteMember",
                path: `/organizations/organization-id/${encodeURIComponent(args.id)}/member-uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:deleteMember",
            });
        }
        async getOrganizationById(
            args: GetOrganizationByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceDatabaseTypes.Organization | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Organizations:getOrganizationById",
                path: `/organizations/organization-id/${encodeURIComponent(args.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:getOrganizationById",
            });
        }
        async getOrganizationBySlug(
            args: GetOrganizationBySlugArgs,
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceOrganizations.OrganizationView }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Organizations:getOrganizationBySlug",
                path: `/organizations/slug/${encodeURIComponent(args.params.slug)}`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:getOrganizationBySlug",
                query: args.query,
            });
        }
        async getPublicOrganizationBySlug(
            args: GetPublicOrganizationBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            organization:
                | (ContentServiceOrganizations.PublicOrganization & ContentServiceOrganizations.WithPublicGames)
                | undefined;
        }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Organizations:getPublicOrganizationBySlug",
                path: `/organizations/slug/${encodeURIComponent(args.slug)}/public`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:getPublicOrganizationBySlug",
            });
        }
        async getSignedOrgImage(
            args: GetSignedOrgImageArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Organizations:getSignedOrgImage",
                path: `/organizations/thumbnails/organization-id/${encodeURIComponent(args.params.id)}/signed-url`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:getSignedOrgImage",
                query: args.query,
            });
        }
        async patchOrganization(
            args: PatchOrganizationArgs,
            options?: RequestOptions,
        ): Promise<{ organization: ContentServiceDatabaseTypes.Organization }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "ContentService:Organizations:patchOrganization",
                path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:patchOrganization",
                body: args.data,
            });
        }
        async putMember(
            args: PutMemberArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceOrganizations.AugmentedMember[]> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "ContentService:Organizations:putMember",
                path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}/member`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:putMember",
                body: args.data,
            });
        }
        async recognizeMemberInvite(
            args: RecognizeMemberInviteArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Member> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Organizations:recognizeMemberInvite",
                path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}/member-invite`,
                retryKey: options?.retryKey ?? "ContentService:Organizations:recognizeMemberInvite",
                query: args.query,
            });
        }
    }
}

// ====+==== Outfits Types ====+====
export namespace ContentServiceOutfits {
    export type CreateOutfitArgs = {
        data: ContentServiceOutfits.CreateOutfitDto;
    };

    export interface CreateOutfitDto {
        name: string;
        gear?: string[];
        skinColor: string;
        metadata?: object | undefined;
    }

    export type GetOutfitArgs = {
        params: {
            outfitId: string;
        };
    };

    export type GetUserActiveOutfitArgs = {
        params: {
            uid: string;
        };
    };

    export type LoadOutfitArgs = {
        params: {
            outfitId: string;
        };
    };

    export interface SelectedOutfit {
        outfitId: string;
        name: string;
        skinColor: string;
        gear: ContentServiceGear.SelectedGearItem[];
        metadata: unknown | undefined;
        equipped: boolean;
        createdAt: string;
    }

    export type UpdateOutfitArgs = {
        params: {
            outfitId: string;
        };
        data: ContentServiceOutfits.UpdateOutfitDto;
    };

    export interface UpdateOutfitDto {
        name?: string;
        gear?: string[];
        skinColor?: string;
        metadata?: object | undefined;
    }

    export interface ClientSpec {
        createOutfit(
            args: CreateOutfitArgs["data"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit }>;
        getActiveOutfit(
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit | undefined }>;
        getOutfit(
            args: GetOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit | undefined }>;
        getOutfits(options?: RequestOptions): Promise<ContentServiceOutfits.SelectedOutfit[]>;
        getUserActiveOutfit(
            args: GetUserActiveOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit | undefined }>;
        loadOutfit(
            args: LoadOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit }>;
        updateOutfit(
            args: UpdateOutfitArgs,
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createOutfit(
            args: CreateOutfitArgs["data"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Outfits:createOutfit",
                path: `/outfits/`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:createOutfit",
                body: args,
            });
        }
        async getActiveOutfit(
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Outfits:getActiveOutfit",
                path: `/outfits/equipped/self`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:getActiveOutfit",
            });
        }
        async getOutfit(
            args: GetOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Outfits:getOutfit",
                path: `/outfits/outfit-id/${encodeURIComponent(args.outfitId)}`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:getOutfit",
            });
        }
        async getOutfits(options?: RequestOptions): Promise<ContentServiceOutfits.SelectedOutfit[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Outfits:getOutfits",
                path: `/outfits/`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:getOutfits",
            });
        }
        async getUserActiveOutfit(
            args: GetUserActiveOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Outfits:getUserActiveOutfit",
                path: `/outfits/uid/${encodeURIComponent(args.uid)}/equipped`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:getUserActiveOutfit",
            });
        }
        async loadOutfit(
            args: LoadOutfitArgs["params"],
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Outfits:loadOutfit",
                path: `/outfits/outfit-id/${encodeURIComponent(args.outfitId)}/equip`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:loadOutfit",
            });
        }
        async updateOutfit(
            args: UpdateOutfitArgs,
            options?: RequestOptions,
        ): Promise<{ outfit: ContentServiceOutfits.SelectedOutfit }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "ContentService:Outfits:updateOutfit",
                path: `/outfits/outfit-id/${encodeURIComponent(args.params.outfitId)}`,
                retryKey: options?.retryKey ?? "ContentService:Outfits:updateOutfit",
                body: args.data,
            });
        }
    }
}

// ====+==== Packages Types ====+====
export namespace ContentServicePackages {
    export type CreatePackageArgs = {
        data: ContentServicePackages.CreatePackageDto;
    };

    export interface CreatePackageDto {
        name: string;
        slugProperCase: string;
        organizationId: string;
    }

    export type GetPackageByIdArgs = {
        params: {
            id: string;
        };
    };

    export type GetPackageBySlugArgs = {
        params: {
            orgSlug: string;
            packageSlug: string;
        };
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

    export interface PackageWithOrg extends ContentServiceDatabaseTypes.Package {
        organization: ContentServiceDatabaseTypes.Organization;
    }

    export type PatchPackageArgs = {
        params: {
            id: string;
        };
        data: ContentServicePackages.PatchPackageDto;
    };

    export interface PatchPackageDto {
        name?: string;
        description?: string;
        iconImageId?: string;
        archived?: boolean;
    }

    export interface ClientSpec {
        createPackage(
            args: CreatePackageArgs["data"],
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }>;
        getPackageById(
            args: GetPackageByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }>;
        getPackageBySlug(
            args: GetPackageBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }>;
        getSignedPackageImage(
            args: GetSignedPackageImageArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl>;
        patchPackage(
            args: PatchPackageArgs,
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createPackage(
            args: CreatePackageArgs["data"],
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Packages:createPackage",
                path: `/packages/`,
                retryKey: options?.retryKey ?? "ContentService:Packages:createPackage",
                body: args,
            });
        }
        async getPackageById(
            args: GetPackageByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Packages:getPackageById",
                path: `/packages/package-id/${encodeURIComponent(args.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Packages:getPackageById",
            });
        }
        async getPackageBySlug(
            args: GetPackageBySlugArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Packages:getPackageBySlug",
                path: `/packages/slug/${encodeURIComponent(args.orgSlug)}/${encodeURIComponent(args.packageSlug)}`,
                retryKey: options?.retryKey ?? "ContentService:Packages:getPackageBySlug",
            });
        }
        async getSignedPackageImage(
            args: GetSignedPackageImageArgs,
            options?: RequestOptions,
        ): Promise<ContentServiceImages.SignedImageUrl> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Packages:getSignedPackageImage",
                path: `/packages/thumbnails/package-id/${encodeURIComponent(args.params.id)}/signed-url`,
                retryKey: options?.retryKey ?? "ContentService:Packages:getSignedPackageImage",
                query: args.query,
            });
        }
        async patchPackage(
            args: PatchPackageArgs,
            options?: RequestOptions,
        ): Promise<{ pkg: ContentServicePackages.PackageWithOrg }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "ContentService:Packages:patchPackage",
                path: `/packages/package-id/${encodeURIComponent(args.params.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Packages:patchPackage",
                body: args.data,
            });
        }
    }
}

// ====+==== Payments Types ====+====
export namespace ContentServicePayments {
    export type CreatePaymentArgs = {
        data: ContentServicePayments.CreateXsollaPaymentDto;
    };

    export interface CreateSteamPayment {
        steamId: string;
        languageCode: string;
        productId: ContentServicePayments.StandardSku;
    }

    export interface CreateXsollaPaymentDto {
        username: string;
        productId: ContentServicePayments.StandardSku;
    }

    export type ExecuteSteamPurchaseArgs = {
        params: {
            orderId: string;
        };
    };

    export type InitSteamPurchaseArgs = {
        data: ContentServicePayments.CreateSteamPayment;
    };

    export const StandardSku = {
        CREDITS_10000: "10000-credits",
        CREDITS_20000: "20000-credits",
        CREDITS_50000: "50000-credits",
        CREDITS_100000: "100000-credits",
    } as const;
    export type StandardSku = (typeof StandardSku)[keyof typeof StandardSku];

    export interface XsollaPaymentData {
        token: string;
        order_id: string;
    }

    export type XsollaWebhookArgs = {
        data: unknown;
    };

    export interface ClientSpec {
        createPayment(
            args: CreatePaymentArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePayments.XsollaPaymentData>;
        executeSteamPurchase(args: ExecuteSteamPurchaseArgs["params"], options?: RequestOptions): Promise<void>;
        initSteamPurchase(args: InitSteamPurchaseArgs["data"], options?: RequestOptions): Promise<void>;
        xsollaWebhook(args: XsollaWebhookArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createPayment(
            args: CreatePaymentArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePayments.XsollaPaymentData> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Payments:createPayment",
                path: `/payments/xsolla/create`,
                retryKey: options?.retryKey ?? "ContentService:Payments:createPayment",
                body: args,
            });
        }
        async executeSteamPurchase(args: ExecuteSteamPurchaseArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Payments:executeSteamPurchase",
                path: `/payments/steam/order-id/${encodeURIComponent(args.orderId)}/finalize`,
                retryKey: options?.retryKey ?? "ContentService:Payments:executeSteamPurchase",
            });
        }
        async initSteamPurchase(args: InitSteamPurchaseArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Payments:initSteamPurchase",
                path: `/payments/steam/init`,
                retryKey: options?.retryKey ?? "ContentService:Payments:initSteamPurchase",
                body: args,
            });
        }
        async xsollaWebhook(args: XsollaWebhookArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Payments:xsollaWebhook",
                path: `/payments/xsolla/webhook`,
                retryKey: options?.retryKey ?? "ContentService:Payments:xsollaWebhook",
                body: args,
            });
        }
    }
}

// ====+==== Payouts Types ====+====
export namespace ContentServicePayouts {
    export type CreatePayoutRequestArgs = {
        data: ContentServicePayouts.ReqeustPayoutDto;
    };

    export type GetRecentOrgPayoutRequestArgs = {
        params: {
            orgId: string;
        };
    };

    export interface PublicCurrencyPayoutRequestData {
        id: string;
        currencyType: ContentServiceDatabaseTypes.CurrencyType;
        amount: number;
        processedAt: string | undefined;
        createdAt: string;
        state: ContentServiceDatabaseTypes.CurrencyPayoutRequestState;
        organizationId: string;
    }

    export interface ReqeustPayoutDto {
        organizationId: string;
        amount: number;
    }

    export interface UpdateContactDto {
        email: string;
        fullName: string;
        countryCode: string;
        birthDate: string;
    }

    export type UpdateOrgContactArgs = {
        params: {
            orgId: string;
        };
        data: ContentServicePayouts.UpdateContactDto;
    };

    export interface ClientSpec {
        createPayoutRequest(
            args: CreatePayoutRequestArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePayouts.PublicCurrencyPayoutRequestData>;
        getRecentOrgPayoutRequest(
            args: GetRecentOrgPayoutRequestArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            payoutRequest: ContentServicePayouts.PublicCurrencyPayoutRequestData | undefined;
            payoutInfo: boolean;
            isEligibleForPayouts: boolean;
        }>;
        updateOrgContact(args: UpdateOrgContactArgs, options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createPayoutRequest(
            args: CreatePayoutRequestArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePayouts.PublicCurrencyPayoutRequestData> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Payouts:createPayoutRequest",
                path: `/payouts/request`,
                retryKey: options?.retryKey ?? "ContentService:Payouts:createPayoutRequest",
                body: args,
            });
        }
        async getRecentOrgPayoutRequest(
            args: GetRecentOrgPayoutRequestArgs["params"],
            options?: RequestOptions,
        ): Promise<{
            payoutRequest: ContentServicePayouts.PublicCurrencyPayoutRequestData | undefined;
            payoutInfo: boolean;
            isEligibleForPayouts: boolean;
        }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Payouts:getRecentOrgPayoutRequest",
                path: `/payouts/organization-id/${encodeURIComponent(args.orgId)}`,
                retryKey: options?.retryKey ?? "ContentService:Payouts:getRecentOrgPayoutRequest",
            });
        }
        async updateOrgContact(args: UpdateOrgContactArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "ContentService:Payouts:updateOrgContact",
                path: `/payouts/organization-id/${encodeURIComponent(args.params.orgId)}/contact`,
                retryKey: options?.retryKey ?? "ContentService:Payouts:updateOrgContact",
                body: args.data,
            });
        }
    }
}

// ====+==== Permissions Types ====+====
export namespace ContentServicePermissions {
    export interface OrganizationRolePermissionsDto {
        permissions: ContentServicePermissions.PermissionEntry;
    }

    export type PermissionEntry<
        T extends ContentServicePermissions.PermissionGroup = ContentServicePermissions.PermissionGroup,
    > = T | boolean;

    export interface PermissionGroup {
        [permissionKey: string]: PermissionEntry;
    }

    export interface PermissionNode {
        displayName: string;
        pathKey: string;
        identifierName?: string;
        desc?: string;
        subtree?: PermissionNode[];
    }

    export interface ClientSpec {
        getSchema(options?: RequestOptions): Promise<{ schema: readonly ContentServicePermissions.PermissionNode[] }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getSchema(
            options?: RequestOptions,
        ): Promise<{ schema: readonly ContentServicePermissions.PermissionNode[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Permissions:getSchema",
                path: `/permissions/schema`,
                retryKey: options?.retryKey ?? "ContentService:Permissions:getSchema",
            });
        }
    }
}

// ====+==== Products Types ====+====
export namespace ContentServiceProducts {
    export type CreateProductArgs = {
        data: ContentServiceProducts.CreateProductDto;
    };

    export interface CreateProductDto {
        name: string;
        resourceId: string;
        resourceType: ContentServiceDatabaseTypes.ResourceType;
        price: number;
        active: boolean;
        unique: boolean;
        giftable: boolean;
        currencyProductItems?: ContentServiceProducts.CurrencyProductItemDto[];
    }

    export interface CurrencyProductItemDto {
        itemClassId: string;
        quantity: number;
    }

    export interface CurrencyProductWithItems extends ContentServiceDatabaseTypes.CurrencyProduct {
        currencyProductItems: ContentServiceDatabaseTypes.CurrencyProductItem[];
    }

    export type DeleteProductArgs = {
        params: {
            id: string;
        };
    };

    export type GetProductArgs = {
        params: {
            id: string;
            productId: string;
        };
    };

    export type GetProductsArgs = {
        query: {
            resourceId: string;
        };
    };

    export type UpdateProductArgs = {
        params: {
            id: string;
        };
        data: ContentServiceProducts.UpdateProductDto;
    };

    export interface UpdateProductDto {
        name?: string;
        price?: number;
        active?: boolean;
        unique?: boolean;
        giftable?: boolean;
        currencyProductItems?: ContentServiceProducts.CurrencyProductItemDto[];
    }

    export interface ClientSpec {
        createProduct(
            args: CreateProductArgs["data"],
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems }>;
        deleteProduct(
            args: DeleteProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems }>;
        getProduct(
            args: GetProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems | undefined }>;
        getProducts(
            args: GetProductsArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceProducts.CurrencyProductWithItems[]>;
        updateProduct(
            args: UpdateProductArgs,
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createProduct(
            args: CreateProductArgs["data"],
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Products:createProduct",
                path: `/shop/products/`,
                retryKey: options?.retryKey ?? "ContentService:Products:createProduct",
                body: args,
            });
        }
        async deleteProduct(
            args: DeleteProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ContentService:Products:deleteProduct",
                path: `/shop/products/product-id/${encodeURIComponent(args.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Products:deleteProduct",
            });
        }
        async getProduct(
            args: GetProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Products:getProduct",
                path: `/shop/products/product-id/${encodeURIComponent(args.productId)}`,
                retryKey: options?.retryKey ?? "ContentService:Products:getProduct",
            });
        }
        async getProducts(
            args: GetProductsArgs["query"],
            options?: RequestOptions,
        ): Promise<ContentServiceProducts.CurrencyProductWithItems[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Products:getProducts",
                path: `/shop/products/`,
                retryKey: options?.retryKey ?? "ContentService:Products:getProducts",
                query: args,
            });
        }
        async updateProduct(
            args: UpdateProductArgs,
            options?: RequestOptions,
        ): Promise<{ product: ContentServiceProducts.CurrencyProductWithItems }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "ContentService:Products:updateProduct",
                path: `/shop/products/product-id/${encodeURIComponent(args.params.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Products:updateProduct",
                body: args.data,
            });
        }
    }
}

// ====+==== Purchase Types ====+====
export namespace ContentServicePurchase {
    export interface ClaimedCurrencyTransaction {
        id: string;
        purchaserUid: string;
        receiverUid: string;
        price: number;
        quantity: number;
        total: number;
        productId: string;
        product: ContentServiceDatabaseTypes.CurrencyProduct;
        createdAt: string;
    }

    export interface ClaimPurchaseDto {
        receiptId: string;
    }

    export type ClaimReceiptArgs = {
        data: ContentServicePurchase.ClaimPurchaseDto;
    };

    export const ClaimResult = {
        COMPLETED: "COMPLETED",
        FAILED: "FAILED",
    } as const;
    export type ClaimResult = (typeof ClaimResult)[keyof typeof ClaimResult];

    export interface CompleteClaimDto {
        receiptId: string;
        result: ContentServicePurchase.ClaimResult;
    }

    export type CompleteReceiptArgs = {
        data: ContentServicePurchase.CompleteClaimDto;
    };

    export interface CurrencyTransactionWithSummary extends ContentServiceDatabaseTypes.CurrencyTransaction {
        summary: ContentServiceDatabaseTypes.CurrencyEarningsSummary | undefined;
    }

    export type PurchaseArgs = {
        data: ContentServicePurchase.PurchaseDto;
    };

    export interface PurchaseDto {
        productId: string;
        receiverUid: string;
        quantity: number;
        total: number;
    }

    export interface RefundDetails {
        payerResourceId: string;
        payerResourceType: ContentServiceDatabaseTypes.ResourceType;
        usingEarnedCurrency: boolean;
        sellerAmount: number;
        platformAmount: number;
        usageAmount: number;
        ableToRefund: boolean;
        itemsToRefund: ContentServiceItems.OwnershipValidationResult["results"];
        reasons: string[];
        warnings: string[];
    }

    export interface ValidatedPurchase {
        productId: string;
        quantity: number;
        total: number;
        product: ContentServiceDatabaseTypes.CurrencyProduct;
    }

    export type ValidatePurchaseArgs = {
        data: ContentServicePurchase.ValidatePurchaseDto;
    };

    export interface ValidatePurchaseDto {
        productId: string;
        receiverUid: string;
        quantity: number;
    }

    export interface ClientSpec {
        claimReceipt(
            args: ClaimReceiptArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePurchase.ClaimedCurrencyTransaction>;
        completeReceipt(args: CompleteReceiptArgs["data"], options?: RequestOptions): Promise<void>;
        purchase(args: PurchaseArgs["data"], options?: RequestOptions): Promise<{ receiptId: string }>;
        validatePurchase(
            args: ValidatePurchaseArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePurchase.ValidatedPurchase>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async claimReceipt(
            args: ClaimReceiptArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePurchase.ClaimedCurrencyTransaction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Purchase:claimReceipt",
                path: `/shop/purchase/receipt/claim`,
                retryKey: options?.retryKey ?? "ContentService:Purchase:claimReceipt",
                body: args,
            });
        }
        async completeReceipt(args: CompleteReceiptArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Purchase:completeReceipt",
                path: `/shop/purchase/receipt/complete`,
                retryKey: options?.retryKey ?? "ContentService:Purchase:completeReceipt",
                body: args,
            });
        }
        async purchase(args: PurchaseArgs["data"], options?: RequestOptions): Promise<{ receiptId: string }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Purchase:purchase",
                path: `/shop/purchase/`,
                retryKey: options?.retryKey ?? "ContentService:Purchase:purchase",
                body: args,
            });
        }
        async validatePurchase(
            args: ValidatePurchaseArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServicePurchase.ValidatedPurchase> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Purchase:validatePurchase",
                path: `/shop/purchase/validate`,
                retryKey: options?.retryKey ?? "ContentService:Purchase:validatePurchase",
                body: args,
            });
        }
    }
}

// ====+==== ShopTransactions Types ====+====
export namespace ContentServiceShopTransactions {
    export type GetRefundDetailsArgs = {
        params: {
            transactionId: string;
        };
    };

    export type GetResourceTransactionArgs = {
        params: {
            transactionId: string;
            resourceId: string;
        };
    };

    export type GetTransactionForProductArgs = {
        params: {
            productId: string;
            userId: string;
        };
    };

    export type GetTransactionsForResourceArgs = {
        query?: {
            cursor?: string;
        };
        params: {
            resourceId: string;
        };
    };

    export type GetUserTransactionsArgs = {
        query?: {
            cursor?: string;
        };
    };

    export interface RefundDto {
        transactionId: string;
    }

    export type RefundTransactionArgs = {
        data: ContentServiceShopTransactions.RefundDto;
    };

    export interface ClientSpec {
        getRefundDetails(
            args: GetRefundDetailsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ details: ContentServicePurchase.RefundDetails | undefined }>;
        getResourceTransaction(
            args: GetResourceTransactionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServiceDatabaseTypes.CurrencyTransaction | undefined }>;
        getTransactionForProduct(
            args: GetTransactionForProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServiceDatabaseTypes.CurrencyTransaction | undefined }>;
        getTransactionsForResource(
            args: GetTransactionsForResourceArgs,
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServiceDatabaseTypes.CurrencyTransaction[] }>;
        getUserTransactions(
            args?: GetUserTransactionsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServiceDatabaseTypes.CurrencyTransaction[] }>;
        refundTransaction(
            args: RefundTransactionArgs["data"],
            options?: RequestOptions,
        ): Promise<{ summary: ContentServicePurchase.CurrencyTransactionWithSummary | undefined }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getRefundDetails(
            args: GetRefundDetailsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ details: ContentServicePurchase.RefundDetails | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ShopTransactions:getRefundDetails",
                path: `/shop/transactions/transaction-id/${encodeURIComponent(args.transactionId)}/refund/details`,
                retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getRefundDetails",
            });
        }
        async getResourceTransaction(
            args: GetResourceTransactionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServiceDatabaseTypes.CurrencyTransaction | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ShopTransactions:getResourceTransaction",
                path: `/shop/transactions/resource-id/${encodeURIComponent(args.resourceId)}/transaction-id/${encodeURIComponent(args.transactionId)}`,
                retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getResourceTransaction",
            });
        }
        async getTransactionForProduct(
            args: GetTransactionForProductArgs["params"],
            options?: RequestOptions,
        ): Promise<{ transaction: ContentServiceDatabaseTypes.CurrencyTransaction | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ShopTransactions:getTransactionForProduct",
                path: `/shop/transactions/user-id/${encodeURIComponent(args.userId)}/product-id/${encodeURIComponent(args.productId)}`,
                retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getTransactionForProduct",
            });
        }
        async getTransactionsForResource(
            args: GetTransactionsForResourceArgs,
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServiceDatabaseTypes.CurrencyTransaction[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ShopTransactions:getTransactionsForResource",
                path: `/shop/transactions/resource-id/${encodeURIComponent(args.params.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getTransactionsForResource",
                query: args.query,
            });
        }
        async getUserTransactions(
            args?: GetUserTransactionsArgs["query"],
            options?: RequestOptions,
        ): Promise<{ cursor?: string; results: ContentServiceDatabaseTypes.CurrencyTransaction[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:ShopTransactions:getUserTransactions",
                path: `/shop/transactions/self`,
                retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getUserTransactions",
                query: args,
            });
        }
        async refundTransaction(
            args: RefundTransactionArgs["data"],
            options?: RequestOptions,
        ): Promise<{ summary: ContentServicePurchase.CurrencyTransactionWithSummary | undefined }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:ShopTransactions:refundTransaction",
                path: `/shop/transactions/transaction/refund`,
                retryKey: options?.retryKey ?? "ContentService:ShopTransactions:refundTransaction",
                body: args,
            });
        }
    }
}

// ====+==== Webhooks Types ====+====
export namespace ContentServiceWebhooks {
    export type CreateWebhookArgs = {
        data: ContentServiceWebhooks.CreateWebhookDto;
    };

    export interface CreateWebhookDto {
        url: string;
        resourceId: string;
    }

    export type DeleteWebhookArgs = {
        params: {
            id: string;
        };
    };

    export type GetWebhooksArgs = {
        params: {
            resourceId: string;
        };
    };

    export interface ClientSpec {
        createWebhook(
            args: CreateWebhookArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Webhook>;
        deleteWebhook(
            args: DeleteWebhookArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Webhook>;
        getWebhooks(
            args: GetWebhooksArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Webhook[]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createWebhook(
            args: CreateWebhookArgs["data"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Webhook> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ContentService:Webhooks:createWebhook",
                path: `/webhooks/`,
                retryKey: options?.retryKey ?? "ContentService:Webhooks:createWebhook",
                body: args,
            });
        }
        async deleteWebhook(
            args: DeleteWebhookArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Webhook> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ContentService:Webhooks:deleteWebhook",
                path: `/webhooks/webhook-id/${encodeURIComponent(args.id)}`,
                retryKey: options?.retryKey ?? "ContentService:Webhooks:deleteWebhook",
            });
        }
        async getWebhooks(
            args: GetWebhooksArgs["params"],
            options?: RequestOptions,
        ): Promise<ContentServiceDatabaseTypes.Webhook[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ContentService:Webhooks:getWebhooks",
                path: `/webhooks/resource-id/${encodeURIComponent(args.resourceId)}`,
                retryKey: options?.retryKey ?? "ContentService:Webhooks:getWebhooks",
            });
        }
    }
}

export interface ContentServiceClientSpec {
    artifacts: ContentServiceArtifacts.ClientSpec;
    currency: ContentServiceCurrency.ClientSpec;
    favorites: ContentServiceFavorites.ClientSpec;
    games: ContentServiceGames.ClientSpec;
    gear: ContentServiceGear.ClientSpec;
    images: ContentServiceImages.ClientSpec;
    itemClasses: ContentServiceItemClasses.ClientSpec;
    items: ContentServiceItems.ClientSpec;
    itemTags: ContentServiceItemTags.ClientSpec;
    itemTransactions: ContentServiceItemTransactions.ClientSpec;
    memberships: ContentServiceMemberships.ClientSpec;
    organizationRoles: ContentServiceOrganizationRoles.ClientSpec;
    organizations: ContentServiceOrganizations.ClientSpec;
    outfits: ContentServiceOutfits.ClientSpec;
    packages: ContentServicePackages.ClientSpec;
    payments: ContentServicePayments.ClientSpec;
    payouts: ContentServicePayouts.ClientSpec;
    permissions: ContentServicePermissions.ClientSpec;
    products: ContentServiceProducts.ClientSpec;
    purchase: ContentServicePurchase.ClientSpec;
    shopTransactions: ContentServiceShopTransactions.ClientSpec;
    webhooks: ContentServiceWebhooks.ClientSpec;
}

export class ContentServiceClient implements ContentServiceClientSpec {
    public readonly artifacts: ContentServiceArtifacts.ClientSpec;
    public readonly currency: ContentServiceCurrency.ClientSpec;
    public readonly favorites: ContentServiceFavorites.ClientSpec;
    public readonly games: ContentServiceGames.ClientSpec;
    public readonly gear: ContentServiceGear.ClientSpec;
    public readonly images: ContentServiceImages.ClientSpec;
    public readonly itemClasses: ContentServiceItemClasses.ClientSpec;
    public readonly items: ContentServiceItems.ClientSpec;
    public readonly itemTags: ContentServiceItemTags.ClientSpec;
    public readonly itemTransactions: ContentServiceItemTransactions.ClientSpec;
    public readonly memberships: ContentServiceMemberships.ClientSpec;
    public readonly organizationRoles: ContentServiceOrganizationRoles.ClientSpec;
    public readonly organizations: ContentServiceOrganizations.ClientSpec;
    public readonly outfits: ContentServiceOutfits.ClientSpec;
    public readonly packages: ContentServicePackages.ClientSpec;
    public readonly payments: ContentServicePayments.ClientSpec;
    public readonly payouts: ContentServicePayouts.ClientSpec;
    public readonly permissions: ContentServicePermissions.ClientSpec;
    public readonly products: ContentServiceProducts.ClientSpec;
    public readonly purchase: ContentServicePurchase.ClientSpec;
    public readonly shopTransactions: ContentServiceShopTransactions.ClientSpec;
    public readonly webhooks: ContentServiceWebhooks.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.artifacts = new ContentServiceArtifacts.Client(makeRequest);
        this.currency = new ContentServiceCurrency.Client(makeRequest);
        this.favorites = new ContentServiceFavorites.Client(makeRequest);
        this.games = new ContentServiceGames.Client(makeRequest);
        this.gear = new ContentServiceGear.Client(makeRequest);
        this.images = new ContentServiceImages.Client(makeRequest);
        this.itemClasses = new ContentServiceItemClasses.Client(makeRequest);
        this.items = new ContentServiceItems.Client(makeRequest);
        this.itemTags = new ContentServiceItemTags.Client(makeRequest);
        this.itemTransactions = new ContentServiceItemTransactions.Client(makeRequest);
        this.memberships = new ContentServiceMemberships.Client(makeRequest);
        this.organizationRoles = new ContentServiceOrganizationRoles.Client(makeRequest);
        this.organizations = new ContentServiceOrganizations.Client(makeRequest);
        this.outfits = new ContentServiceOutfits.Client(makeRequest);
        this.packages = new ContentServicePackages.Client(makeRequest);
        this.payments = new ContentServicePayments.Client(makeRequest);
        this.payouts = new ContentServicePayouts.Client(makeRequest);
        this.permissions = new ContentServicePermissions.Client(makeRequest);
        this.products = new ContentServiceProducts.Client(makeRequest);
        this.purchase = new ContentServicePurchase.Client(makeRequest);
        this.shopTransactions = new ContentServiceShopTransactions.Client(makeRequest);
        this.webhooks = new ContentServiceWebhooks.Client(makeRequest);
    }
}
