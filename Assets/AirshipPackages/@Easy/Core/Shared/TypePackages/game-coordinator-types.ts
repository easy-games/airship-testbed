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
export namespace GameCoordinatorDatabaseTypes {
    export type EasyUser = {
        username: string;
        usernameLower: string;
        uid: string;
        lastUsernameChangeTime: string | undefined;
        profileImageId: string | undefined;
        statusText: string | undefined;
        lastOnlineTime: string | undefined;
        createdAt: string;
        linkedSteamAccountId: string | undefined;
        adminBanned: boolean;
        adminBannedAt: string | undefined;
    };
}

// ====+==== External Types ====+====
export namespace ExternalGameCoordinatorTypes {
    export const GameVisibility = {
        PUBLIC: "PUBLIC",
        PRIVATE: "PRIVATE",
        UNLISTED: "UNLISTED",
    } as const;
    export type GameVisibility = (typeof GameVisibility)[keyof typeof GameVisibility];
}

// ====+==== Agones Types ====+====
export namespace GameCoordinatorAgones {
    export const AgonesFleet = {
        COST_OPTIMIZED: "cost-optimized",
        STANDARD: "standard",
        HIGH_PERFORMANCE: "high-performance",
    } as const;
    export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];

    export interface GameServer {
        serverId: string;
        ip: string;
        port: number;
    }

    export type PackageVersionLabel = { packageSlug: string } | GameCoordinatorAgones.PreloadablePackageVersionLabel;

    export interface PreloadablePackageVersionLabel {
        packageSlug: string;
        packageVersionId: string;
        assetVersionNumber: number;
        codeVersionNumber: number;
        publishVersionNumber: number | undefined;
    }
}

// ====+==== BundleVersions Types ====+====
export namespace GameCoordinatorBundleVersions {
    export type GameVersionArgs = {
        params: {
            gameId: string;
        };
    };

    export interface ClientSpec {
        gameVersion(
            args: GameVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ gameVersion: { playerVersion: number; assetBundleVersion: number } | undefined }>;
        platformVersion(
            options?: RequestOptions,
        ): Promise<{ platformVersion: { Core: number; Player: string; MinPlayerVersion: number } | undefined }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async gameVersion(
            args: GameVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ gameVersion: { playerVersion: number; assetBundleVersion: number } | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:BundleVersions:gameVersion",
                path: `/versions/gameId/${encodeURIComponent(args.gameId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:BundleVersions:gameVersion",
            });
        }
        async platformVersion(
            options?: RequestOptions,
        ): Promise<{ platformVersion: { Core: number; Player: string; MinPlayerVersion: number } | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:BundleVersions:platformVersion",
                path: `/versions/platform`,
                retryKey: options?.retryKey ?? "GameCoordinator:BundleVersions:platformVersion",
            });
        }
    }
}

// ====+==== Chat Types ====+====
export namespace GameCoordinatorChat {
    export interface ChatMessage {
        sentAt: number;
        text: string;
        sender: string;
        type: GameCoordinatorChat.ChatMessageType;
    }

    export const ChatMessageType = {
        PARTY: "party",
        DIRECT_MESSAGE: "direct_message",
    } as const;
    export type ChatMessageType = (typeof ChatMessageType)[keyof typeof ChatMessageType];

    export interface DirectChatMessageDto {
        target: string;
        text: string;
    }

    export interface PartyChatMessageDto {
        target?: string;
        text: string;
    }

    export type SendDirectMessageArgs = {
        data: GameCoordinatorChat.DirectChatMessageDto;
    };

    export interface SendMessageFailure {
        messageSent: false;
        reason: string;
    }

    export type SendMessageResponse = GameCoordinatorChat.SendMessageSuccess | GameCoordinatorChat.SendMessageFailure;

    export interface SendMessageSuccess {
        messageSent: true;
        transformedMessage?: string;
    }

    export type SendPartyMessageArgs = {
        data: GameCoordinatorChat.PartyChatMessageDto;
    };

    export interface ClientSpec {
        sendDirectMessage(
            args: SendDirectMessageArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorChat.SendMessageResponse>;
        sendPartyMessage(
            args: SendPartyMessageArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorChat.SendMessageResponse>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async sendDirectMessage(
            args: SendDirectMessageArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorChat.SendMessageResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Chat:sendDirectMessage",
                path: `/chat/message/direct`,
                retryKey: options?.retryKey ?? "GameCoordinator:Chat:sendDirectMessage",
                body: args,
            });
        }
        async sendPartyMessage(
            args: SendPartyMessageArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorChat.SendMessageResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Chat:sendPartyMessage",
                path: `/chat/message/party`,
                retryKey: options?.retryKey ?? "GameCoordinator:Chat:sendPartyMessage",
                body: args,
            });
        }
    }
}

// ====+==== Friends Types ====+====
export namespace GameCoordinatorFriends {
    export interface FriendRequests {
        outgoingRequests: GameCoordinatorUsers.PublicUser[];
        incomingRequests: GameCoordinatorUsers.PublicUser[];
        friends: GameCoordinatorUsers.PublicUser[];
    }

    export type FriendshipRequestResult = "initiated" | "accepted";

    export type FriendsStatus = { areFriends: boolean };

    export interface RequestFriendDto {
        username: string;
    }

    export type RequestFriendshipArgs = {
        data: GameCoordinatorFriends.RequestFriendDto;
    };

    export interface RequestSteamFriendDto {
        steamAccountId: string;
    }

    export type RequestSteamFriendshipArgs = {
        data: GameCoordinatorFriends.RequestSteamFriendDto;
    };

    export type StatusWithOtherUserArgs = {
        params: {
            uid: string;
        };
    };

    export type TerminateFriendshipArgs = {
        params: {
            uid: string;
        };
    };

    export interface ClientSpec {
        getFriends(options?: RequestOptions): Promise<GameCoordinatorUsers.PublicUser[]>;
        getRequests(options?: RequestOptions): Promise<GameCoordinatorFriends.FriendRequests>;
        requestFriendship(
            args: RequestFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: GameCoordinatorFriends.FriendshipRequestResult }>;
        requestSteamFriendship(
            args: RequestSteamFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: GameCoordinatorFriends.FriendshipRequestResult }>;
        statusWithOtherUser(
            args: StatusWithOtherUserArgs["params"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorFriends.FriendsStatus>;
        terminateFriendship(args: TerminateFriendshipArgs["params"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getFriends(options?: RequestOptions): Promise<GameCoordinatorUsers.PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Friends:getFriends",
                path: `/friends/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:getFriends",
            });
        }
        async getRequests(options?: RequestOptions): Promise<GameCoordinatorFriends.FriendRequests> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Friends:getRequests",
                path: `/friends/requests/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:getRequests",
            });
        }
        async requestFriendship(
            args: RequestFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: GameCoordinatorFriends.FriendshipRequestResult }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Friends:requestFriendship",
                path: `/friends/requests/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:requestFriendship",
                body: args,
            });
        }
        async requestSteamFriendship(
            args: RequestSteamFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: GameCoordinatorFriends.FriendshipRequestResult }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Friends:requestSteamFriendship",
                path: `/friends/requests/self/steam`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:requestSteamFriendship",
                body: args,
            });
        }
        async statusWithOtherUser(
            args: StatusWithOtherUserArgs["params"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorFriends.FriendsStatus> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Friends:statusWithOtherUser",
                path: `/friends/uid/${encodeURIComponent(args.uid)}/status`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:statusWithOtherUser",
            });
        }
        async terminateFriendship(args: TerminateFriendshipArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "GameCoordinator:Friends:terminateFriendship",
                path: `/friends/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:terminateFriendship",
            });
        }
    }
}

// ====+==== Groups Types ====+====
export namespace GameCoordinatorGroups {
    export type CreateGroupArgs = {
        data: GameCoordinatorGroups.CreateGroupDto;
    };

    export interface CreateGroupDto {
        userIds: string[];
    }

    export type GetGameGroupForSelfArgs = {
        params: {
            gameId: string;
        };
    };

    export type GetGroupByIdArgs = {
        params: {
            groupId: string;
        };
    };

    export type GetGroupForUserIdArgs = {
        params: {
            uid: string;
        };
    };

    export interface Group {
        groupId: string;
        gameId: string;
        members: GameCoordinatorGroups.GroupMember[];
        status: GameCoordinatorGroups.GroupStatus;
        createdAt: number;
    }

    export interface GroupMember extends GameCoordinatorUsers.PublicUser {
        active: boolean;
    }

    export const GroupState = {
        IN_QUEUE: "IN_QUEUE",
        IN_MATCH: "IN_MATCH",
        IDLE: "IDLE",
    } as const;
    export type GroupState = (typeof GroupState)[keyof typeof GroupState];

    export type GroupStatus =
        | GameCoordinatorGroups.QueueData
        | GameCoordinatorGroups.MatchData
        | GameCoordinatorGroups.IdleData;

    export interface IdleData {
        state: typeof GroupState.IDLE;
    }

    export interface MatchData {
        state: typeof GroupState.IN_MATCH;
        queueId: string;
        serverId: string;
        createdAt: number;
    }

    export interface QueueData {
        state: typeof GroupState.IN_QUEUE;
        queueId: string;
        joinedAt: number;
    }

    export interface ClientSpec {
        createGroup(
            args: CreateGroupArgs["data"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group }>;
        getGameGroupForSelf(
            args: GetGameGroupForSelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group | undefined }>;
        getGroupById(
            args: GetGroupByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group | undefined }>;
        getGroupForUserId(
            args: GetGroupForUserIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group | undefined }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createGroup(
            args: CreateGroupArgs["data"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Groups:createGroup",
                path: `/groups/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:createGroup",
                body: args,
            });
        }
        async getGameGroupForSelf(
            args: GetGameGroupForSelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Groups:getGameGroupForSelf",
                path: `/groups/game-id/${encodeURIComponent(args.gameId)}/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:getGameGroupForSelf",
            });
        }
        async getGroupById(
            args: GetGroupByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Groups:getGroupById",
                path: `/groups/group-id/${encodeURIComponent(args.groupId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:getGroupById",
            });
        }
        async getGroupForUserId(
            args: GetGroupForUserIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: GameCoordinatorGroups.Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Groups:getGroupForUserId",
                path: `/groups/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:getGroupForUserId",
            });
        }
    }
}

// ====+==== Matchmaking Types ====+====
export namespace GameCoordinatorMatchmaking {
    export type JoinQueueArgs = {
        data: GameCoordinatorMatchmaking.JoinQueueDto;
    };

    export interface JoinQueueDto {
        groupId: string;
        queueId: string;
        allowedRegionIds?: string[];
        attributes?: Record<string, unknown>;
        members?: GameCoordinatorMatchmaking.TicketMember[];
    }

    export type LeaveQueueArgs = {
        data: GameCoordinatorMatchmaking.LeaveQueueDto;
    };

    export interface LeaveQueueDto {
        groupId: unknown;
    }

    export type LeaveQueueSelfArgs = {
        data: GameCoordinatorMatchmaking.LeaveQueueSelfDto;
    };

    export interface LeaveQueueSelfDto {
        gameId: unknown;
    }

    export interface MatchConfig {
        teams: GameCoordinatorMatchmaking.MatchTeam[];
    }

    export interface MatchmakingMatchConfig {
        teams: GameCoordinatorMatchmaking.MatchmakingMatchTeam[];
        queueId: string;
    }

    export interface MatchmakingMatchTeam {
        name: string;
        groups: GameCoordinatorMatchmaking.MatchmakingMatchTeamGroup[];
    }

    export interface MatchmakingMatchTeamGroup {
        id: string;
        players: GameCoordinatorMatchmaking.MatchmakingMatchTeamGroupPlayer[];
        attributes: Record<string, unknown>;
    }

    export type MatchmakingMatchTeamGroupPlayer = GameCoordinatorUsers.PublicUser & {
        attributes: Record<string, unknown>;
    };

    export interface MatchTeam {
        name: string;
        groups: GameCoordinatorMatchmaking.MatchTeamGroup[];
        output?: Record<string, unknown>;
    }

    export interface MatchTeamGroup {
        id: string;
        players: GameCoordinatorMatchmaking.MatchTeamGroupPlayer[];
        attributes: Record<string, unknown>;
        output?: Record<string, unknown>;
    }

    export interface MatchTeamGroupPlayer {
        id: string;
        attributes: Record<string, unknown>;
        output?: Record<string, unknown>;
    }

    export interface TicketMember {
        uid: string;
        attributes?: unknown;
    }

    export interface ClientSpec {
        joinQueue(args: JoinQueueArgs["data"], options?: RequestOptions): Promise<void>;
        leaveQueue(args: LeaveQueueArgs["data"], options?: RequestOptions): Promise<void>;
        leaveQueueSelf(args: LeaveQueueSelfArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async joinQueue(args: JoinQueueArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Matchmaking:joinQueue",
                path: `/matchmaking/queue/join`,
                retryKey: options?.retryKey ?? "GameCoordinator:Matchmaking:joinQueue",
                body: args,
            });
        }
        async leaveQueue(args: LeaveQueueArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Matchmaking:leaveQueue",
                path: `/matchmaking/queue/leave`,
                retryKey: options?.retryKey ?? "GameCoordinator:Matchmaking:leaveQueue",
                body: args,
            });
        }
        async leaveQueueSelf(args: LeaveQueueSelfArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Matchmaking:leaveQueueSelf",
                path: `/matchmaking/queue/leave/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Matchmaking:leaveQueueSelf",
                body: args,
            });
        }
    }
}

// ====+==== MMQueue Types ====+====
export namespace GameCoordinatorMMQueue {
    export type DeleteQueueConfigurationArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
    };

    export interface DifferenceRule {
        attribute: string;
        difference: number | GameCoordinatorMMQueue.ExpansionSettings;
        scope: "match" | "team";
        secondsUntilOptional?: number;
    }

    export type ExpansionSettings =
        | GameCoordinatorMMQueue.LinearExpansionSettings
        | GameCoordinatorMMQueue.FixedExpansionSettings;

    export interface FixedExpansionSettings {
        type: "Fixed";
        values: number[];
        secondsBetweenExpansions: number;
    }

    export type GetGameConfigurationsArgs = {
        params: {
            gameId: string;
        };
    };

    export type GetQueueConfigurationArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
        query?: {
            rules?: boolean;
            teams?: boolean;
        };
    };

    export type GetQueueStatsArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
    };

    export interface LinearExpansionSettings {
        type: "Linear";
        base: number;
        delta: number;
        limit: number;
        secondsBetweenExpansions: number;
    }

    export interface MatchmakingQueueConfig {
        queueId: string;
        gameId: string;
        sceneId: string;
        fleet: GameCoordinatorAgones.AgonesFleet;
        teams?: GameCoordinatorMMQueue.MatchmakingQueueTeam[];
        rules?: GameCoordinatorMMQueue.MatchmakingQueueRule[];
        enabled: boolean;
        createdAt: string;
    }

    export interface MatchmakingQueueRule {
        name: string;
        type: GameCoordinatorMMQueue.RuleType;
        data: GameCoordinatorMMQueue.Rule;
    }

    export interface MatchmakingQueueStats {
        queueId: string;
        gameId: string;
        timestamp: number;
        groupCount: number;
        playerCount: number;
        estimatedQueueTime: number;
    }

    export interface MatchmakingQueueTeam {
        name: string;
        minSize: number | GameCoordinatorMMQueue.ExpansionSettings;
        maxSize: number | GameCoordinatorMMQueue.ExpansionSettings;
    }

    export interface MatchSetIntersectionRule {
        attribute: string;
        minSize: number | GameCoordinatorMMQueue.ExpansionSettings;
        secondsUntilOptional?: number;
    }

    export type PutQueueConfigurationArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
        data: GameCoordinatorMMQueue.PutQueueDto;
    };

    export interface PutQueueDto {
        sceneId: string;
        fleet?: GameCoordinatorAgones.AgonesFleet;
        enabled?: boolean;
        teams?: GameCoordinatorMMQueue.PutQueueTeamDto[];
        rules?: GameCoordinatorMMQueue.PutQueueRuleDto[];
    }

    export interface PutQueueRuleDto {
        name: string;
        type: GameCoordinatorMMQueue.RuleType;
        data: GameCoordinatorMMQueue.Rule;
    }

    export interface PutQueueTeamDto {
        name: string;
        minSize: number | GameCoordinatorMMQueue.ExpansionSettings;
        maxSize: number | GameCoordinatorMMQueue.ExpansionSettings;
    }

    export interface RegionPriorityRule {
        waitPerRegion: number;
        secondsUntilOptional?: number;
    }

    export type Rule =
        | GameCoordinatorMMQueue.DifferenceRule
        | GameCoordinatorMMQueue.StringEqualityRule
        | GameCoordinatorMMQueue.MatchSetIntersectionRule
        | GameCoordinatorMMQueue.TeamSizeBalanceRule
        | GameCoordinatorMMQueue.TeamFixedRolesRule
        | GameCoordinatorMMQueue.RegionPriorityRule;

    export const RuleType = {
        TeamFixedRolesRule: "TeamFixedRolesRule",
        TeamSizeBalanceRule: "TeamSizeBalanceRule",
        MatchSetIntersectionRule: "MatchSetIntersectionRule",
        StringEqualityRule: "StringEqualityRule",
        DifferenceRule: "DifferenceRule",
        RegionPriorityRule: "RegionPriorityRule",
    } as const;
    export type RuleType = (typeof RuleType)[keyof typeof RuleType];

    export interface StringEqualityRule {
        attribute: string;
        scope: "match" | "team";
        secondsUntilOptional?: number;
        otherTeamsShouldBeDifferent?: boolean;
    }

    export interface TeamFixedRolesRule {
        teams: string[];
        attribute: string;
        teamMakeup: { [roleName: string]: { quantity: number } };
        onEmptyBackfillMissingRoles?: boolean;
    }

    export interface TeamSizeBalanceRule {
        difference: number | GameCoordinatorMMQueue.ExpansionSettings;
        secondsUntilOptional?: number;
    }

    export interface ClientSpec {
        deleteQueueConfiguration(args: DeleteQueueConfigurationArgs["params"], options?: RequestOptions): Promise<void>;
        getGameConfigurations(
            args: GetGameConfigurationsArgs["params"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorMMQueue.MatchmakingQueueConfig[]>;
        getQueueConfiguration(
            args: GetQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<{ queueConfig: GameCoordinatorMMQueue.MatchmakingQueueConfig | undefined }>;
        getQueueStats(
            args: GetQueueStatsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ queueStats: GameCoordinatorMMQueue.MatchmakingQueueStats | undefined }>;
        putQueueConfiguration(
            args: PutQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<GameCoordinatorMMQueue.MatchmakingQueueConfig>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async deleteQueueConfiguration(
            args: DeleteQueueConfigurationArgs["params"],
            options?: RequestOptions,
        ): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "GameCoordinator:MMQueue:deleteQueueConfiguration",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.gameId)}/queue-id/${encodeURIComponent(args.queueId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:deleteQueueConfiguration",
            });
        }
        async getGameConfigurations(
            args: GetGameConfigurationsArgs["params"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorMMQueue.MatchmakingQueueConfig[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MMQueue:getGameConfigurations",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.gameId)}/configuration`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:getGameConfigurations",
            });
        }
        async getQueueConfiguration(
            args: GetQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<{ queueConfig: GameCoordinatorMMQueue.MatchmakingQueueConfig | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MMQueue:getQueueConfiguration",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.params.gameId)}/queue-id/${encodeURIComponent(args.params.queueId)}/configuration`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:getQueueConfiguration",
                query: args.query,
            });
        }
        async getQueueStats(
            args: GetQueueStatsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ queueStats: GameCoordinatorMMQueue.MatchmakingQueueStats | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MMQueue:getQueueStats",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.gameId)}/queue-id/${encodeURIComponent(args.queueId)}/stats`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:getQueueStats",
            });
        }
        async putQueueConfiguration(
            args: PutQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<GameCoordinatorMMQueue.MatchmakingQueueConfig> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "GameCoordinator:MMQueue:putQueueConfiguration",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.params.gameId)}/queue-id/${encodeURIComponent(args.params.queueId)}/configuration`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:putQueueConfiguration",
                body: args.data,
            });
        }
    }
}

// ====+==== Party Types ====+====
export namespace GameCoordinatorParty {
    export interface GameParty {
        partyId: string;
        leader: string;
        mode: GameCoordinatorParty.PartyMode;
        lastUpdated: number;
        members: GameCoordinatorUsers.PublicUser[];
    }

    export type GetPartyArgs = {
        params: {
            partyId: string;
        };
    };

    export type GetUserPartyArgs = {
        params: {
            uid: string;
        };
    };

    export interface InvitePartyDto {
        userToAdd: string;
    }

    export type InviteUserArgs = {
        data: GameCoordinatorParty.InvitePartyDto;
    };

    export type JoinPartyArgs = {
        data: GameCoordinatorParty.JoinPartyDto;
    };

    export interface JoinPartyDto {
        partyId?: string;
        uid?: string;
    }

    export interface PartyData {
        leader: string;
        partyId: string;
        mode: GameCoordinatorParty.PartyMode;
        lastUpdated: number;
    }

    export const PartyMode = {
        CLOSED: "closed",
        OPEN: "open",
        FRIENDS_ONLY: "friends_only",
    } as const;
    export type PartyMode = (typeof PartyMode)[keyof typeof PartyMode];

    export interface PartySnapshot extends GameCoordinatorParty.PartyData {
        members: GameCoordinatorUsers.PublicUser[];
        invited: string[];
    }

    export type RemoveFromPartyArgs = {
        data: GameCoordinatorParty.RemovePartyDto;
    };

    export interface RemovePartyDto {
        userToRemove: string;
    }

    export type UpdatePartyArgs = {
        data: GameCoordinatorParty.UpdatePartyDto;
    };

    export interface UpdatePartyDto {
        mode?: GameCoordinatorParty.PartyMode;
        leader?: string;
    }

    export interface ClientSpec {
        getParty(
            args: GetPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameCoordinatorParty.GameParty | undefined }>;
        getSelfParty(options?: RequestOptions): Promise<{ party: GameCoordinatorParty.PartySnapshot }>;
        getUserParty(
            args: GetUserPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameCoordinatorParty.GameParty | undefined }>;
        inviteUser(args: InviteUserArgs["data"], options?: RequestOptions): Promise<void>;
        joinParty(args: JoinPartyArgs["data"], options?: RequestOptions): Promise<void>;
        removeFromParty(args: RemoveFromPartyArgs["data"], options?: RequestOptions): Promise<void>;
        updateParty(args: UpdatePartyArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getParty(
            args: GetPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameCoordinatorParty.GameParty | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Party:getParty",
                path: `/parties/party-id/${encodeURIComponent(args.partyId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:getParty",
            });
        }
        async getSelfParty(options?: RequestOptions): Promise<{ party: GameCoordinatorParty.PartySnapshot }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Party:getSelfParty",
                path: `/parties/party/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:getSelfParty",
            });
        }
        async getUserParty(
            args: GetUserPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameCoordinatorParty.GameParty | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Party:getUserParty",
                path: `/parties/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:getUserParty",
            });
        }
        async inviteUser(args: InviteUserArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Party:inviteUser",
                path: `/parties/party/invite`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:inviteUser",
                body: args,
            });
        }
        async joinParty(args: JoinPartyArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Party:joinParty",
                path: `/parties/party/join`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:joinParty",
                body: args,
            });
        }
        async removeFromParty(args: RemoveFromPartyArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Party:removeFromParty",
                path: `/parties/party/remove`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:removeFromParty",
                body: args,
            });
        }
        async updateParty(args: UpdatePartyArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "GameCoordinator:Party:updateParty",
                path: `/parties/party`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:updateParty",
                body: args,
            });
        }
    }
}

// ====+==== Servers Types ====+====
export namespace GameCoordinatorServers {
    export const AccessMode = {
        CLOSED: "CLOSED",
        OPEN: "OPEN",
        FRIENDS_ONLY: "FRIENDS_ONLY",
    } as const;
    export type AccessMode = (typeof AccessMode)[keyof typeof AccessMode];

    export interface AllocatedServerData
        extends GameCoordinatorServers.BaseServerData<typeof AllocationState.ALLOCATED> {
        cluster: string;
        gameServer: GameCoordinatorAgones.GameServer;
        status: {
            state: "Ready" | "Allocated" | "Shutdown" | "Scheduled";
            tags: { capacity: number; values: string[] | undefined };
            players: { capacity: number; values: string[] | undefined };
            allowedPlayers: { capacity: number; values: string[] | undefined };
        };
    }

    export const AllocationState = {
        ALLOCATED: "ALLOCATED",
        RECENTLY_ALLOCATED: "RECENTLY_ALLOCATED",
        PENDING: "PENDING",
    } as const;
    export type AllocationState = (typeof AllocationState)[keyof typeof AllocationState];

    export interface BaseServerData<T extends GameCoordinatorServers.AllocationState> {
        allocationState: T;
        organizationId: string;
        gameId: string;
        gameVersion: { gameVersionId: string; assetVersionNumber: number; codeVersionNumber: number };
        serverId: string;
        region: string;
        fleet: GameCoordinatorAgones.AgonesFleet;
        labels: GameCoordinatorServers.StandardServerLabels;
        requiredPackages: GameCoordinatorAgones.PackageVersionLabel[];
        maxPlayers: number;
        serverListData: { name?: string; description?: string; listed: boolean };
        status: {
            tags: { values: string[] | undefined };
            allowedPlayers: { values: string[] | undefined };
            players: { capacity: number; values: string[] | undefined };
        };
    }

    export type CreateServerArgs = {
        data: GameCoordinatorServers.CreateServerDto;
    };

    export interface CreateServerDto {
        sceneId?: string;
        region?: string;
        accessMode?: GameCoordinatorServers.AccessMode;
        allowedUids?: string[];
        maxPlayers?: number;
        tags?: string[];
        gameConfig?: unknown;
        fleet?: GameCoordinatorAgones.AgonesFleet;
    }

    export type GetServerListArgs = {
        params: {
            gameId: string;
        };
        query?: {
            page?: number;
        };
    };

    export type GetServerListOfFriendsArgs = {
        params: {
            gameId: string;
        };
    };

    export type GetServersArgs = {
        query: GameCoordinatorServers.QueryServersDto;
    };

    export interface PublicServerData {
        serverId: string;
        playerCount: number;
        maxPlayers: number;
        name?: string;
        description?: string;
        sceneId: string;
        accessMode: GameCoordinatorServers.AccessMode;
        tags: string[];
    }

    export interface QueryServersDto {
        serverIds: string[];
    }

    export interface ServerListEntryWithFriends extends GameCoordinatorServers.PublicServerData {
        friends: GameCoordinatorUsers.PublicUser[];
    }

    export interface StandardServerLabels {
        ServerId: string;
        OrganizationId: string;
        GameId: string;
        GameSceneId: string;
        GameVersionId: string;
        GameAssetVersion: string;
        GamePublishVersion: string;
        GameCodeVersion: string;
        Region: string;
        "agones.dev/sdk-AccessMode": GameCoordinatorServers.AccessMode;
        MaxPlayers: string;
        MarkedForShutdown?: string;
    }

    export interface ClientSpec {
        createServer(
            args: CreateServerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorServers.PublicServerData>;
        getPingServers(options?: RequestOptions): Promise<{ [regionId: string]: string }>;
        getRegionIds(options?: RequestOptions): Promise<{ regionIds: string[] }>;
        getServerList(
            args: GetServerListArgs,
            options?: RequestOptions,
        ): Promise<{ entries: GameCoordinatorServers.PublicServerData[] }>;
        getServerListOfFriends(
            args: GetServerListOfFriendsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ entries: GameCoordinatorServers.ServerListEntryWithFriends[] }>;
        getServers(
            args: GetServersArgs["query"],
            options?: RequestOptions,
        ): Promise<{ [serverId: string]: GameCoordinatorServers.PublicServerData }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createServer(
            args: CreateServerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorServers.PublicServerData> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Servers:createServer",
                path: `/servers/create`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:createServer",
                body: args,
            });
        }
        async getPingServers(options?: RequestOptions): Promise<{ [regionId: string]: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getPingServers",
                path: `/servers/regions/ping-servers`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getPingServers",
            });
        }
        async getRegionIds(options?: RequestOptions): Promise<{ regionIds: string[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getRegionIds",
                path: `/servers/regions`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getRegionIds",
            });
        }
        async getServerList(
            args: GetServerListArgs,
            options?: RequestOptions,
        ): Promise<{ entries: GameCoordinatorServers.PublicServerData[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getServerList",
                path: `/servers/game-id/${encodeURIComponent(args.params.gameId)}/list`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getServerList",
                query: args.query,
            });
        }
        async getServerListOfFriends(
            args: GetServerListOfFriendsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ entries: GameCoordinatorServers.ServerListEntryWithFriends[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getServerListOfFriends",
                path: `/servers/game-id/${encodeURIComponent(args.gameId)}/list/friends`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getServerListOfFriends",
            });
        }
        async getServers(
            args: GetServersArgs["query"],
            options?: RequestOptions,
        ): Promise<{ [serverId: string]: GameCoordinatorServers.PublicServerData }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getServers",
                path: `/servers/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getServers",
                query: args,
            });
        }
    }
}

// ====+==== Stats Types ====+====
export namespace GameCoordinatorStats {
    export interface GamePlayerCountDto {
        gameIds: string[];
    }

    export type GetGamePlayersArgs = {
        data: GameCoordinatorStats.GamePlayerCountDto;
    };

    export type PlatformStats = {
        players: { online: number; inGame: number };
        games: { active: number };
        servers: { active: number };
    };

    export interface ClientSpec {
        getGamePlayers(
            args: GetGamePlayersArgs["data"],
            options?: RequestOptions,
        ): Promise<{ [gameId: string]: number }>;
        getStats(options?: RequestOptions): Promise<GameCoordinatorStats.PlatformStats>;
        getTopGames(options?: RequestOptions): Promise<[string, number][]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getGamePlayers(
            args: GetGamePlayersArgs["data"],
            options?: RequestOptions,
        ): Promise<{ [gameId: string]: number }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Stats:getGamePlayers",
                path: `/stats/players/games`,
                retryKey: options?.retryKey ?? "GameCoordinator:Stats:getGamePlayers",
                body: args,
            });
        }
        async getStats(options?: RequestOptions): Promise<GameCoordinatorStats.PlatformStats> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Stats:getStats",
                path: `/stats/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Stats:getStats",
            });
        }
        async getTopGames(options?: RequestOptions): Promise<[string, number][]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Stats:getTopGames",
                path: `/stats/top-games`,
                retryKey: options?.retryKey ?? "GameCoordinator:Stats:getTopGames",
            });
        }
    }
}

// ====+==== SteamAuth Types ====+====
export namespace GameCoordinatorSteamAuth {
    export type SteamAuthLinkArgs = {
        query?: {
            session?: string;
        };
    };

    export type SteamAuthReturnLinkArgs = {
        query?: {
            session?: string;
        };
    };

    export interface ClientSpec {
        steamAuthCreate(options?: RequestOptions): Promise<void>;
        steamAuthInGame(options?: RequestOptions): Promise<{ firebaseToken: string }>;
        steamAuthInGamePlaytest(options?: RequestOptions): Promise<{ firebaseToken: string }>;
        steamAuthLink(args?: SteamAuthLinkArgs["query"], options?: RequestOptions): Promise<void>;
        steamAuthLinkUrl(options?: RequestOptions): Promise<{ url: string }>;
        steamAuthMain(options?: RequestOptions): Promise<void>;
        steamAuthReturn(options?: RequestOptions): Promise<void>;
        steamAuthReturnCreate(options?: RequestOptions): Promise<void>;
        steamAuthReturnLink(args?: SteamAuthReturnLinkArgs["query"], options?: RequestOptions): Promise<void>;
        steamAuthReturnMain(options?: RequestOptions): Promise<void>;
        steamAuthReturnTest(options?: RequestOptions): Promise<void>;
        steamAuthTest(options?: RequestOptions): Promise<void>;
        steamAuthUnlink(options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async steamAuthCreate(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthCreate",
                path: `/auth/steam/create`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthCreate",
            });
        }
        async steamAuthInGame(options?: RequestOptions): Promise<{ firebaseToken: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthInGame",
                path: `/auth/steam/in-game`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthInGame",
            });
        }
        async steamAuthInGamePlaytest(options?: RequestOptions): Promise<{ firebaseToken: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthInGamePlaytest",
                path: `/auth/steam/in-game-playtest`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthInGamePlaytest",
            });
        }
        async steamAuthLink(args?: SteamAuthLinkArgs["query"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthLink",
                path: `/auth/steam/link`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthLink",
                query: args,
            });
        }
        async steamAuthLinkUrl(options?: RequestOptions): Promise<{ url: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthLinkUrl",
                path: `/auth/steam/link/url`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthLinkUrl",
            });
        }
        async steamAuthMain(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthMain",
                path: `/auth/steam/`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthMain",
            });
        }
        async steamAuthReturn(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthReturn",
                path: `/auth/steam/return`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthReturn",
            });
        }
        async steamAuthReturnCreate(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthReturnCreate",
                path: `/auth/steam/return/create`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthReturnCreate",
            });
        }
        async steamAuthReturnLink(args?: SteamAuthReturnLinkArgs["query"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthReturnLink",
                path: `/auth/steam/return/link`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthReturnLink",
                query: args,
            });
        }
        async steamAuthReturnMain(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthReturnMain",
                path: `/auth/steam/return/main`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthReturnMain",
            });
        }
        async steamAuthReturnTest(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthReturnTest",
                path: `/auth/steam/return/test-client`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthReturnTest",
            });
        }
        async steamAuthTest(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthTest",
                path: `/auth/steam/test`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthTest",
            });
        }
        async steamAuthUnlink(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthUnlink",
                path: `/auth/steam/unlink`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthUnlink",
            });
        }
    }
}

// ====+==== Transfers Types ====+====
export namespace GameCoordinatorTransfers {
    export interface ClientTransferData {
        gameId: string;
        gameVersion: GameCoordinatorServers.AllocatedServerData["gameVersion"];
        gameServer: GameCoordinatorAgones.GameServer;
        requestTime: number;
        transferData?: unknown;
        requiredPackages: GameCoordinatorAgones.PackageVersionLabel[];
        transferSource: GameCoordinatorTransfers.TransferSourceData;
        orgRoleName: string | undefined;
        loadingScreenImageId?: string;
        clientTransferData: unknown;
    }

    export interface ClientTransferRequestDto {
        gameId: string;
        preferredServerId?: string;
        withParty?: boolean;
    }

    export interface ClientTransferRequestPlayerDto {
        targetUserId: string;
        withParty?: boolean;
    }

    export interface GameTransferValidationDto {
        userIdToken: string;
    }

    export type RequestSelfTransferArgs = {
        data: GameCoordinatorTransfers.ClientTransferRequestDto;
    };

    export type RequestSelfTransferToPlayerArgs = {
        data: GameCoordinatorTransfers.ClientTransferRequestPlayerDto;
    };

    export type SendToGameArgs = {
        data: GameCoordinatorTransfers.TransferToGameDto;
    };

    export type SendToMatchingServerArgs = {
        data: GameCoordinatorTransfers.TransferToMatchingServerDto;
    };

    export type SendToPlayerArgs = {
        data: GameCoordinatorTransfers.TransferToPlayerDto;
    };

    export type SendToServerArgs = {
        data: GameCoordinatorTransfers.TransferToServerIdDto;
    };

    export interface ServerTransferData {
        gameId: string;
        gameServer: GameCoordinatorAgones.GameServer;
        requestTime: number;
        transferSource: GameCoordinatorTransfers.TransferSourceData;
        user: GameCoordinatorUsers.PublicUser;
        orgRoleName: string | undefined;
        isEasyEmployee: boolean;
        clientTransferData?: unknown;
        serverTransferData?: unknown;
    }

    export interface TransferFailureResult {
        transfersRequested: false;
        reason: string;
    }

    export type TransferResult =
        | GameCoordinatorTransfers.TransferSuccessResult
        | GameCoordinatorTransfers.TransferFailureResult;

    export const TransferSource = {
        USER: "USER",
        SERVER: "SERVER",
    } as const;
    export type TransferSource = (typeof TransferSource)[keyof typeof TransferSource];

    export type TransferSourceData =
        | { type: typeof TransferSource.USER; userId: string }
        | { type: typeof TransferSource.SERVER; gameId: string; serverId: string };

    export interface TransferSuccessResult {
        transfersRequested: true;
        pendingTransfer: boolean;
        userIds: string[];
    }

    export interface TransferToGameDto {
        uids: string[];
        gameId: string;
        preferredServerId?: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }

    export interface TransferToMatchingServerDto {
        uids: string[];
        sceneId?: string;
        maxPlayers?: number;
        regions?: string[];
        tag?: string;
        accessMode?: GameCoordinatorServers.AccessMode;
        serverId?: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }

    export interface TransferToPlayerDto {
        uids: string[];
        targetUserId: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }

    export interface TransferToServerIdDto {
        uids: string[];
        serverId: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }

    export type ValidateTransferArgs = {
        data: GameCoordinatorTransfers.GameTransferValidationDto;
    };

    export interface ClientSpec {
        cancelTransfer(options?: RequestOptions): Promise<void>;
        requestCurrentTransfer(
            options?: RequestOptions,
        ): Promise<{ transfer: GameCoordinatorTransfers.ClientTransferData | undefined }>;
        requestSelfToPartyTransfer(options?: RequestOptions): Promise<GameCoordinatorTransfers.TransferResult>;
        requestSelfTransfer(
            args: RequestSelfTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult>;
        requestSelfTransferToPlayer(
            args: RequestSelfTransferToPlayerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult>;
        requestTransferPartyToSelf(options?: RequestOptions): Promise<GameCoordinatorTransfers.TransferResult>;
        sendToGame(
            args: SendToGameArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult>;
        sendToMatchingServer(
            args: SendToMatchingServerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult>;
        sendToPlayer(
            args: SendToPlayerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult>;
        sendToServer(
            args: SendToServerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult>;
        validateTransfer(
            args: ValidateTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.ServerTransferData>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async cancelTransfer(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:cancelTransfer",
                path: `/transfers/transfer/cancel`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:cancelTransfer",
            });
        }
        async requestCurrentTransfer(
            options?: RequestOptions,
        ): Promise<{ transfer: GameCoordinatorTransfers.ClientTransferData | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Transfers:requestCurrentTransfer",
                path: `/transfers/transfer/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestCurrentTransfer",
            });
        }
        async requestSelfToPartyTransfer(options?: RequestOptions): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestSelfToPartyTransfer",
                path: `/transfers/transfer/self/party`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestSelfToPartyTransfer",
            });
        }
        async requestSelfTransfer(
            args: RequestSelfTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestSelfTransfer",
                path: `/transfers/transfer/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestSelfTransfer",
                body: args,
            });
        }
        async requestSelfTransferToPlayer(
            args: RequestSelfTransferToPlayerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestSelfTransferToPlayer",
                path: `/transfers/transfer/self/target/player`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestSelfTransferToPlayer",
                body: args,
            });
        }
        async requestTransferPartyToSelf(options?: RequestOptions): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestTransferPartyToSelf",
                path: `/transfers/transfer/party`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestTransferPartyToSelf",
            });
        }
        async sendToGame(
            args: SendToGameArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:sendToGame",
                path: `/transfers/transfer/target/game`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:sendToGame",
                body: args,
            });
        }
        async sendToMatchingServer(
            args: SendToMatchingServerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:sendToMatchingServer",
                path: `/transfers/transfer/target/matching`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:sendToMatchingServer",
                body: args,
            });
        }
        async sendToPlayer(
            args: SendToPlayerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:sendToPlayer",
                path: `/transfers/transfer/target/player`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:sendToPlayer",
                body: args,
            });
        }
        async sendToServer(
            args: SendToServerArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:sendToServer",
                path: `/transfers/transfer/target/server`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:sendToServer",
                body: args,
            });
        }
        async validateTransfer(
            args: ValidateTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorTransfers.ServerTransferData> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:validateTransfer",
                path: `/transfers/transfer/validate`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:validateTransfer",
                body: args,
            });
        }
    }
}

// ====+==== UserLocations Types ====+====
export namespace GameCoordinatorUserLocations {
    export type FindArgs = {
        query: GameCoordinatorUserLocations.QueryUserLocationsDto;
    };

    export interface QueryUserLocationsDto {
        userIds: string[];
    }

    export interface ClientSpec {
        find(args: FindArgs["query"], options?: RequestOptions): Promise<{ [userId: string]: { serverId: string } }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<{ [userId: string]: { serverId: string } }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:UserLocations:find",
                path: `/user-locations/`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserLocations:find",
                query: args,
            });
        }
    }
}

// ====+==== UserNotifications Types ====+====
export namespace GameCoordinatorUserNotifications {
    export type DeleteNotificationsArgs = {
        data: GameCoordinatorUserNotifications.DeleteNotificationsDto;
    };

    export interface DeleteNotificationsDto {
        notificationIds: string[];
    }

    export interface EasyUserNotification {
        id: string;
        uid: string;
        type: string;
        data: unknown;
        createdAt: string;
    }

    export interface ClientSpec {
        deleteNotifications(
            args: DeleteNotificationsArgs["data"],
            options?: RequestOptions,
        ): Promise<{ notifications: GameCoordinatorUserNotifications.EasyUserNotification[] }>;
        getNotifications(
            options?: RequestOptions,
        ): Promise<{ notifications: GameCoordinatorUserNotifications.EasyUserNotification[] }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async deleteNotifications(
            args: DeleteNotificationsArgs["data"],
            options?: RequestOptions,
        ): Promise<{ notifications: GameCoordinatorUserNotifications.EasyUserNotification[] }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:UserNotifications:deleteNotifications",
                path: `/user-notifications/delete`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserNotifications:deleteNotifications",
                body: args,
            });
        }
        async getNotifications(
            options?: RequestOptions,
        ): Promise<{ notifications: GameCoordinatorUserNotifications.EasyUserNotification[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:UserNotifications:getNotifications",
                path: `/user-notifications/`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserNotifications:getNotifications",
            });
        }
    }
}

// ====+==== Users Types ====+====
export namespace GameCoordinatorUsers {
    export type CreateArgs = {
        data: GameCoordinatorUsers.CreateUserDto;
    };

    export interface CreateUserDto {
        username: string;
    }

    export type EasyUserWithRole = GameCoordinatorDatabaseTypes.EasyUser & { role: GameCoordinatorUsers.Role };

    export type FindArgs = {
        query: GameCoordinatorUsers.QueryUsersDto;
    };

    export type FindByUsernameArgs = {
        query: GameCoordinatorUsers.QueryUserDto;
    };

    export type GetByUidArgs = {
        params: {
            uid: string;
        };
        query?: {
            admin?: boolean;
        };
    };

    export type GetUsernameAvailabilityArgs = {
        query: GameCoordinatorUsers.QueryUserDto;
    };

    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }

    export interface QueryUserDto {
        username: string;
    }

    export interface QueryUsersDto {
        strict?: boolean;
        users: string[];
    }

    export const Role = {
        USER: "user",
        EASY_EMPLOYEE: "easy-employee",
        SERVICE: "service",
        GAME_SERVER: "game-server",
        GCP: "gcp",
    } as const;
    export type Role = (typeof Role)[keyof typeof Role];

    export type UpdateArgs = {
        data: GameCoordinatorUsers.UpdateUserDto;
    };

    export interface UpdateUserDto {
        username?: string;
        statusText?: string | undefined;
        profileImageId?: string | undefined;
    }

    export interface ClientSpec {
        create(
            args: CreateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorUsers.EasyUserWithRole }>;
        deleteUser(options?: RequestOptions): Promise<{ success: boolean }>;
        find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorDatabaseTypes.EasyUser[] | GameCoordinatorUsers.PublicUser[]>;
        findByUsername(
            args: FindByUsernameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorUsers.PublicUser | undefined }>;
        getByUid(
            args: GetByUidArgs,
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorDatabaseTypes.EasyUser | GameCoordinatorUsers.PublicUser | undefined }>;
        getUsernameAvailability(
            args: GetUsernameAvailabilityArgs["query"],
            options?: RequestOptions,
        ): Promise<{ available: boolean }>;
        login(options?: RequestOptions): Promise<{ user: GameCoordinatorUsers.EasyUserWithRole | undefined }>;
        update(
            args: UpdateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorDatabaseTypes.EasyUser }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async create(
            args: CreateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorUsers.EasyUserWithRole }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Users:create",
                path: `/users/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:create",
                body: args,
            });
        }
        async deleteUser(options?: RequestOptions): Promise<{ success: boolean }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "GameCoordinator:Users:deleteUser",
                path: `/users/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:deleteUser",
            });
        }
        async find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorDatabaseTypes.EasyUser[] | GameCoordinatorUsers.PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:find",
                path: `/users/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:find",
                query: args,
            });
        }
        async findByUsername(
            args: FindByUsernameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorUsers.PublicUser | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:findByUsername",
                path: `/users/user`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:findByUsername",
                query: args,
            });
        }
        async getByUid(
            args: GetByUidArgs,
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorDatabaseTypes.EasyUser | GameCoordinatorUsers.PublicUser | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:getByUid",
                path: `/users/uid/${encodeURIComponent(args.params.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:getByUid",
                query: args.query,
            });
        }
        async getUsernameAvailability(
            args: GetUsernameAvailabilityArgs["query"],
            options?: RequestOptions,
        ): Promise<{ available: boolean }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:getUsernameAvailability",
                path: `/users/availability`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:getUsernameAvailability",
                query: args,
            });
        }
        async login(options?: RequestOptions): Promise<{ user: GameCoordinatorUsers.EasyUserWithRole | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:login",
                path: `/users/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:login",
            });
        }
        async update(
            args: UpdateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorDatabaseTypes.EasyUser }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "GameCoordinator:Users:update",
                path: `/users/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:update",
                body: args,
            });
        }
    }
}

// ====+==== UserSession Types ====+====
export namespace GameCoordinatorUserSession {
    export type UpdateSessionArgs = {
        data: GameCoordinatorUserSession.UpdateSessionDto;
    };

    export interface UpdateSessionDto {
        regionLatencies?: Record<string, number>;
    }

    export interface ClientSpec {
        updateSession(args: UpdateSessionArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async updateSession(args: UpdateSessionArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "GameCoordinator:UserSession:updateSession",
                path: `/user-session/data`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserSession:updateSession",
                body: args,
            });
        }
    }
}

// ====+==== UserStatus Types ====+====
export namespace GameCoordinatorUserStatus {
    export interface BaseUserData {
        userId: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
    }

    export interface BaseUserStatus<S extends GameCoordinatorUserStatus.UserStatus>
        extends GameCoordinatorUserStatus.BaseUserData {
        status: S;
        partyMode: GameCoordinatorParty.PartyMode;
        metadata?: unknown;
    }

    export type UpdateUserStatusArgs = {
        data: GameCoordinatorUserStatus.UpdateUserStatusDto;
    };

    export interface UpdateUserStatusDto {
        status: GameCoordinatorUserStatus.UserStatus;
        gameId?: string;
        serverId?: string;
        metadata?: unknown;
    }

    export type UpdateUserStatusResponse = GameCoordinatorUserStatus.UserStatusData & {
        refreshIn: number;
        notifiedRecipients: boolean;
    };

    export interface UserInGameStatus extends GameCoordinatorUserStatus.BaseUserStatus<typeof UserStatus.IN_GAME> {
        gameId: string;
        game: { name: string; icon: string; visibility: ExternalGameCoordinatorTypes.GameVisibility };
        serverId?: string;
    }

    export type UserOfflineStatus = GameCoordinatorUserStatus.BaseUserStatus<typeof UserStatus.OFFLINE>;

    export type UserOnlineStatus = GameCoordinatorUserStatus.BaseUserStatus<typeof UserStatus.ONLINE>;

    export const UserStatus = {
        OFFLINE: "offline",
        ONLINE: "online",
        IN_GAME: "in_game",
    } as const;
    export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

    export type UserStatusData =
        | GameCoordinatorUserStatus.UserOfflineStatus
        | GameCoordinatorUserStatus.UserOnlineStatus
        | GameCoordinatorUserStatus.UserInGameStatus;

    export interface ClientSpec {
        refreshFriends(options?: RequestOptions): Promise<void>;
        updateUserStatus(
            args: UpdateUserStatusArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorUserStatus.UpdateUserStatusResponse>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async refreshFriends(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:UserStatus:refreshFriends",
                path: `/user-status/friends`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserStatus:refreshFriends",
            });
        }
        async updateUserStatus(
            args: UpdateUserStatusArgs["data"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorUserStatus.UpdateUserStatusResponse> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "GameCoordinator:UserStatus:updateUserStatus",
                path: `/user-status/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserStatus:updateUserStatus",
                body: args,
            });
        }
    }
}

export interface GameCoordinatorClientSpec {
    bundleVersions: GameCoordinatorBundleVersions.ClientSpec;
    chat: GameCoordinatorChat.ClientSpec;
    friends: GameCoordinatorFriends.ClientSpec;
    groups: GameCoordinatorGroups.ClientSpec;
    matchmaking: GameCoordinatorMatchmaking.ClientSpec;
    mMQueue: GameCoordinatorMMQueue.ClientSpec;
    party: GameCoordinatorParty.ClientSpec;
    servers: GameCoordinatorServers.ClientSpec;
    stats: GameCoordinatorStats.ClientSpec;
    steamAuth: GameCoordinatorSteamAuth.ClientSpec;
    transfers: GameCoordinatorTransfers.ClientSpec;
    userLocations: GameCoordinatorUserLocations.ClientSpec;
    userNotifications: GameCoordinatorUserNotifications.ClientSpec;
    users: GameCoordinatorUsers.ClientSpec;
    userSession: GameCoordinatorUserSession.ClientSpec;
    userStatus: GameCoordinatorUserStatus.ClientSpec;
}

export class GameCoordinatorClient implements GameCoordinatorClientSpec {
    public readonly bundleVersions: GameCoordinatorBundleVersions.ClientSpec;
    public readonly chat: GameCoordinatorChat.ClientSpec;
    public readonly friends: GameCoordinatorFriends.ClientSpec;
    public readonly groups: GameCoordinatorGroups.ClientSpec;
    public readonly matchmaking: GameCoordinatorMatchmaking.ClientSpec;
    public readonly mMQueue: GameCoordinatorMMQueue.ClientSpec;
    public readonly party: GameCoordinatorParty.ClientSpec;
    public readonly servers: GameCoordinatorServers.ClientSpec;
    public readonly stats: GameCoordinatorStats.ClientSpec;
    public readonly steamAuth: GameCoordinatorSteamAuth.ClientSpec;
    public readonly transfers: GameCoordinatorTransfers.ClientSpec;
    public readonly userLocations: GameCoordinatorUserLocations.ClientSpec;
    public readonly userNotifications: GameCoordinatorUserNotifications.ClientSpec;
    public readonly users: GameCoordinatorUsers.ClientSpec;
    public readonly userSession: GameCoordinatorUserSession.ClientSpec;
    public readonly userStatus: GameCoordinatorUserStatus.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.bundleVersions = new GameCoordinatorBundleVersions.Client(makeRequest);
        this.chat = new GameCoordinatorChat.Client(makeRequest);
        this.friends = new GameCoordinatorFriends.Client(makeRequest);
        this.groups = new GameCoordinatorGroups.Client(makeRequest);
        this.matchmaking = new GameCoordinatorMatchmaking.Client(makeRequest);
        this.mMQueue = new GameCoordinatorMMQueue.Client(makeRequest);
        this.party = new GameCoordinatorParty.Client(makeRequest);
        this.servers = new GameCoordinatorServers.Client(makeRequest);
        this.stats = new GameCoordinatorStats.Client(makeRequest);
        this.steamAuth = new GameCoordinatorSteamAuth.Client(makeRequest);
        this.transfers = new GameCoordinatorTransfers.Client(makeRequest);
        this.userLocations = new GameCoordinatorUserLocations.Client(makeRequest);
        this.userNotifications = new GameCoordinatorUserNotifications.Client(makeRequest);
        this.users = new GameCoordinatorUsers.Client(makeRequest);
        this.userSession = new GameCoordinatorUserSession.Client(makeRequest);
        this.userStatus = new GameCoordinatorUserStatus.Client(makeRequest);
    }
}
