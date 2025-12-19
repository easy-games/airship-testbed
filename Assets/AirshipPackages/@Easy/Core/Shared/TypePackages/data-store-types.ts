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
export namespace DataStoreServiceDatabaseTypes {
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

// ====+==== Internal Types ====+====
export namespace InternalDataStoreServiceTypes {
    export type Override<SourceType, ReplacementType, OmitKeys extends keyof SourceType = never> = Omit<
        SourceType,
        (keyof ReplacementType & keyof SourceType) | OmitKeys
    > &
        ReplacementType;
}

// ====+==== Cache Types ====+====
export namespace DataStoreServiceCache {
    export interface CacheRecord<T = object> {
        value: T;
        metadata: Record<string | number | symbol, never>;
    }

    export interface DelDataQueryDto {
        get?: boolean;
    }

    export type DeleteArgs = {
        params: {
            key: string;
        };
        query?: DataStoreServiceCache.DelDataQueryDto;
    };

    export type GetArgs = {
        params: {
            key: string;
        };
        query?: DataStoreServiceCache.QueryExpiryDTO;
    };

    export interface QueryExpiryDTO {
        expiry?: number;
    }

    export type SetArgs<T = unknown> = {
        params: {
            key: string;
        };
        query?: DataStoreServiceCache.SetDataQueryDto;
        data: DataStoreServiceCache.SetBodyDto<T> | unknown;
    };

    export interface SetBodyDto<T = unknown> {
        __airship_dto_version__: number;
        data: T;
    }

    export interface SetDataQueryDto extends DataStoreServiceCache.QueryExpiryDTO {
        nx?: boolean;
        xx?: boolean;
        get?: boolean;
    }

    export type TtlArgs = {
        params: {
            key: string;
        };
    };

    export interface ClientSpec {
        delete<T = unknown>(
            args: DeleteArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceCache.CacheRecord<T> | undefined }>;
        get<T = unknown>(
            args: GetArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceCache.CacheRecord<T> | undefined }>;
        set<T = unknown>(
            args: SetArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceCache.CacheRecord<T> | undefined }>;
        ttl(args: TtlArgs["params"], options?: RequestOptions): Promise<{ ttl: number }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async delete<T = unknown>(
            args: DeleteArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceCache.CacheRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Cache:delete",
                path: `/cache/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:delete",
                query: args.query,
            });
        }
        async get<T = unknown>(
            args: GetArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceCache.CacheRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Cache:get",
                path: `/cache/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:get",
                query: args.query,
            });
        }
        async set<T = unknown>(
            args: SetArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceCache.CacheRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Cache:set",
                path: `/cache/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:set",
                query: args.query,
                body: args.data,
            });
        }
        async ttl(args: TtlArgs["params"], options?: RequestOptions): Promise<{ ttl: number }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Cache:ttl",
                path: `/cache/key/${encodeURIComponent(args.key)}/ttl`,
                retryKey: options?.retryKey ?? "DataStoreService:Cache:ttl",
            });
        }
    }
}

// ====+==== Data Types ====+====
export namespace DataStoreServiceData {
    export type BlobDataMetadata = Omit<DataStoreServiceData.BlobDataRecord, "value"> & { key: string };

    export interface BlobDataRecord<T = unknown> {
        value: T;
        metadata: {
            etag: string;
            createdAt: string;
            lastUpdated: string | undefined;
            lockData?: DataStoreServiceData.LockData;
        };
    }

    export type BustLockArgs = {
        params: {
            gameId: string;
            key: string;
        };
        query: {
            etag: string;
            fromWriterId: string;
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

    export type GetLockArgs = {
        params: {
            key: string;
        };
    };

    export type GetRangeAsUserArgs = {
        params: {
            gameId: string;
        };
        query?: DataStoreServiceData.GetRangeQueryDto;
    };

    export interface GetRangeQueryDto {
        prefix?: string;
        limit?: number;
        skip?: number;
        lastKeySeen?: string;
    }

    export type IsDataLocked = { locked: false } | { locked: true; lockData: DataStoreServiceData.LockData };

    export interface LockData {
        ownerId: string;
        mode: DataStoreServiceDatabaseTypes.BlobLockMode;
        lockedAt: string;
        lastUpdated: string;
    }

    export type SetArgs<T = unknown> = {
        params: {
            key: string;
        };
        data: DataStoreServiceData.SetBodyDto<T> | unknown;
        query?: {
            etag?: string;
        };
    };

    export type SetAsUserArgs<T = unknown> = {
        params: {
            key: string;
            gameId: string;
        };
        data: DataStoreServiceData.SetBodyDto<T> | unknown;
        query?: {
            etag?: string;
        };
    };

    export interface SetBodyDto<T = unknown> {
        __airship_dto_version__: number;
        data: T;
    }

    export type SetLockArgs = {
        params: {
            key: string;
        };
        data: DataStoreServiceData.SetLockDto;
    };

    export interface SetLockDto {
        mode?: DataStoreServiceDatabaseTypes.BlobLockMode;
        forceIfWriterId?: string;
    }

    export interface ClientSpec {
        bustLock<T = unknown>(
            args: BustLockArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }>;
        delete<T = unknown>(
            args: DeleteArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }>;
        deleteAsUser<T = unknown>(
            args: DeleteAsUserArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }>;
        get<T = unknown>(
            args: GetArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }>;
        getAsUser<T = unknown>(
            args: GetAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }>;
        getLock(args: GetLockArgs["params"], options?: RequestOptions): Promise<DataStoreServiceData.IsDataLocked>;
        getRangeAsUser(
            args: GetRangeAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceData.BlobDataMetadata[]>;
        set<T = unknown>(
            args: SetArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> }>;
        setAsUser<T = unknown>(
            args: SetAsUserArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> }>;
        setLock(args: SetLockArgs, options?: RequestOptions): Promise<{ success: boolean }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async bustLock<T = unknown>(
            args: BustLockArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Data:bustLock",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}/key/${encodeURIComponent(args.params.key)}/lock`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:bustLock",
                query: args.query,
            });
        }
        async delete<T = unknown>(
            args: DeleteArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Data:delete",
                path: `/data/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:delete",
                query: args.query,
            });
        }
        async deleteAsUser<T = unknown>(
            args: DeleteAsUserArgs,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Data:deleteAsUser",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:deleteAsUser",
                query: args.query,
            });
        }
        async get<T = unknown>(
            args: GetArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Data:get",
                path: `/data/key/${encodeURIComponent(args.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:get",
            });
        }
        async getAsUser<T = unknown>(
            args: GetAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Data:getAsUser",
                path: `/data/game-id/${encodeURIComponent(args.gameId)}/key/${encodeURIComponent(args.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:getAsUser",
            });
        }
        async getLock(
            args: GetLockArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServiceData.IsDataLocked> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Data:getLock",
                path: `/data/key/${encodeURIComponent(args.key)}/lock`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:getLock",
            });
        }
        async getRangeAsUser(
            args: GetRangeAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceData.BlobDataMetadata[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Data:getRangeAsUser",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:getRangeAsUser",
                query: args.query,
            });
        }
        async set<T = unknown>(
            args: SetArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Data:set",
                path: `/data/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:set",
                query: args.query,
                body: args.data,
            });
        }
        async setAsUser<T = unknown>(
            args: SetAsUserArgs<T>,
            options?: RequestOptions,
        ): Promise<{ record: DataStoreServiceData.BlobDataRecord<T> }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Data:setAsUser",
                path: `/data/game-id/${encodeURIComponent(args.params.gameId)}/key/${encodeURIComponent(args.params.key)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:setAsUser",
                query: args.query,
                body: args.data,
            });
        }
        async setLock(args: SetLockArgs, options?: RequestOptions): Promise<{ success: boolean }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Data:setLock",
                path: `/data/key/${encodeURIComponent(args.params.key)}/lock`,
                retryKey: options?.retryKey ?? "DataStoreService:Data:setLock",
                body: args.data,
            });
        }
    }
}

// ====+==== Leaderboards Types ====+====
export namespace DataStoreServiceLeaderboards {
    export interface BatchDeleteStatsDto {
        ids: string[];
    }

    export type CreateLeaderboardArgs = {
        params: {
            leaderboardId: string;
            gameId: string;
        };
        data: DataStoreServiceLeaderboards.CreateLeaderboardDto;
    };

    export interface CreateLeaderboardDto {
        operator: DataStoreServiceLeaderboards.OperatorIndexType;
        sortOrder: "ASC" | "DESC" | 1 | -1;
    }

    export type DeleteLeaderboardArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
        };
    };

    export type DeleteStatArgs = {
        params: {
            leaderboardId: string;
            id: string;
        };
    };

    export type DeleteStatAsUserArgs = {
        params: {
            leaderboardId: string;
            gameId: string;
            id: string;
        };
    };

    export type DeleteStatsArgs = {
        params: {
            leaderboardId: string;
        };
        data: DataStoreServiceLeaderboards.BatchDeleteStatsDto;
    };

    export type DeleteStatsAsUserArgs = {
        params: {
            leaderboardId: string;
            gameId: string;
        };
        data: DataStoreServiceLeaderboards.BatchDeleteStatsDto;
    };

    export type GetLeaderboardsArgs = {
        query?: DataStoreServiceLeaderboards.QueryRequestLimitsDto;
    };

    export type GetLeaderboardsAsUserArgs = {
        params: {
            gameId: string;
        };
        query?: DataStoreServiceLeaderboards.QueryRequestLimitsDto;
    };

    export type GetRankingArgs = {
        params: {
            leaderboardId: string;
            id: string;
        };
    };

    export type GetRankingAsUserArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
            id: string;
        };
    };

    export type GetRankingsArgs = {
        params: {
            leaderboardId: string;
        };
        query?: DataStoreServiceLeaderboards.QueryRequestLimitsDto;
    };

    export type GetRankingsAsUserArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
        };
        query?: DataStoreServiceLeaderboards.QueryRequestLimitsDto;
    };

    export interface LeaderboardStats {
        [id: string]: number;
    }

    export type OperatorIndexType = (typeof DataStoreServiceLeaderboards.operators)[number];

    export const operators = ["SET", "ADD", "USE_LATEST"] as const;

    export type PostLeaderboardStatsArgs = {
        params: {
            leaderboardId: string;
        };
        data: DataStoreServiceLeaderboards.PushStatsContainerDto;
    };

    export type PostLeaderboardStatsAsUserArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
        };
        data: DataStoreServiceLeaderboards.PushStatsContainerDto;
    };

    export type PublicLeaderboard = InternalDataStoreServiceTypes.Override<
        DataStoreServiceDatabaseTypes.Leaderboard,
        { sortOrder: -1 | 1; operator: DataStoreServiceLeaderboards.OperatorIndexType }
    >;

    export interface PushStatsContainerDto {
        stats: DataStoreServiceLeaderboards.PushStatsType;
        mode?: "create" | "update" | "upsert" | "push";
    }

    export type PushStatsType = { [id: string]: number };

    export interface QueryRequestLimitsDto {
        skip?: number;
        limit?: number;
    }

    export interface Ranking {
        id: string;
        value: number;
        rank: number;
    }

    export type ResetLeaderboardArgs = {
        params: {
            leaderboardId: string;
        };
    };

    export type ResetLeaderboardAsUserArgs = {
        params: {
            gameId: string;
            leaderboardId: string;
        };
    };

    export interface ClientSpec {
        createLeaderboard(
            args: CreateLeaderboardArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]>;
        deleteLeaderboard(
            args: DeleteLeaderboardArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]>;
        deleteStat(args: DeleteStatArgs["params"], options?: RequestOptions): Promise<void>;
        deleteStatAsUser(args: DeleteStatAsUserArgs["params"], options?: RequestOptions): Promise<void>;
        deleteStats(args: DeleteStatsArgs, options?: RequestOptions): Promise<void>;
        deleteStatsAsUser(args: DeleteStatsAsUserArgs, options?: RequestOptions): Promise<void>;
        getLeaderboards(
            args?: GetLeaderboardsArgs["query"],
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]>;
        getLeaderboardsAsUser(
            args: GetLeaderboardsAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]>;
        getRanking(
            args: GetRankingArgs["params"],
            options?: RequestOptions,
        ): Promise<{ ranking: DataStoreServiceLeaderboards.Ranking | undefined }>;
        getRankingAsUser(
            args: GetRankingAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<{ ranking: DataStoreServiceLeaderboards.Ranking | undefined }>;
        getRankings(args: GetRankingsArgs, options?: RequestOptions): Promise<DataStoreServiceLeaderboards.Ranking[]>;
        getRankingsAsUser(
            args: GetRankingsAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.Ranking[]>;
        postLeaderboardStats(
            args: PostLeaderboardStatsArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.LeaderboardStats>;
        postLeaderboardStatsAsUser(
            args: PostLeaderboardStatsAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.LeaderboardStats>;
        resetLeaderboard(args: ResetLeaderboardArgs["params"], options?: RequestOptions): Promise<void>;
        resetLeaderboardAsUser(args: ResetLeaderboardAsUserArgs["params"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createLeaderboard(
            args: CreateLeaderboardArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:createLeaderboard",
                path: `/leaderboards/game-id/${encodeURIComponent(args.params.gameId)}/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/create`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:createLeaderboard",
                body: args.data,
            });
        }
        async deleteLeaderboard(
            args: DeleteLeaderboardArgs["params"],
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Leaderboards:deleteLeaderboard",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}/leaderboard-id/${encodeURIComponent(args.leaderboardId)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteLeaderboard",
            });
        }
        async deleteStat(args: DeleteStatArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Leaderboards:deleteStat",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/id/${encodeURIComponent(args.id)}/stats`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteStat",
            });
        }
        async deleteStatAsUser(args: DeleteStatAsUserArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "DataStoreService:Leaderboards:deleteStatAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/id/${encodeURIComponent(args.id)}/stats`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteStatAsUser",
            });
        }
        async deleteStats(args: DeleteStatsArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:deleteStats",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/stats/batch-delete`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteStats",
                body: args.data,
            });
        }
        async deleteStatsAsUser(args: DeleteStatsAsUserArgs, options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:deleteStatsAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.params.gameId)}/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/stats/batch-delete`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:deleteStatsAsUser",
                body: args.data,
            });
        }
        async getLeaderboards(
            args?: GetLeaderboardsArgs["query"],
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Leaderboards:getLeaderboards",
                path: `/leaderboards/`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getLeaderboards",
                query: args,
            });
        }
        async getLeaderboardsAsUser(
            args: GetLeaderboardsAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.PublicLeaderboard[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Leaderboards:getLeaderboardsAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.params.gameId)}`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getLeaderboardsAsUser",
                query: args.query,
            });
        }
        async getRanking(
            args: GetRankingArgs["params"],
            options?: RequestOptions,
        ): Promise<{ ranking: DataStoreServiceLeaderboards.Ranking | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Leaderboards:getRanking",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/id/${encodeURIComponent(args.id)}/ranking`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getRanking",
            });
        }
        async getRankingAsUser(
            args: GetRankingAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<{ ranking: DataStoreServiceLeaderboards.Ranking | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Leaderboards:getRankingAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/id/${encodeURIComponent(args.id)}/ranking`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getRankingAsUser",
            });
        }
        async getRankings(
            args: GetRankingsArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.Ranking[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Leaderboards:getRankings",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/rankings`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getRankings",
                query: args.query,
            });
        }
        async getRankingsAsUser(
            args: GetRankingsAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.Ranking[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "DataStoreService:Leaderboards:getRankingsAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.params.gameId)}/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/rankings`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:getRankingsAsUser",
                query: args.query,
            });
        }
        async postLeaderboardStats(
            args: PostLeaderboardStatsArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.LeaderboardStats> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:postLeaderboardStats",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/stats`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:postLeaderboardStats",
                body: args.data,
            });
        }
        async postLeaderboardStatsAsUser(
            args: PostLeaderboardStatsAsUserArgs,
            options?: RequestOptions,
        ): Promise<DataStoreServiceLeaderboards.LeaderboardStats> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:postLeaderboardStatsAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.params.gameId)}/leaderboard-id/${encodeURIComponent(args.params.leaderboardId)}/stats`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:postLeaderboardStatsAsUser",
                body: args.data,
            });
        }
        async resetLeaderboard(args: ResetLeaderboardArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:resetLeaderboard",
                path: `/leaderboards/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/reset`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:resetLeaderboard",
            });
        }
        async resetLeaderboardAsUser(
            args: ResetLeaderboardAsUserArgs["params"],
            options?: RequestOptions,
        ): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "DataStoreService:Leaderboards:resetLeaderboardAsUser",
                path: `/leaderboards/game-id/${encodeURIComponent(args.gameId)}/leaderboard-id/${encodeURIComponent(args.leaderboardId)}/reset`,
                retryKey: options?.retryKey ?? "DataStoreService:Leaderboards:resetLeaderboardAsUser",
            });
        }
    }
}

export interface DataStoreServiceClientSpec {
    cache: DataStoreServiceCache.ClientSpec;
    data: DataStoreServiceData.ClientSpec;
    leaderboards: DataStoreServiceLeaderboards.ClientSpec;
}

export class DataStoreServiceClient implements DataStoreServiceClientSpec {
    public readonly cache: DataStoreServiceCache.ClientSpec;
    public readonly data: DataStoreServiceData.ClientSpec;
    public readonly leaderboards: DataStoreServiceLeaderboards.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.cache = new DataStoreServiceCache.Client(makeRequest);
        this.data = new DataStoreServiceData.Client(makeRequest);
        this.leaderboards = new DataStoreServiceLeaderboards.Client(makeRequest);
    }
}
