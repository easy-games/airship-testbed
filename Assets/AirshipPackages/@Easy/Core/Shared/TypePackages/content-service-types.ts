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
		note: string | undefined;
		createdAt: string;
		size: number;
		uploadedAt: string | undefined;
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
		processedAt: string | undefined;
		createdAt: string;
		platformFeeAmount: number | undefined;
		finalBalance: number | undefined;
		usageData: unknown | undefined;
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
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export const MemberStatus = {
		INVITED: "INVITED",
		ACTIVE: "ACTIVE",
	} as const;
	export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];
	export type Member = {
		uid: string;
		organizationId: string;
		roleName: string;
		createdAt: string;
		joinedAt: string | undefined;
		status: ContentServicePrisma.MemberStatus;
	};
	export type OrganizationRole = {
		roleName: string;
		createdAt: string;
		organizationId: string;
		permissionsData: unknown;
	};
	export type Game = {
		id: string;
		slug: string | undefined;
		slugProperCase: string | undefined;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		visibility: ContentServicePrisma.GameVisibility;
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
		adminForceVisibility: ContentServicePrisma.GameVisibility | undefined;
		adminHideUntilNextPublish: boolean;
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
	export type CurrencyPayoutRequest = {
		id: string;
		currencyType: ContentServicePrisma.CurrencyType;
		amount: number;
		state: ContentServicePrisma.CurrencyPayoutRequestState;
		processedBy: string | undefined;
		processedAt: string | undefined;
		createdAt: string;
		organizationId: string;
	};
	export type CurrencyPayoutInfo = {
		organizationId: string;
		email: string;
		fullName: string;
		createdAt: string;
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
		subcategory: string | undefined;
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
		details: ContentServicePrisma.TransactionDetails | undefined;
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
		completedAt: string | undefined;
		summaryId: string | undefined;
		itemTransactionId: string | undefined;
		refundItemTransactionId: string | undefined;
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

	export interface ClientSpec {
		getArtifacts(
			args: GetArtifactsArgs,
			options?: RequestOptions,
		): Promise<{ results: ContentServicePrisma.Artifact[]; cursor?: string }>;
		getSignedUrl(args: GetSignedUrlArgs["data"], options?: RequestOptions): Promise<{ id: string; url: string }>;
		downloadArtifact(args: DownloadArtifactArgs["params"], options?: RequestOptions): Promise<{ url: string }>;
	}

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Artifacts:getArtifacts",
				path: `/artifacts/game-id/${encodeURIComponent(args.params.gameId)}/type/${encodeURIComponent(
					args.params.type,
				)}`,
				retryKey: options?.retryKey ?? "ContentService:Artifacts:getArtifacts",
				query: args.query,
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
	export type CurrencyValues = { [Key in ContentServicePrisma.CurrencyType]: number };
	export type CurrencyEarningsSummaries = {
		[Key in ContentServicePrisma.CurrencyType]: ContentServicePrisma.CurrencyEarningsSummary;
	};

	export interface ClientSpec {
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
			args: GetOrgEarningsArgs,
			options?: RequestOptions,
		): Promise<{ cursor: string | undefined; results: ContentServicePrisma.CurrencyEarningsSummary[] }>;
		getSummary(
			args: GetSummaryArgs["params"],
			options?: RequestOptions,
		): Promise<{ summary: ContentServicePrisma.CurrencyEarningsSummary | undefined }>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getCurrency(options?: RequestOptions): Promise<CurrencyValues> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Currency:getCurrency",
				path: `/currency/`,
				retryKey: options?.retryKey ?? "ContentService:Currency:getCurrency",
			});
		}
		async getOrgCurrency(
			args: GetOrgCurrencyArgs["params"],
			options?: RequestOptions,
		): Promise<{ owned: CurrencyValues; pending: CurrencyValues }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Currency:getOrgCurrency",
				path: `/currency/organization-id/${encodeURIComponent(args.orgId)}`,
				retryKey: options?.retryKey ?? "ContentService:Currency:getOrgCurrency",
			});
		}
		async getEarningsForResource(
			args: GetEarningsForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<CurrencyEarningsSummaries> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Currency:getEarningsForResource",
				path: `/currency/resource-id/${encodeURIComponent(args.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:Currency:getEarningsForResource",
			});
		}
		async getOrgEarnings(
			args: GetOrgEarningsArgs,
			options?: RequestOptions,
		): Promise<{ cursor: string | undefined; results: ContentServicePrisma.CurrencyEarningsSummary[] }> {
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
		): Promise<{ summary: ContentServicePrisma.CurrencyEarningsSummary | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Currency:getSummary",
				path: `/currency/organization-id/${encodeURIComponent(args.orgId)}/summary/${encodeURIComponent(
					args.summaryId,
				)}`,
				retryKey: options?.retryKey ?? "ContentService:Currency:getSummary",
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
		slug: string | undefined;
		slugProperCase: string | undefined;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		visibility: ContentServicePrisma.GameVisibility;
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
		organization?: ContentServicePrisma.Organization;
	}
	export interface WithLiveStats {
		liveStats: { playerCount: number };
	}
	export type PublicGameWithLiveStats = PublicGame & WithLiveStats;

	export interface ClientSpec {
		setFavorite(args: SetFavoriteArgs, options?: RequestOptions): Promise<void>;
		getFavorites(
			args: GetFavoritesArgs["params"],
			options?: RequestOptions,
		): Promise<{
			type: FavoritesType;
			data: { resourceId: string; resource: PublicGameWithLiveStats; createdAt: string }[];
		}>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
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
		async getFavorites(
			args: GetFavoritesArgs["params"],
			options?: RequestOptions,
		): Promise<{
			type: FavoritesType;
			data: { resourceId: string; resource: PublicGameWithLiveStats; createdAt: string }[];
		}> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Favorites:getFavorites",
				path: `/favorites/${encodeURIComponent(args.favorites_type)}/`,
				retryKey: options?.retryKey ?? "ContentService:Favorites:getFavorites",
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
		loadingScreenImageId?: string | undefined;
		logoImageId?: string | undefined;
		videoId?: string | undefined;
		links?: GameLinkDto[] | undefined;
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
		forceVisibility?: ContentServicePrisma.GameVisibility | undefined;
		hideUntilNextPublish?: boolean;
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
		slug: string | undefined;
		slugProperCase: string | undefined;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		visibility: ContentServicePrisma.GameVisibility;
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
	export interface AutocompleteSearchGame
		extends Pick<
				PublicGame,
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
			WithLiveStats {
		lastVersionUpdate: string;
		organization?: Pick<ContentServicePrisma.Organization, "name" | "iconImageId">;
	}
	export interface PublicImageResource {
		imageId: string;
		name: string | undefined;
		description: string | undefined;
		size: number;
		createdAt: string;
	}
	export interface SignedImageUrl extends PublicImageResource {
		url: string;
	}

	export interface ClientSpec {
		getGameSorts(
			args?: GetGameSortsArgs["query"],
			options?: RequestOptions,
		): Promise<{
			popular: PublicGameWithLiveStatsAndOrg[];
			featured: PublicGameWithLiveStatsAndOrg[];
			recentlyUpdated: PublicGameWithLiveStatsAndOrg[];
		}>;
		getAdminGameSorts(
			args?: GetAdminGameSortsArgs["query"],
			options?: RequestOptions,
		): Promise<{
			popular: PublicGameWithLiveStatsAndOrg[];
			featured: PublicGameWithLiveStatsAndOrg[];
			recentlyUpdated: PublicGameWithLiveStatsAndOrg[];
		}>;
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
		): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | undefined }>;
		adminSetGameStatus(
			args: AdminSetGameStatusArgs,
			options?: RequestOptions,
		): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | undefined }>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getGameSorts(
			args?: GetGameSortsArgs["query"],
			options?: RequestOptions,
		): Promise<{
			popular: PublicGameWithLiveStatsAndOrg[];
			featured: PublicGameWithLiveStatsAndOrg[];
			recentlyUpdated: PublicGameWithLiveStatsAndOrg[];
		}> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:getGameSorts",
				path: `/games/`,
				retryKey: options?.retryKey ?? "ContentService:Games:getGameSorts",
				query: args,
			});
		}
		async getAdminGameSorts(
			args?: GetAdminGameSortsArgs["query"],
			options?: RequestOptions,
		): Promise<{
			popular: PublicGameWithLiveStatsAndOrg[];
			featured: PublicGameWithLiveStatsAndOrg[];
			recentlyUpdated: PublicGameWithLiveStatsAndOrg[];
		}> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:getAdminGameSorts",
				path: `/games/admin/sorts`,
				retryKey: options?.retryKey ?? "ContentService:Games:getAdminGameSorts",
				query: args,
			});
		}
		async getGameBySlug(
			args: GetGameBySlugArgs,
			options?: RequestOptions,
		): Promise<{ game: PublicGameWithOrg | PublicGameWithLiveStatsAndOrg | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:getGameBySlug",
				path: `/games/slug/${encodeURIComponent(args.params.slug)}`,
				retryKey: options?.retryKey ?? "ContentService:Games:getGameBySlug",
				query: args.query,
			});
		}
		async getGameById(
			args: GetGameByIdArgs,
			options?: RequestOptions,
		): Promise<{ game: PublicGameWithOrg | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:getGameById",
				path: `/games/game-id/${encodeURIComponent(args.params.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Games:getGameById",
				query: args.query,
			});
		}
		async autocompleteGame(
			args: AutocompleteGameArgs["query"],
			options?: RequestOptions,
		): Promise<AutocompleteSearchGame[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:autocompleteGame",
				path: `/games/autocomplete`,
				retryKey: options?.retryKey ?? "ContentService:Games:autocompleteGame",
				query: args,
			});
		}
		async adminAutocompleteGame(
			args: AdminAutocompleteGameArgs["query"],
			options?: RequestOptions,
		): Promise<AutocompleteSearchGame[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:adminAutocompleteGame",
				path: `/games/admin/autocomplete`,
				retryKey: options?.retryKey ?? "ContentService:Games:adminAutocompleteGame",
				query: args,
			});
		}
		async patchGame(args: PatchGameArgs, options?: RequestOptions): Promise<{ game: PublicGameWithOrg }> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:Games:patchGame",
				path: `/games/game-id/${encodeURIComponent(args.params.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Games:patchGame",
				body: args.data,
			});
		}
		async createGame(args: CreateGameArgs["data"], options?: RequestOptions): Promise<{ game: PublicGameWithOrg }> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Games:createGame",
				path: `/games/`,
				retryKey: options?.retryKey ?? "ContentService:Games:createGame",
				body: args,
			});
		}
		async getSignedGameImage(args: GetSignedGameImageArgs, options?: RequestOptions): Promise<SignedImageUrl> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:getSignedGameImage",
				path: `/games/game-id/${encodeURIComponent(args.params.id)}/namespace/${encodeURIComponent(
					args.params.namespace,
				)}/signed-url`,
				retryKey: options?.retryKey ?? "ContentService:Games:getSignedGameImage",
				query: args.query,
			});
		}
		async addGameToFeaturedList(
			args: AddGameToFeaturedListArgs["params"],
			options?: RequestOptions,
		): Promise<{ featured: PublicGameWithOrg[] }> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "ContentService:Games:addGameToFeaturedList",
				path: `/games/game-id/${encodeURIComponent(args.id)}/featured`,
				retryKey: options?.retryKey ?? "ContentService:Games:addGameToFeaturedList",
			});
		}
		async removeGameFromFeaturedList(
			args: RemoveGameFromFeaturedListArgs["params"],
			options?: RequestOptions,
		): Promise<{ featured: PublicGameWithOrg[] }> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:Games:removeGameFromFeaturedList",
				path: `/games/game-id/${encodeURIComponent(args.id)}/featured`,
				retryKey: options?.retryKey ?? "ContentService:Games:removeGameFromFeaturedList",
			});
		}
		async adminGetGameStatus(
			args: AdminGetGameStatusArgs["params"],
			options?: RequestOptions,
		): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Games:adminGetGameStatus",
				path: `/games/admin-status/game-id/${encodeURIComponent(args.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Games:adminGetGameStatus",
			});
		}
		async adminSetGameStatus(
			args: AdminSetGameStatusArgs,
			options?: RequestOptions,
		): Promise<{ forceVisibility: ContentServicePrisma.GameVisibility | undefined }> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:Games:adminSetGameStatus",
				path: `/games/admin-status/game-id/${encodeURIComponent(args.params.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Games:adminSetGameStatus",
				body: args.data,
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
	export interface ScheduleDeletionBody {
		imageId: string;
		scheduleTime: string;
	}
	export type ScheduleDeleteImageArgs = {
		data: ScheduleDeletionBody;
	};
	export interface PublicImageResource {
		imageId: string;
		name: string | undefined;
		description: string | undefined;
		size: number;
		createdAt: string;
	}
	export interface SignedImageUrl extends PublicImageResource {
		url: string;
	}

	export interface ClientSpec {
		getImagesForResource(
			args: GetImagesForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<{ images: PublicImageResource[] }>;
		createImage(args: CreateImageArgs["data"], options?: RequestOptions): Promise<SignedImageUrl>;
		scheduleDeleteImage(args: ScheduleDeleteImageArgs["data"], options?: RequestOptions): Promise<void>;
	}

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Images:getImagesForResource",
				path: `/images/resource-type/${encodeURIComponent(args.resourceType)}/resource-id/${encodeURIComponent(
					args.resourceId,
				)}/namespace/${encodeURIComponent(args.namespace)}`,
				retryKey: options?.retryKey ?? "ContentService:Images:getImagesForResource",
			});
		}
		async createImage(args: CreateImageArgs["data"], options?: RequestOptions): Promise<SignedImageUrl> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Images:createImage",
				path: `/images/`,
				retryKey: options?.retryKey ?? "ContentService:Images:createImage",
				body: args,
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
// ====+==== Memberships TYPES ====+====
export namespace ContentServiceMemberships {
	export type GetUserMembershipsArgs = {
		query?: {
			includeInactive?: boolean;
		};
	};
	export type GetUserGameOwnershipArgs<T extends boolean> = {
		query?: {
			liveStats?: T;
		};
	};
	export type GetMembershipForGameArgs = {
		params: {
			userId: string;
		};
	};
	export interface WithOrg {
		organization: ContentServicePrisma.Organization;
	}
	export type MemberWithOrg = ContentServicePrisma.Member & WithOrg;
	export interface PermissionGroup {
		[permissionKey: string]: PermissionEntry;
	}
	export type PermissionEntry<T extends PermissionGroup = PermissionGroup> = T | boolean;
	export interface OrganizationRolePermissionsData {
		permissions: PermissionEntry;
		schemaVersion: 0;
	}
	export type Override<SourceType, ReplacementType, OmitKeys extends keyof SourceType = never> = Omit<
		SourceType,
		(keyof ReplacementType & keyof SourceType) | OmitKeys
	> &
		ReplacementType;
	export type PublicOrganizationRole = Override<
		ContentServicePrisma.OrganizationRole,
		{ permissionsData: OrganizationRolePermissionsData }
	>;
	export interface WithRole {
		role: PublicOrganizationRole;
	}
	export type MemberWithOrgAndRole = MemberWithOrg & WithRole;
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
		slug: string | undefined;
		slugProperCase: string | undefined;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		visibility: ContentServicePrisma.GameVisibility;
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
		organization?: ContentServicePrisma.Organization;
	}
	export interface WithLiveStats {
		liveStats: { playerCount: number };
	}
	export type PublicGameWithLiveStatsAndOrg = PublicGame & WithLiveStats & WithOrg;
	export type PublicGameWithOrg = PublicGame & WithOrg;

	export interface ClientSpec {
		getUserMemberships(
			args?: GetUserMembershipsArgs["query"],
			options?: RequestOptions,
		): Promise<MemberWithOrgAndRole[]>;
		getUserGameOwnership<T extends boolean>(
			args?: GetUserGameOwnershipArgs<T>["query"],
			options?: RequestOptions,
		): Promise<T extends true ? PublicGameWithLiveStatsAndOrg[] : PublicGameWithOrg[]>;
		getMembershipForGame(
			args: GetMembershipForGameArgs["params"],
			options?: RequestOptions,
		): Promise<{ isMember: boolean; membershipData: ContentServicePrisma.Member | false }>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getUserMemberships(
			args?: GetUserMembershipsArgs["query"],
			options?: RequestOptions,
		): Promise<MemberWithOrgAndRole[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Memberships:getUserMemberships",
				path: `/memberships/organizations/self`,
				retryKey: options?.retryKey ?? "ContentService:Memberships:getUserMemberships",
				query: args,
			});
		}
		async getUserGameOwnership<T extends boolean>(
			args?: GetUserGameOwnershipArgs<T>["query"],
			options?: RequestOptions,
		): Promise<T extends true ? PublicGameWithLiveStatsAndOrg[] : PublicGameWithOrg[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Memberships:getUserGameOwnership",
				path: `/memberships/games/self`,
				retryKey: options?.retryKey ?? "ContentService:Memberships:getUserGameOwnership",
				query: args,
			});
		}
		async getMembershipForGame(
			args: GetMembershipForGameArgs["params"],
			options?: RequestOptions,
		): Promise<{ isMember: boolean; membershipData: ContentServicePrisma.Member | false }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Memberships:getMembershipForGame",
				path: `/memberships/game-organization/user-id/${encodeURIComponent(args.userId)}`,
				retryKey: options?.retryKey ?? "ContentService:Memberships:getMembershipForGame",
			});
		}
	}
}
// ====+==== Organizations TYPES ====+====
export namespace ContentServiceOrganizations {
	export type GetPublicOrganizationBySlugArgs = {
		params: {
			slug: string;
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
	export type RecognizeMemberInviteArgs = {
		params: {
			id: string;
		};
		query: {
			acceptInvite: boolean;
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
		slug: string | undefined;
		slugProperCase: string | undefined;
		name: string;
		description: string;
		iconImageId: string;
		organizationId: string;
		createdAt: string;
		visibility: ContentServicePrisma.GameVisibility;
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
		organization?: ContentServicePrisma.Organization;
	}
	export interface PublicOrganization {
		name: string;
		id: string;
		slug: string;
		slugProperCase: string;
		description: string;
		iconImageId: string;
		createdAt: string;
		games?: PublicGame[];
	}
	export interface WithPublicGames {
		games: PublicGame[];
	}
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
		name: string | undefined;
		description: string | undefined;
		size: number;
		createdAt: string;
	}
	export interface SignedImageUrl extends PublicImageResource {
		url: string;
	}

	export interface ClientSpec {
		getPublicOrganizationBySlug(
			args: GetPublicOrganizationBySlugArgs["params"],
			options?: RequestOptions,
		): Promise<{ organization: (PublicOrganization & WithPublicGames) | undefined }>;
		getOrganizationBySlug(
			args: GetOrganizationBySlugArgs,
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
		putMember(args: PutMemberArgs, options?: RequestOptions): Promise<AugmentedMember[]>;
		deleteMember(args: DeleteMemberArgs["params"], options?: RequestOptions): Promise<AugmentedMember[]>;
		recognizeMemberInvite(
			args: RecognizeMemberInviteArgs,
			options?: RequestOptions,
		): Promise<ContentServicePrisma.Member>;
		getSignedOrgImage(args: GetSignedOrgImageArgs, options?: RequestOptions): Promise<SignedImageUrl>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getPublicOrganizationBySlug(
			args: GetPublicOrganizationBySlugArgs["params"],
			options?: RequestOptions,
		): Promise<{ organization: (PublicOrganization & WithPublicGames) | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Organizations:getPublicOrganizationBySlug",
				path: `/organizations/slug/${encodeURIComponent(args.slug)}/public`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:getPublicOrganizationBySlug",
			});
		}
		async getOrganizationBySlug(
			args: GetOrganizationBySlugArgs,
			options?: RequestOptions,
		): Promise<{ organization: OrganizationView }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Organizations:getOrganizationBySlug",
				path: `/organizations/slug/${encodeURIComponent(args.params.slug)}`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:getOrganizationBySlug",
				query: args.query,
			});
		}
		async getOrganizationById(
			args: GetOrganizationByIdArgs["params"],
			options?: RequestOptions,
		): Promise<{ organization: ContentServicePrisma.Organization | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Organizations:getOrganizationById",
				path: `/organizations/organization-id/${encodeURIComponent(args.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:getOrganizationById",
			});
		}
		async patchOrganization(
			args: PatchOrganizationArgs,
			options?: RequestOptions,
		): Promise<{ organization: ContentServicePrisma.Organization }> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:Organizations:patchOrganization",
				path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:patchOrganization",
				body: args.data,
			});
		}
		async createOrganization(
			args: CreateOrganizationArgs["data"],
			options?: RequestOptions,
		): Promise<{ organization: ContentServicePrisma.Organization | undefined }> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Organizations:createOrganization",
				path: `/organizations/`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:createOrganization",
				body: args,
			});
		}
		async putMember(args: PutMemberArgs, options?: RequestOptions): Promise<AugmentedMember[]> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "ContentService:Organizations:putMember",
				path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}/member`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:putMember",
				body: args.data,
			});
		}
		async deleteMember(args: DeleteMemberArgs["params"], options?: RequestOptions): Promise<AugmentedMember[]> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:Organizations:deleteMember",
				path: `/organizations/organization-id/${encodeURIComponent(args.id)}/member-uid/${encodeURIComponent(
					args.uid,
				)}`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:deleteMember",
			});
		}
		async recognizeMemberInvite(
			args: RecognizeMemberInviteArgs,
			options?: RequestOptions,
		): Promise<ContentServicePrisma.Member> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Organizations:recognizeMemberInvite",
				path: `/organizations/organization-id/${encodeURIComponent(args.params.id)}/member-invite`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:recognizeMemberInvite",
				query: args.query,
			});
		}
		async getSignedOrgImage(args: GetSignedOrgImageArgs, options?: RequestOptions): Promise<SignedImageUrl> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Organizations:getSignedOrgImage",
				path: `/organizations/thumbnails/organization-id/${encodeURIComponent(args.params.id)}/signed-url`,
				retryKey: options?.retryKey ?? "ContentService:Organizations:getSignedOrgImage",
				query: args.query,
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
	export interface PackageWithOrg extends ContentServicePrisma.Package {
		organization: ContentServicePrisma.Organization;
	}
	export interface PublicImageResource {
		imageId: string;
		name: string | undefined;
		description: string | undefined;
		size: number;
		createdAt: string;
	}
	export interface SignedImageUrl extends PublicImageResource {
		url: string;
	}

	export interface ClientSpec {
		getPackageBySlug(
			args: GetPackageBySlugArgs["params"],
			options?: RequestOptions,
		): Promise<{ pkg: PackageWithOrg }>;
		getPackageById(args: GetPackageByIdArgs["params"], options?: RequestOptions): Promise<{ pkg: PackageWithOrg }>;
		patchPackage(args: PatchPackageArgs, options?: RequestOptions): Promise<{ pkg: PackageWithOrg }>;
		createPackage(args: CreatePackageArgs["data"], options?: RequestOptions): Promise<{ pkg: PackageWithOrg }>;
		getSignedPackageImage(args: GetSignedPackageImageArgs, options?: RequestOptions): Promise<SignedImageUrl>;
	}

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Packages:getPackageBySlug",
				path: `/packages/slug/${encodeURIComponent(args.orgSlug)}/${encodeURIComponent(args.packageSlug)}`,
				retryKey: options?.retryKey ?? "ContentService:Packages:getPackageBySlug",
			});
		}
		async getPackageById(
			args: GetPackageByIdArgs["params"],
			options?: RequestOptions,
		): Promise<{ pkg: PackageWithOrg }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Packages:getPackageById",
				path: `/packages/package-id/${encodeURIComponent(args.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Packages:getPackageById",
			});
		}
		async patchPackage(args: PatchPackageArgs, options?: RequestOptions): Promise<{ pkg: PackageWithOrg }> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:Packages:patchPackage",
				path: `/packages/package-id/${encodeURIComponent(args.params.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Packages:patchPackage",
				body: args.data,
			});
		}
		async createPackage(
			args: CreatePackageArgs["data"],
			options?: RequestOptions,
		): Promise<{ pkg: PackageWithOrg }> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Packages:createPackage",
				path: `/packages/`,
				retryKey: options?.retryKey ?? "ContentService:Packages:createPackage",
				body: args,
			});
		}
		async getSignedPackageImage(
			args: GetSignedPackageImageArgs,
			options?: RequestOptions,
		): Promise<SignedImageUrl> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Packages:getSignedPackageImage",
				path: `/packages/thumbnails/package-id/${encodeURIComponent(args.params.id)}/signed-url`,
				retryKey: options?.retryKey ?? "ContentService:Packages:getSignedPackageImage",
				query: args.query,
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
		data: unknown;
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

	export interface ClientSpec {
		createPayment(
			args: CreatePaymentArgs["data"],
			options?: RequestOptions,
		): Promise<{ token: string; order_id: string }>;
		xsollaWebhook(args: XsollaWebhookArgs["data"], options?: RequestOptions): Promise<void>;
		initSteamPurchase(args: InitSteamPurchaseArgs["data"], options?: RequestOptions): Promise<void>;
		executeSteamPurchase(args: ExecuteSteamPurchaseArgs["params"], options?: RequestOptions): Promise<void>;
	}

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Payments:createPayment",
				path: `/payments/xsolla/create`,
				retryKey: options?.retryKey ?? "ContentService:Payments:createPayment",
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
		async initSteamPurchase(args: InitSteamPurchaseArgs["data"], options?: RequestOptions): Promise<void> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Payments:initSteamPurchase",
				path: `/payments/steam/init`,
				retryKey: options?.retryKey ?? "ContentService:Payments:initSteamPurchase",
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
	export interface CurrentPayoutRequestWithOrgCurrencyInfo extends ContentServicePrisma.CurrencyPayoutRequest {
		organization: ContentServicePrisma.Organization & {
			currencyPayoutInfo: ContentServicePrisma.CurrencyPayoutInfo | undefined;
		};
	}
	export interface PublicCurrencyPayoutRequestData {
		id: string;
		currencyType: ContentServicePrisma.CurrencyType;
		amount: number;
		processedAt: string | undefined;
		createdAt: string;
		state: ContentServicePrisma.CurrencyPayoutRequestState;
		organizationId: string;
	}

	export interface ClientSpec {
		getPayouts(
			args: GetPayoutsArgs["query"],
			options?: RequestOptions,
		): Promise<{ results: CurrentPayoutRequestWithOrgCurrencyInfo[]; cursor?: string }>;
		getRecentOrgPayoutRequest(
			args: GetRecentOrgPayoutRequestArgs["params"],
			options?: RequestOptions,
		): Promise<{ payoutRequest: PublicCurrencyPayoutRequestData | undefined; payoutInfo: boolean }>;
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

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getPayouts(
			args: GetPayoutsArgs["query"],
			options?: RequestOptions,
		): Promise<{ results: CurrentPayoutRequestWithOrgCurrencyInfo[]; cursor?: string }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Payouts:getPayouts",
				path: `/payouts/`,
				retryKey: options?.retryKey ?? "ContentService:Payouts:getPayouts",
				query: args,
			});
		}
		async getRecentOrgPayoutRequest(
			args: GetRecentOrgPayoutRequestArgs["params"],
			options?: RequestOptions,
		): Promise<{ payoutRequest: PublicCurrencyPayoutRequestData | undefined; payoutInfo: boolean }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Payouts:getRecentOrgPayoutRequest",
				path: `/payouts/organization-id/${encodeURIComponent(args.orgId)}`,
				retryKey: options?.retryKey ?? "ContentService:Payouts:getRecentOrgPayoutRequest",
			});
		}
		async createPayoutRequest(
			args: CreatePayoutRequestArgs["data"],
			options?: RequestOptions,
		): Promise<PublicCurrencyPayoutRequestData> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Payouts:createPayoutRequest",
				path: `/payouts/request`,
				retryKey: options?.retryKey ?? "ContentService:Payouts:createPayoutRequest",
				body: args,
			});
		}
		async updatePayout(
			args: UpdatePayoutArgs,
			options?: RequestOptions,
		): Promise<ContentServicePrisma.CurrencyPayoutRequest> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "ContentService:Payouts:updatePayout",
				path: `/payouts/payout-id/${encodeURIComponent(args.params.payoutId)}`,
				retryKey: options?.retryKey ?? "ContentService:Payouts:updatePayout",
				body: args.data,
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
// ====+==== Permissions TYPES ====+====
export namespace ContentServicePermissions {
	export interface PermissionNode {
		displayName: string;
		pathKey: string;
		identifierName?: string;
		desc?: string;
		subtree?: PermissionNode[];
	}

	export interface ClientSpec {
		getSchema(options?: RequestOptions): Promise<{ schema: readonly PermissionNode[] }>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getSchema(options?: RequestOptions): Promise<{ schema: readonly PermissionNode[] }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Permissions:getSchema",
				path: `/permissions/schema`,
				retryKey: options?.retryKey ?? "ContentService:Permissions:getSchema",
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

	export interface ClientSpec {
		createWebhook(args: CreateWebhookArgs["data"], options?: RequestOptions): Promise<ContentServicePrisma.Webhook>;
		getWebhooks(args: GetWebhooksArgs["params"], options?: RequestOptions): Promise<ContentServicePrisma.Webhook[]>;
		deleteWebhook(
			args: DeleteWebhookArgs["params"],
			options?: RequestOptions,
		): Promise<ContentServicePrisma.Webhook>;
	}

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Webhooks:createWebhook",
				path: `/webhooks/`,
				retryKey: options?.retryKey ?? "ContentService:Webhooks:createWebhook",
				body: args,
			});
		}
		async getWebhooks(
			args: GetWebhooksArgs["params"],
			options?: RequestOptions,
		): Promise<ContentServicePrisma.Webhook[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Webhooks:getWebhooks",
				path: `/webhooks/resource-id/${encodeURIComponent(args.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:Webhooks:getWebhooks",
			});
		}
		async deleteWebhook(
			args: DeleteWebhookArgs["params"],
			options?: RequestOptions,
		): Promise<ContentServicePrisma.Webhook> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:Webhooks:deleteWebhook",
				path: `/webhooks/webhook-id/${encodeURIComponent(args.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Webhooks:deleteWebhook",
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
		subcategory?: string | undefined;
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
		archivedAt: string | undefined;
		gear: Partial<ContentServicePrisma.Gear> | undefined | undefined;
	}
	export interface SelectedGear extends SelectedItemClass {
		gear: { airAssets: string[]; category: string; subcategory: string | undefined };
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

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Gear:createGearClassForResource",
				path: `/gear/resource-id/${encodeURIComponent(args.params.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:Gear:createGearClassForResource",
				body: args.data,
			});
		}
		async updateGearClassForResource(
			args: UpdateGearClassForResourceArgs,
			options?: RequestOptions,
		): Promise<SelectedGear> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:Gear:updateGearClassForResource",
				path: `/gear/class-id/${encodeURIComponent(args.params.classId)}`,
				retryKey: options?.retryKey ?? "ContentService:Gear:updateGearClassForResource",
				body: args.data,
			});
		}
		async getGear(args: GetGearArgs["params"], options?: RequestOptions): Promise<SelectedGear[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Gear:getGear",
				path: `/gear/resource-id/${encodeURIComponent(args.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:Gear:getGear",
			});
		}
		async getUserGear(args?: GetUserGearArgs["query"], options?: RequestOptions): Promise<SelectedGearItem[]> {
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
		): Promise<SelectedGearItem[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Gear:getUserGearForResource",
				path: `/gear/uid/${encodeURIComponent(args.params.uid)}`,
				retryKey: options?.retryKey ?? "ContentService:Gear:getUserGearForResource",
				query: args.query,
			});
		}
		async grantGear(args: GrantGearArgs["params"], options?: RequestOptions): Promise<SelectedGearItem> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Gear:grantGear",
				path: `/gear/uid/${encodeURIComponent(args.uid)}/class-id/${encodeURIComponent(args.classId)}`,
				retryKey: options?.retryKey ?? "ContentService:Gear:grantGear",
			});
		}
		async deleteGear(args: DeleteGearArgs["params"], options?: RequestOptions): Promise<SelectedGearItem> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:Gear:deleteGear",
				path: `/gear/item-id/${encodeURIComponent(args.itemId)}`,
				retryKey: options?.retryKey ?? "ContentService:Gear:deleteGear",
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
		archivedAt: string | undefined;
		gear: Partial<ContentServicePrisma.Gear> | undefined | undefined;
	}
	export interface PublicImageResource {
		imageId: string;
		name: string | undefined;
		description: string | undefined;
		size: number;
		createdAt: string;
	}
	export interface SignedImageUrl extends PublicImageResource {
		url: string;
	}

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async createItemClassForResource(
			args: CreateItemClassForResourceArgs,
			options?: RequestOptions,
		): Promise<SelectedItemClass> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:ItemClasses:createItemClassForResource",
				path: `/item-classes/resource-id/${encodeURIComponent(args.params.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:ItemClasses:createItemClassForResource",
				body: args.data,
			});
		}
		async updateClassForResource(
			args: UpdateClassForResourceArgs,
			options?: RequestOptions,
		): Promise<SelectedItemClass> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:ItemClasses:updateClassForResource",
				path: `/item-classes/class-id/${encodeURIComponent(args.params.classId)}`,
				retryKey: options?.retryKey ?? "ContentService:ItemClasses:updateClassForResource",
				body: args.data,
			});
		}
		async getItemClassesForResource(
			args: GetItemClassesForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<SelectedItemClass[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:ItemClasses:getItemClassesForResource",
				path: `/item-classes/resource-id/${encodeURIComponent(args.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:ItemClasses:getItemClassesForResource",
			});
		}
		async uploadItemImageForResource(
			args: UploadItemImageForResourceArgs,
			options?: RequestOptions,
		): Promise<SignedImageUrl> {
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

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async createTagForResource(args: CreateTagForResourceArgs, options?: RequestOptions): Promise<SelectedItemTag> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "ContentService:ItemTags:createTagForResource",
				path: `/item-tags/resource-id/${encodeURIComponent(args.params.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:ItemTags:createTagForResource",
				body: args.data,
			});
		}
		async getItemTagsForResource(
			args: GetItemTagsForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<SelectedItemTag[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:ItemTags:getItemTagsForResource",
				path: `/item-tags/resource-id/${encodeURIComponent(args.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:ItemTags:getItemTagsForResource",
			});
		}
		async deleteTagForResource(
			args: DeleteTagForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<SelectedItemTag> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:ItemTags:deleteTagForResource",
				path: `/item-tags/resource-id/${encodeURIComponent(args.resourceId)}/tag-name/${encodeURIComponent(
					args.tagName,
				)}`,
				retryKey: options?.retryKey ?? "ContentService:ItemTags:deleteTagForResource",
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

	export interface ClientSpec {
		trade(args: TradeArgs["data"], options?: RequestOptions): Promise<ContentServicePrisma.Transaction>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async trade(args: TradeArgs["data"], options?: RequestOptions): Promise<ContentServicePrisma.Transaction> {
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
// ====+==== Items TYPES ====+====
export namespace ContentServiceItems {
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
		archivedAt: string | undefined;
		gear: Partial<ContentServicePrisma.Gear> | undefined | undefined;
	}
	export interface SelectedItem {
		class: SelectedItemClass;
		ownerId: string;
		instanceId: string;
		float: number;
		createdAt: string;
	}

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async grantItemForResource(
			args: GrantItemForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<SelectedItem> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Items:grantItemForResource",
				path: `/items/uid/${encodeURIComponent(args.uid)}/class-id/${encodeURIComponent(args.classId)}`,
				retryKey: options?.retryKey ?? "ContentService:Items:grantItemForResource",
			});
		}
		async deleteItemForResource(
			args: DeleteItemForResourceArgs["params"],
			options?: RequestOptions,
		): Promise<SelectedItem> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:Items:deleteItemForResource",
				path: `/items/item-id/${encodeURIComponent(args.itemId)}`,
				retryKey: options?.retryKey ?? "ContentService:Items:deleteItemForResource",
			});
		}
		async getUserInventory(
			args?: GetUserInventoryArgs["query"],
			options?: RequestOptions,
		): Promise<SelectedItem[]> {
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
		): Promise<SelectedItem[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Items:getUserInventoryForResource",
				path: `/items/uid/${encodeURIComponent(args.params.uid)}`,
				retryKey: options?.retryKey ?? "ContentService:Items:getUserInventoryForResource",
				query: args.query,
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
		archivedAt: string | undefined;
		gear: Partial<ContentServicePrisma.Gear> | undefined | undefined;
	}
	export interface SelectedItem {
		class: SelectedItemClass;
		ownerId: string;
		instanceId: string;
		float: number;
		createdAt: string;
	}
	export interface SelectedGear extends SelectedItemClass {
		gear: { airAssets: string[]; category: string; subcategory: string | undefined };
	}
	export interface SelectedGearItem extends SelectedItem {
		class: SelectedGear;
	}
	export interface SelectedOutfit {
		outfitId: string;
		name: string;
		skinColor: string;
		gear: SelectedGearItem[];
		metadata: unknown | undefined;
		equipped: boolean;
		createdAt: string;
	}

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async getOutfits(options?: RequestOptions): Promise<SelectedOutfit[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Outfits:getOutfits",
				path: `/outfits/`,
				retryKey: options?.retryKey ?? "ContentService:Outfits:getOutfits",
			});
		}
		async getActiveOutfit(options?: RequestOptions): Promise<{ outfit: SelectedOutfit | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Outfits:getActiveOutfit",
				path: `/outfits/equipped/self`,
				retryKey: options?.retryKey ?? "ContentService:Outfits:getActiveOutfit",
			});
		}
		async getUserActiveOutfit(
			args: GetUserActiveOutfitArgs["params"],
			options?: RequestOptions,
		): Promise<{ outfit: SelectedOutfit | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Outfits:getUserActiveOutfit",
				path: `/outfits/uid/${encodeURIComponent(args.uid)}/equipped`,
				retryKey: options?.retryKey ?? "ContentService:Outfits:getUserActiveOutfit",
			});
		}
		async getOutfit(
			args: GetOutfitArgs["params"],
			options?: RequestOptions,
		): Promise<{ outfit: SelectedOutfit | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Outfits:getOutfit",
				path: `/outfits/outfit-id/${encodeURIComponent(args.outfitId)}`,
				retryKey: options?.retryKey ?? "ContentService:Outfits:getOutfit",
			});
		}
		async loadOutfit(
			args: LoadOutfitArgs["params"],
			options?: RequestOptions,
		): Promise<{ outfit: SelectedOutfit }> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Outfits:loadOutfit",
				path: `/outfits/outfit-id/${encodeURIComponent(args.outfitId)}/equip`,
				retryKey: options?.retryKey ?? "ContentService:Outfits:loadOutfit",
			});
		}
		async createOutfit(
			args: CreateOutfitArgs["data"],
			options?: RequestOptions,
		): Promise<{ outfit: SelectedOutfit }> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:Outfits:createOutfit",
				path: `/outfits/`,
				retryKey: options?.retryKey ?? "ContentService:Outfits:createOutfit",
				body: args,
			});
		}
		async updateOutfit(args: UpdateOutfitArgs, options?: RequestOptions): Promise<{ outfit: SelectedOutfit }> {
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
		query: {
			includeInactiveMembers: any;
		};
	};
	export interface OrganizationRolePermissionsData {
		permissions: PermissionEntry;
		schemaVersion: 0;
	}
	export type Override<SourceType, ReplacementType, OmitKeys extends keyof SourceType = never> = Omit<
		SourceType,
		(keyof ReplacementType & keyof SourceType) | OmitKeys
	> &
		ReplacementType;
	export type PublicOrganizationRole = Override<
		ContentServicePrisma.OrganizationRole,
		{ permissionsData: OrganizationRolePermissionsData }
	>;
	export type PublicOrganizationRoleWithMembers = PublicOrganizationRole & { members: { uid: string }[] };

	export interface ClientSpec {
		createRole(args: CreateRoleArgs, options?: RequestOptions): Promise<{ role: PublicOrganizationRole }>;
		updateRole(args: UpdateRoleArgs, options?: RequestOptions): Promise<{ role: PublicOrganizationRole }>;
		deleteRole(
			args: DeleteRoleArgs["params"],
			options?: RequestOptions,
		): Promise<{ role: PublicOrganizationRole | undefined }>;
		getRoles(args: GetRolesArgs, options?: RequestOptions): Promise<{ roles: PublicOrganizationRoleWithMembers[] }>;
	}

	export class Client implements ClientSpec {
		private readonly makeRequest: MakeRequest;

		constructor(makeRequest: MakeRequest) {
			this.makeRequest = makeRequest;
		}

		async createRole(args: CreateRoleArgs, options?: RequestOptions): Promise<{ role: PublicOrganizationRole }> {
			return await this.makeRequest({
				method: "POST",
				routeId: "ContentService:OrganizationRoles:createRole",
				path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}/create`,
				retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:createRole",
				body: args.data,
			});
		}
		async updateRole(args: UpdateRoleArgs, options?: RequestOptions): Promise<{ role: PublicOrganizationRole }> {
			return await this.makeRequest({
				method: "PUT",
				routeId: "ContentService:OrganizationRoles:updateRole",
				path: `/organizations/roles/organization-id/${encodeURIComponent(
					args.params.orgId,
				)}/role-name/${encodeURIComponent(args.params.roleName)}`,
				retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:updateRole",
				body: args.data,
			});
		}
		async deleteRole(
			args: DeleteRoleArgs["params"],
			options?: RequestOptions,
		): Promise<{ role: PublicOrganizationRole | undefined }> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:OrganizationRoles:deleteRole",
				path: `/organizations/roles/organization-id/${encodeURIComponent(
					args.orgId,
				)}/role-name/${encodeURIComponent(args.roleName)}`,
				retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:deleteRole",
			});
		}
		async getRoles(
			args: GetRolesArgs,
			options?: RequestOptions,
		): Promise<{ roles: PublicOrganizationRoleWithMembers[] }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:OrganizationRoles:getRoles",
				path: `/organizations/roles/organization-id/${encodeURIComponent(args.params.orgId)}`,
				retryKey: options?.retryKey ?? "ContentService:OrganizationRoles:getRoles",
				query: args.query,
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

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Products:createProduct",
				path: `/shop/products/`,
				retryKey: options?.retryKey ?? "ContentService:Products:createProduct",
				body: args,
			});
		}
		async updateProduct(
			args: UpdateProductArgs,
			options?: RequestOptions,
		): Promise<{ product: CurrencyProductWithItems }> {
			return await this.makeRequest({
				method: "PATCH",
				routeId: "ContentService:Products:updateProduct",
				path: `/shop/products/product-id/${encodeURIComponent(args.params.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Products:updateProduct",
				body: args.data,
			});
		}
		async deleteProduct(
			args: DeleteProductArgs["params"],
			options?: RequestOptions,
		): Promise<{ product: CurrencyProductWithItems }> {
			return await this.makeRequest({
				method: "DELETE",
				routeId: "ContentService:Products:deleteProduct",
				path: `/shop/products/product-id/${encodeURIComponent(args.id)}`,
				retryKey: options?.retryKey ?? "ContentService:Products:deleteProduct",
			});
		}
		async getProducts(
			args: GetProductsArgs["query"],
			options?: RequestOptions,
		): Promise<CurrencyProductWithItems[]> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Products:getProducts",
				path: `/shop/products/`,
				retryKey: options?.retryKey ?? "ContentService:Products:getProducts",
				query: args,
			});
		}
		async getProduct(
			args: GetProductArgs["params"],
			options?: RequestOptions,
		): Promise<{ product: CurrencyProductWithItems | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:Products:getProduct",
				path: `/shop/products/product-id/${encodeURIComponent(args.productId)}`,
				retryKey: options?.retryKey ?? "ContentService:Products:getProduct",
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

	export interface ClientSpec {
		validatePurchase(args: ValidatePurchaseArgs["data"], options?: RequestOptions): Promise<ValidatedPurchase>;
		purchase(args: PurchaseArgs["data"], options?: RequestOptions): Promise<{ receiptId: string }>;
		claimReceipt(args: ClaimReceiptArgs["data"], options?: RequestOptions): Promise<ClaimedCurrencyTransaction>;
		completeReceipt(args: CompleteReceiptArgs["data"], options?: RequestOptions): Promise<void>;
	}

	export class Client implements ClientSpec {
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
				routeId: "ContentService:Purchase:validatePurchase",
				path: `/shop/purchase/validate`,
				retryKey: options?.retryKey ?? "ContentService:Purchase:validatePurchase",
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
		async claimReceipt(
			args: ClaimReceiptArgs["data"],
			options?: RequestOptions,
		): Promise<ClaimedCurrencyTransaction> {
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

	export interface ClientSpec {
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

	export class Client implements ClientSpec {
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
				routeId: "ContentService:ShopTransactions:getTransactionsForResource",
				path: `/shop/transactions/resource-id/${encodeURIComponent(args.params.resourceId)}`,
				retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getTransactionsForResource",
				query: args.query,
			});
		}
		async getResourceTransaction(
			args: GetResourceTransactionArgs["params"],
			options?: RequestOptions,
		): Promise<{ transaction: ContentServicePrisma.CurrencyTransaction | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:ShopTransactions:getResourceTransaction",
				path: `/shop/transactions/resource-id/${encodeURIComponent(
					args.resourceId,
				)}/transaction-id/${encodeURIComponent(args.transactionId)}`,
				retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getResourceTransaction",
			});
		}
		async getUserTransactions(
			args?: GetUserTransactionsArgs["query"],
			options?: RequestOptions,
		): Promise<{ cursor?: string; results: ContentServicePrisma.CurrencyTransaction[] }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:ShopTransactions:getUserTransactions",
				path: `/shop/transactions/self`,
				retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getUserTransactions",
				query: args,
			});
		}
		async getTransactionForProduct(
			args: GetTransactionForProductArgs["params"],
			options?: RequestOptions,
		): Promise<{ transaction: ContentServicePrisma.CurrencyTransaction | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:ShopTransactions:getTransactionForProduct",
				path: `/shop/transactions/user-id/${encodeURIComponent(args.userId)}/product-id/${encodeURIComponent(
					args.productId,
				)}`,
				retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getTransactionForProduct",
			});
		}
		async getRefundDetails(
			args: GetRefundDetailsArgs["params"],
			options?: RequestOptions,
		): Promise<{ details: RefundDetails | undefined }> {
			return await this.makeRequest({
				method: "GET",
				routeId: "ContentService:ShopTransactions:getRefundDetails",
				path: `/shop/transactions/transaction-id/${encodeURIComponent(args.transactionId)}/refund/details`,
				retryKey: options?.retryKey ?? "ContentService:ShopTransactions:getRefundDetails",
			});
		}
		async refundTransaction(
			args: RefundTransactionArgs["data"],
			options?: RequestOptions,
		): Promise<{ summary: CurrencyTransactionWithSummary | undefined }> {
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

export interface ContentServiceClientSpec {
	artifacts: ContentServiceArtifacts.ClientSpec;
	currency: ContentServiceCurrency.ClientSpec;
	favorites: ContentServiceFavorites.ClientSpec;
	games: ContentServiceGames.ClientSpec;
	images: ContentServiceImages.ClientSpec;
	memberships: ContentServiceMemberships.ClientSpec;
	organizations: ContentServiceOrganizations.ClientSpec;
	packages: ContentServicePackages.ClientSpec;
	payments: ContentServicePayments.ClientSpec;
	payouts: ContentServicePayouts.ClientSpec;
	permissions: ContentServicePermissions.ClientSpec;
	webhooks: ContentServiceWebhooks.ClientSpec;
	gear: ContentServiceGear.ClientSpec;
	itemClasses: ContentServiceItemClasses.ClientSpec;
	itemTags: ContentServiceItemTags.ClientSpec;
	itemTransactions: ContentServiceItemTransactions.ClientSpec;
	items: ContentServiceItems.ClientSpec;
	outfits: ContentServiceOutfits.ClientSpec;
	organizationRoles: ContentServiceOrganizationRoles.ClientSpec;
	products: ContentServiceProducts.ClientSpec;
	purchase: ContentServicePurchase.ClientSpec;
	shopTransactions: ContentServiceShopTransactions.ClientSpec;
}

export class ContentServiceClient implements ContentServiceClientSpec {
	public readonly artifacts: ContentServiceArtifacts.ClientSpec;
	public readonly currency: ContentServiceCurrency.ClientSpec;
	public readonly favorites: ContentServiceFavorites.ClientSpec;
	public readonly games: ContentServiceGames.ClientSpec;
	public readonly images: ContentServiceImages.ClientSpec;
	public readonly memberships: ContentServiceMemberships.ClientSpec;
	public readonly organizations: ContentServiceOrganizations.ClientSpec;
	public readonly packages: ContentServicePackages.ClientSpec;
	public readonly payments: ContentServicePayments.ClientSpec;
	public readonly payouts: ContentServicePayouts.ClientSpec;
	public readonly permissions: ContentServicePermissions.ClientSpec;
	public readonly webhooks: ContentServiceWebhooks.ClientSpec;
	public readonly gear: ContentServiceGear.ClientSpec;
	public readonly itemClasses: ContentServiceItemClasses.ClientSpec;
	public readonly itemTags: ContentServiceItemTags.ClientSpec;
	public readonly itemTransactions: ContentServiceItemTransactions.ClientSpec;
	public readonly items: ContentServiceItems.ClientSpec;
	public readonly outfits: ContentServiceOutfits.ClientSpec;
	public readonly organizationRoles: ContentServiceOrganizationRoles.ClientSpec;
	public readonly products: ContentServiceProducts.ClientSpec;
	public readonly purchase: ContentServicePurchase.ClientSpec;
	public readonly shopTransactions: ContentServiceShopTransactions.ClientSpec;

	constructor(makeRequest: MakeRequest) {
		this.artifacts = new ContentServiceArtifacts.Client(makeRequest);
		this.currency = new ContentServiceCurrency.Client(makeRequest);
		this.favorites = new ContentServiceFavorites.Client(makeRequest);
		this.games = new ContentServiceGames.Client(makeRequest);
		this.images = new ContentServiceImages.Client(makeRequest);
		this.memberships = new ContentServiceMemberships.Client(makeRequest);
		this.organizations = new ContentServiceOrganizations.Client(makeRequest);
		this.packages = new ContentServicePackages.Client(makeRequest);
		this.payments = new ContentServicePayments.Client(makeRequest);
		this.payouts = new ContentServicePayouts.Client(makeRequest);
		this.permissions = new ContentServicePermissions.Client(makeRequest);
		this.webhooks = new ContentServiceWebhooks.Client(makeRequest);
		this.gear = new ContentServiceGear.Client(makeRequest);
		this.itemClasses = new ContentServiceItemClasses.Client(makeRequest);
		this.itemTags = new ContentServiceItemTags.Client(makeRequest);
		this.itemTransactions = new ContentServiceItemTransactions.Client(makeRequest);
		this.items = new ContentServiceItems.Client(makeRequest);
		this.outfits = new ContentServiceOutfits.Client(makeRequest);
		this.organizationRoles = new ContentServiceOrganizationRoles.Client(makeRequest);
		this.products = new ContentServiceProducts.Client(makeRequest);
		this.purchase = new ContentServicePurchase.Client(makeRequest);
		this.shopTransactions = new ContentServiceShopTransactions.Client(makeRequest);
	}
}
