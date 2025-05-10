import { encodeURIComponent } from "./UnityMakeRequest";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HttpRequestParams<Query extends Record<string, string | number | boolean | readonly string[]> = {}> {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "TRACE" | "HEAD";
    path: string;

    query?: Query;
    body?: unknown;

    retryKey?: string;
}

export interface RequestOptions {
    retryKey?: string;
}

export type MakeRequest = <T>(request: HttpRequestParams) => Promise<T>;

// ====+==== PRISMA TYPES ====+====
export namespace DataStoreServicePrisma {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const BlobLockMode = {
        WRITE: "WRITE",
        READ_WRITE: "READ_WRITE",
    } as const;
    export type BlobLockMode = (typeof BlobLockMode)[keyof typeof BlobLockMode];
    export type Leaderboard = {
        leaderboardId: string;
        game: string;
        operator: string;
        sortOrder: number;
        createdAt: string;
    };
}
// ====+==== Cache TYPES ====+====
export namespace DataStoreServiceCache {
    export interface QueryExpiryDTO {
        expiry?: number;
    }
    export type GetArgs = {
        params: {
            key: string;
        };
        query?: QueryExpiryDTO;
    };
    export interface SetDataQueryDto extends QueryExpiryDTO {
        nx?: boolean;
        xx?: boolean;
        get?: boolean;
    }
    export interface SetBodyDto<T = unknown> {
        __airship_dto_version__: number;
        data: T;
    }
    export type SetArgs<T = unknown> = {
        params: {
            key: string;
        };
        query?: SetDataQueryDto;
        data: SetBodyDto<T> | unknown;
    };
    export type TtlArgs = {
        params: {
            key: string;
        };
    };
    export interface CacheRecord<T = object> {
        value: T;
        metadata: Record<string | number | symbol, never>;
    }

    export interface DataStoreServiceCacheClient {
        get<T = unknown>(args: GetArgs, options?: RequestOptions): Promise<{ record: CacheRecord<T> | undefined }>;
        set<T = unknown>(args: SetArgs<T>, options?: RequestOptions): Promise<{ record: CacheRecord<T> | undefined }>;
        ttl(args: TtlArgs["params"], options?: RequestOptions): Promise<{ ttl: number }>;
    }

    export class DataStoreServiceCacheBaseClient implements DataStoreServiceCacheClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async get<T = unknown>(
            args: GetArgs,
            options?: RequestOptions,
        ): Promise<{ record: CacheRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/cache/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:get",
                query: args.query,
            });
        }
        async set<T = unknown>(
            args: SetArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: CacheRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "POST",
                path: `/cache/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:set",
                query: args.query,
                body: args.data,
            });
        }
        async ttl(args: TtlArgs["params"], options?: RequestOptions): Promise<{ ttl: number }> {
            return await this.makeRequest({
                method: "GET",
                path: `/cache/key/${encodeURIComponent(args.key)}/ttl`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:ttl",
            });
        }
    }
}
// ====+==== Data TYPES ====+====
export namespace DataStoreServiceData {
    export type GetArgs = {
        params: {
            key: string;
        };
    };
    export type GetAsUserArgs = {
        params: {
            key: string;
            gameId: string;
        };
    };
    export interface GetRangeQueryDto {
        prefix?: string;
        limit?: number;
        skip?: number;
        lastKeySeen?: string;
    }
    export type GetRangeAsUserArgs = {
        params: {
            gameId: string;
        };
        query?: GetRangeQueryDto;
    };
    export interface SetBodyDto<T = unknown> {
        __airship_dto_version__: number;
        data: T;
    }
    export type SetArgs<T = unknown> = {
        params: {
            key: string;
        };
        data: SetBodyDto<T> | unknown;
        query?: {
            etag?: string;
        };
    };
    export type SetAsUserArgs<T = unknown> = {
        params: {
            key: string;
            gameId: string;
        };
        data: SetBodyDto<T> | unknown;
        query?: {
            etag?: string;
        };
    };
    export type DeleteArgs = {
        params: {
            key: string;
        };
        query?: {
            etag?: string;
        };
    };
    export type DeleteAsUserArgs = {
        params: {
            key: string;
            gameId: string;
        };
        query?: {
            etag?: string;
        };
    };
    export interface SetLockDto {
        mode?: DataStoreServicePrisma.BlobLockMode;
        forceIfWriterId?: string;
    }
    export type SetLockArgs = {
        params: {
            key: string;
        };
        data: SetLockDto;
    };
    export type GetLockArgs = {
        params: {
            key: string;
        };
    };
    export interface LockData {
        ownerId: string;
        mode: DataStoreServicePrisma.BlobLockMode;
        lockedAt: string;
        lastUpdated: string;
    }
    export interface BlobDataRecord<T = unknown> {
        value: T;
        metadata: { etag: string; createdAt: string; lastUpdated: string | undefined; lockData?: LockData };
    }

    export interface DataStoreServiceDataClient {
        get<T = unknown>(
            args: GetArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }>;
        getAsUser<T = unknown>(
            args: GetAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }>;
        getRangeAsUser(
            args: GetRangeAsUserArgs,
            options?: RequestOptions,
        ): Promise<(Omit<BlobDataRecord, "value"> & { key: string })[]>;
        set<T = unknown>(args: SetArgs<T>, options?: RequestOptions): Promise<{ record: BlobDataRecord<T> }>;
        setAsUser<T = unknown>(
            args: SetAsUserArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> }>;
        delete<T = unknown>(
            args: DeleteArgs,
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }>;
        deleteAsUser<T = unknown>(
            args: DeleteAsUserArgs,
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }>;
        setLock(args: SetLockArgs, options?: RequestOptions): Promise<{ success: boolean }>;
        getLock(
            args: GetLockArgs["params"],
            options?: RequestOptions,
        ): Promise<{ locked: boolean; lockData?: LockData }>;
    }

    export class DataStoreServiceDataBaseClient implements DataStoreServiceDataClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async get<T = unknown>(
            args: GetArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/data/key/${encodeURIComponent(args.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:get",
            });
        }
        async getAsUser<T = unknown>(
            args: GetAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/data/game-id/${encodeURIComponent(args.gameId)}/key/${encodeURIComponent(args.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:getAsUser",
            });
        }
        async getRangeAsUser(
            args: GetRangeAsUserArgs,
            options?: RequestOptions,
        ): Promise<(Omit<BlobDataRecord, "value"> & { key: string })[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:getRangeAsUser",
                query: args.query,
            });
        }
        async set<T = unknown>(args: SetArgs<T>, options?: RequestOptions): Promise<{ record: BlobDataRecord<T> }> {
            return await this.makeRequest({
                method: "POST",
                path: `/data/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:set",
                query: args.query,
                body: args.data,
            });
        }
        async setAsUser<T = unknown>(
            args: SetAsUserArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> }> {
            return await this.makeRequest({
                method: "POST",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:setAsUser",
                query: args.query,
                body: args.data,
            });
        }
        async delete<T = unknown>(
            args: DeleteArgs,
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/data/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:delete",
                query: args.query,
            });
        }
        async deleteAsUser<T = unknown>(
            args: DeleteAsUserArgs,
            options?: RequestOptions,
        ): Promise<{ record: BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:deleteAsUser",
                query: args.query,
            });
        }
        async setLock(args: SetLockArgs, options?: RequestOptions): Promise<{ success: boolean }> {
            return await this.makeRequest({
                method: "POST",
                path: `/data/key/${encodeURIComponent(args.params.key)}/lock`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:setLock",
                body: args.data,
            });
        }
        async getLock(
            args: GetLockArgs["params"],
            options?: RequestOptions,
        ): Promise<{ locked: boolean; lockData?: LockData }> {
            return await this.makeRequest({
                method: "GET",
                path: `/data/key/${encodeURIComponent(args.key)}/lock`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:getLock",
            });
        }
    }
}
// ====+==== Leaderboards TYPES ====+====
export namespace DataStoreServiceLeaderboards {
    export const operators = ["SET", "ADD", "SUB"] as const;
    export type OperatorIndexType = (typeof operators)[number];
    export interface CreateLeaderboardDto {
        operator: OperatorIndexType;
        sortOrder: "ASC" | "DESC" | 1 | -1;
    }
    export type CreateLeaderboardArgs = {
        params: {
            leaderboardId: string;
            gameId: string;
        };
        data: CreateLeaderboardDto;
    };
    export type DeleteLeaderboardArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
        };
    };
    export type PushStatsType = { [id: string]: number };
    export interface PushStatsContainerDto {
        stats: PushStatsType;
    }
    export type PostLeaderboardStatsArgs = {
        params: {
            leaderboardId: string;
        };
        data: PushStatsContainerDto;
    };
    export type DeleteStatArgs = {
        params: {
            leaderboardId: string;
            id: string;
        };
    };
    export interface BatchDeleteStatsDto {
        ids: string[];
    }
    export type DeleteStatsArgs = {
        params: {
            leaderboardId: string;
        };
        data: BatchDeleteStatsDto;
    };
    export type GetRankingArgs = {
        params: {
            leaderboardId: string;
            id: string;
        };
    };
    export interface QueryRequestLimitsDto {
        skip?: number;
        limit?: number;
    }
    export type GetRankingsArgs = {
        params: {
            leaderboardId: string;
        };
        query?: QueryRequestLimitsDto;
    };
    export type GetLeaderboardsArgs = {
        params: {
            gameId: string;
        };
    };
    export type ResetLeaderboardArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
        };
    };
    export interface LeaderboardStats {
        [id: string]: number;
    }
    export interface Ranking {
        id: string;
        value: number;
        rank: number;
    }

    export interface DataStoreServiceLeaderboardsClient {
        createLeaderboard(
            args: CreateLeaderboardArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServicePrisma.Leaderboard[]>;
        deleteLeaderboard(
            args: DeleteLeaderboardArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServicePrisma.Leaderboard[]>;
        postLeaderboardStats(args: PostLeaderboardStatsArgs, options?: RequestOptions): Promise<LeaderboardStats>;
        deleteStat(args: DeleteStatArgs["params"], options?: RequestOptions): Promise<void>;
        deleteStats(args: DeleteStatsArgs, options?: RequestOptions): Promise<void>;
        getRanking(args: GetRankingArgs["params"], options?: RequestOptions): Promise<{ ranking: Ranking | undefined }>;
        getRankings(args: GetRankingsArgs, options?: RequestOptions): Promise<Ranking[]>;
        getLeaderboards(
            args: GetLeaderboardsArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServicePrisma.Leaderboard[]>;
        resetLeaderboard(args: ResetLeaderboardArgs["params"], options?: RequestOptions): Promise<void>;
    }

    export class DataStoreServiceLeaderboardsBaseClient implements DataStoreServiceLeaderboardsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createLeaderboard(
            args: CreateLeaderboardArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServicePrisma.Leaderboard[]> {
            return await this.makeRequest({
                method: "POST",
                path: `/leaderboards/game-id/${encodeURIComponent(args.params.gameId)}/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/create`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:createLeaderboard",
                body: args.data,
            });
        }
        async deleteLeaderboard(
            args: DeleteLeaderboardArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServicePrisma.Leaderboard[]> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}/leaderboard-id/${encodeURIComponent(args.leaderboardId)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteLeaderboard",
            });
        }
        async postLeaderboardStats(
            args: PostLeaderboardStatsArgs,
            options?: RequestOptions,
        ): Promise<LeaderboardStats> {
            return await this.makeRequest({
                method: "POST",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/stats`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:postLeaderboardStats",
                body: args.data,
            });
        }
        async deleteStat(args: DeleteStatArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/id/${encodeURIComponent(args.id)}/stats`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteStat",
            });
        }
        async deleteStats(args: DeleteStatsArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/stats/batch-delete`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteStats",
                body: args.data,
            });
        }
        async getRanking(
            args: GetRankingArgs["params"],
            options?: RequestOptions,
        ): Promise<{ ranking: Ranking | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/id/${encodeURIComponent(args.id)}/ranking`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getRanking",
            });
        }
        async getRankings(args: GetRankingsArgs, options?: RequestOptions): Promise<Ranking[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/rankings`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getRankings",
                query: args.query,
            });
        }
        async getLeaderboards(
            args: GetLeaderboardsArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServicePrisma.Leaderboard[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getLeaderboards",
            });
        }
        async resetLeaderboard(args: ResetLeaderboardArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/reset`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:resetLeaderboard",
            });
        }
    }
}

export interface DataStoreServiceClient {
    cache: DataStoreServiceCache.DataStoreServiceCacheClient;
    data: DataStoreServiceData.DataStoreServiceDataClient;
    leaderboards: DataStoreServiceLeaderboards.DataStoreServiceLeaderboardsClient;
}

export class DataStoreServiceBaseClient implements DataStoreServiceClient {
    public readonly cache: DataStoreServiceCache.DataStoreServiceCacheClient;
    public readonly data: DataStoreServiceData.DataStoreServiceDataClient;
    public readonly leaderboards: DataStoreServiceLeaderboards.DataStoreServiceLeaderboardsClient;

    constructor(makeRequest: MakeRequest) {
        this.cache = new DataStoreServiceCache.DataStoreServiceCacheBaseClient(makeRequest);
        this.data = new DataStoreServiceData.DataStoreServiceDataBaseClient(makeRequest);
        this.leaderboards = new DataStoreServiceLeaderboards.DataStoreServiceLeaderboardsBaseClient(makeRequest);
    }
}
