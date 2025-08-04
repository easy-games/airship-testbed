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
export namespace GameCoordinatorPrisma {
    export type EasyUser = {
        username: string;
        usernameLower: string;
        uid: string;
        lastUsernameChangeTime: string | undefined;
        profileImageId: string | undefined;
        statusText: string | undefined;
        lastOnlineTime: string | undefined;
        createdAt: string;
        adminBanned: boolean;
    };
}
// ====+==== Chat TYPES ====+====
export namespace GameCoordinatorChat {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ChatMessageType = {
        PARTY: "party",
        DIRECT_MESSAGE: "direct_message",
    } as const;
    export type ChatMessageType = (typeof ChatMessageType)[keyof typeof ChatMessageType];
    export interface ChatMessage {
        sentAt: number;
        text: string;
        sender: string;
        type: ChatMessageType;
    }
    export interface DirectChatMessageDto {
        target: string;
        text: string;
    }
    export type SendDirectMessageArgs = {
        data: DirectChatMessageDto;
    };
    export interface PartyChatMessageDto {
        target?: string;
        text: string;
    }
    export type SendPartyMessageArgs = {
        data: PartyChatMessageDto;
    };
    export interface SendMessageSuccess {
        messageSent: true;
        transformedMessage?: string;
    }
    export interface SendMessageFailure {
        messageSent: false;
        reason: string;
    }
    export type SendMessageResponse = SendMessageSuccess | SendMessageFailure;

    export interface ClientSpec {
        sendDirectMessage(args: SendDirectMessageArgs["data"], options?: RequestOptions): Promise<SendMessageResponse>;
        sendPartyMessage(args: SendPartyMessageArgs["data"], options?: RequestOptions): Promise<SendMessageResponse>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async sendDirectMessage(
            args: SendDirectMessageArgs["data"],
            options?: RequestOptions,
        ): Promise<SendMessageResponse> {
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
        ): Promise<SendMessageResponse> {
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
// ====+==== MatchmakingDebug TYPES ====+====
export namespace GameCoordinatorMatchmakingDebug {
    export interface MatchTeamGroupPlayer {
        id: string;
        attributes: Record<string, unknown>;
        output?: Record<string, unknown>;
    }
    export interface MatchTeamGroup {
        id: string;
        players: MatchTeamGroupPlayer[];
        attributes: Record<string, unknown>;
        output?: Record<string, unknown>;
    }
    export interface MatchTeam {
        name: string;
        groups: MatchTeamGroup[];
        output?: Record<string, unknown>;
    }
    export interface MatchConfig {
        teams: MatchTeam[];
    }
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }
    export type MatchmakingMatchTeamGroupPlayer = PublicUser & { attributes: Record<string, unknown> };
    export interface MatchmakingMatchTeamGroup {
        id: string;
        players: MatchmakingMatchTeamGroupPlayer[];
        attributes: Record<string, unknown>;
    }
    export interface MatchmakingMatchTeam {
        name: string;
        groups: MatchmakingMatchTeamGroup[];
    }
    export interface MatchmakingMatchConfig {
        teams: MatchmakingMatchTeam[];
        queueId: string;
    }
    export type GetGameQueuesSummaryArgs = {
        params: {
            gameId: string;
        };
    };
    export type GetQueueDetailArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
    };
    export interface GameQueueSummary {
        queueId: string;
        gameId: string;
        enabled: boolean;
        isActive: boolean;
        groupCount: number;
        sceneId: string;
        fleet: string;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AgonesFleet = {
        COST_OPTIMIZED: "cost-optimized",
        STANDARD: "standard",
        HIGH_PERFORMANCE: "high-performance",
    } as const;
    export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];
    export interface LinearExpansionSettings {
        type: "Linear";
        base: number;
        delta: number;
        limit: number;
        secondsBetweenExpansions: number;
    }
    export interface FixedExpansionSettings {
        type: "Fixed";
        values: number[];
        secondsBetweenExpansions: number;
    }
    export type ExpansionSettings = LinearExpansionSettings | FixedExpansionSettings;
    export interface MatchmakingQueueTeam {
        name: string;
        minSize: number | ExpansionSettings;
        maxSize: number | ExpansionSettings;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const RuleType = {
        TeamFixedRolesRule: "TeamFixedRolesRule",
        TeamSizeBalanceRule: "TeamSizeBalanceRule",
        MatchSetIntersectionRule: "MatchSetIntersectionRule",
        StringEqualityRule: "StringEqualityRule",
        DifferenceRule: "DifferenceRule",
        RegionPriorityRule: "RegionPriorityRule",
    } as const;
    export type RuleType = (typeof RuleType)[keyof typeof RuleType];
    export interface DifferenceRule {
        attribute: string;
        difference: number | ExpansionSettings;
        scope: "match" | "team";
        secondsUntilOptional?: number;
    }
    export interface StringEqualityRule {
        attribute: string;
        scope: "match" | "team";
        secondsUntilOptional?: number;
        otherTeamsShouldBeDifferent?: boolean;
    }
    export interface MatchSetIntersectionRule {
        attribute: string;
        minSize: number | ExpansionSettings;
        secondsUntilOptional?: number;
    }
    export interface TeamSizeBalanceRule {
        difference: number | ExpansionSettings;
        secondsUntilOptional?: number;
    }
    export interface TeamFixedRolesRule {
        teams: string[];
        attribute: string;
        teamMakeup: { [roleName: string]: { quantity: number } };
        onEmptyBackfillMissingRoles?: boolean;
    }
    export interface RegionPriorityRule {
        waitPerRegion: number;
        secondsUntilOptional?: number;
    }
    export type Rule =
        | DifferenceRule
        | StringEqualityRule
        | MatchSetIntersectionRule
        | TeamSizeBalanceRule
        | TeamFixedRolesRule
        | RegionPriorityRule;
    export interface MatchmakingQueueRule {
        name: string;
        type: RuleType;
        data: Rule;
    }
    export interface MatchmakingQueueConfig {
        queueId: string;
        gameId: string;
        sceneId: string;
        fleet: AgonesFleet;
        teams?: MatchmakingQueueTeam[];
        rules?: MatchmakingQueueRule[];
        enabled: boolean;
        createdAt: string;
    }
    export interface PlayerDebugInfo {
        uid: string;
        username?: string;
        attributes?: unknown;
    }
    export interface GroupDebugInfo {
        groupId: string;
        status: unknown;
        players: PlayerDebugInfo[];
        queuedAt: number;
        waitTime: number;
        attributes: Record<string, unknown>;
        regionIds: string[];
    }
    export interface QueueDebugDetail {
        queueId: string;
        gameId: string;
        config: MatchmakingQueueConfig;
        isActive: boolean;
        groupCount: number;
        groups: GroupDebugInfo[];
        metrics: { averageWaitTime: number; oldestGroupWaitTime: number; newestGroupWaitTime: number };
    }

    export interface ClientSpec {
        getGameQueuesSummary(
            args: GetGameQueuesSummaryArgs["params"],
            options?: RequestOptions,
        ): Promise<GameQueueSummary[]>;
        getQueueDetail(
            args: GetQueueDetailArgs["params"],
            options?: RequestOptions,
        ): Promise<QueueDebugDetail | { error: string }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getGameQueuesSummary(
            args: GetGameQueuesSummaryArgs["params"],
            options?: RequestOptions,
        ): Promise<GameQueueSummary[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MatchmakingDebug:getGameQueuesSummary",
                path: `/matchmaking/debug/games/${encodeURIComponent(args.gameId)}/queues`,
                retryKey: options?.retryKey ?? "GameCoordinator:MatchmakingDebug:getGameQueuesSummary",
            });
        }
        async getQueueDetail(
            args: GetQueueDetailArgs["params"],
            options?: RequestOptions,
        ): Promise<QueueDebugDetail | { error: string }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MatchmakingDebug:getQueueDetail",
                path: `/matchmaking/debug/games/${encodeURIComponent(args.gameId)}/queues/${encodeURIComponent(args.queueId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:MatchmakingDebug:getQueueDetail",
            });
        }
    }
}
// ====+==== Friends TYPES ====+====
export namespace GameCoordinatorFriends {
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
    export interface RequestFriendDto {
        username: string;
    }
    export type RequestFriendshipArgs = {
        data: RequestFriendDto;
    };
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }
    export type FriendsStatus = { areFriends: boolean };
    export interface FriendRequests {
        outgoingRequests: PublicUser[];
        incomingRequests: PublicUser[];
        friends: PublicUser[];
    }
    export type FriendshipRequestResult = "initiated" | "accepted";

    export interface ClientSpec {
        getFriends(options?: RequestOptions): Promise<PublicUser[]>;
        statusWithOtherUser(args: StatusWithOtherUserArgs["params"], options?: RequestOptions): Promise<FriendsStatus>;
        terminateFriendship(args: TerminateFriendshipArgs["params"], options?: RequestOptions): Promise<void>;
        getRequests(options?: RequestOptions): Promise<FriendRequests>;
        requestFriendship(
            args: RequestFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: FriendshipRequestResult }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getFriends(options?: RequestOptions): Promise<PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Friends:getFriends",
                path: `/friends/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:getFriends",
            });
        }
        async statusWithOtherUser(
            args: StatusWithOtherUserArgs["params"],
            options?: RequestOptions,
        ): Promise<FriendsStatus> {
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
        async getRequests(options?: RequestOptions): Promise<FriendRequests> {
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
        ): Promise<{ result: FriendshipRequestResult }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Friends:requestFriendship",
                path: `/friends/requests/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Friends:requestFriendship",
                body: args,
            });
        }
    }
}
// ====+==== GroupsDebug TYPES ====+====
export namespace GameCoordinatorGroupsDebug {
    export type GetGameGroupsArgs = {
        params: {
            gameId: string;
        };
        query: {
            limit: string;
        };
    };
    export interface GroupDebugInfo {
        groupId: string;
        members: { uid: string; username?: string; active: boolean }[];
        status: unknown;
        createdAt: number;
    }
    export interface GameGroupsResponse {
        groups: GroupDebugInfo[];
        count: number;
    }

    export interface ClientSpec {
        getGameGroups(args: GetGameGroupsArgs, options?: RequestOptions): Promise<GameGroupsResponse>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getGameGroups(args: GetGameGroupsArgs, options?: RequestOptions): Promise<GameGroupsResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:GroupsDebug:getGameGroups",
                path: `/groups/debug/games/${encodeURIComponent(args.params.gameId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:GroupsDebug:getGameGroups",
                query: args.query,
            });
        }
    }
}
// ====+==== Groups TYPES ====+====
export namespace GameCoordinatorGroups {
    export interface CreateGroupDto {
        userIds: string[];
    }
    export type CreateGroupArgs = {
        data: CreateGroupDto;
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
    export type GetGameGroupForSelfArgs = {
        params: {
            gameId: string;
        };
    };
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }
    export interface GroupMember extends PublicUser {
        active: boolean;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const GroupState = {
        IN_QUEUE: "IN_QUEUE",
        IN_MATCH: "IN_MATCH",
        IDLE: "IDLE",
    } as const;
    export type GroupState = (typeof GroupState)[keyof typeof GroupState];
    export interface QueueData {
        state: typeof GroupState.IN_QUEUE;
        queueId: string;
        joinedAt: number;
    }
    export interface MatchData {
        state: typeof GroupState.IN_MATCH;
        queueId: string;
        serverId: string;
        createdAt: number;
    }
    export interface IdleData {
        state: typeof GroupState.IDLE;
    }
    export type GroupStatus = QueueData | MatchData | IdleData;
    export interface Group {
        groupId: string;
        gameId: string;
        members: GroupMember[];
        status: GroupStatus;
        createdAt: number;
    }

    export interface ClientSpec {
        createGroup(args: CreateGroupArgs["data"], options?: RequestOptions): Promise<{ group: Group }>;
        getGroupById(args: GetGroupByIdArgs["params"], options?: RequestOptions): Promise<{ group: Group | undefined }>;
        getGroupForUserId(
            args: GetGroupForUserIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }>;
        getGameGroupForSelf(
            args: GetGameGroupForSelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createGroup(args: CreateGroupArgs["data"], options?: RequestOptions): Promise<{ group: Group }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Groups:createGroup",
                path: `/groups/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:createGroup",
                body: args,
            });
        }
        async getGroupById(
            args: GetGroupByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }> {
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
        ): Promise<{ group: Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Groups:getGroupForUserId",
                path: `/groups/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:getGroupForUserId",
            });
        }
        async getGameGroupForSelf(
            args: GetGameGroupForSelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Groups:getGameGroupForSelf",
                path: `/groups/game-id/${encodeURIComponent(args.gameId)}/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Groups:getGameGroupForSelf",
            });
        }
    }
}
// ====+==== Matchmaking TYPES ====+====
export namespace GameCoordinatorMatchmaking {
    export interface TicketMember {
        uid: string;
        attributes?: unknown;
    }
    export interface JoinQueueDto {
        groupId: string;
        queueId: string;
        allowedRegionIds?: string[];
        attributes?: Record<string, unknown>;
        members?: TicketMember[];
    }
    export type JoinQueueArgs = {
        data: JoinQueueDto;
    };
    export interface LeaveQueueDto {
        groupId: unknown;
    }
    export type LeaveQueueArgs = {
        data: LeaveQueueDto;
    };
    export interface LeaveQueueSelfDto {
        gameId: unknown;
    }
    export type LeaveQueueSelfArgs = {
        data: LeaveQueueSelfDto;
    };

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
// ====+==== Party TYPES ====+====
export namespace GameCoordinatorParty {
    export type GetUserPartyArgs = {
        params: {
            uid: string;
        };
    };
    export type GetPartyArgs = {
        params: {
            partyId: string;
        };
    };
    export interface InvitePartyDto {
        userToAdd: string;
    }
    export type InviteUserArgs = {
        data: InvitePartyDto;
    };
    export interface JoinPartyDto {
        partyId?: string;
        uid?: string;
    }
    export type JoinPartyArgs = {
        data: JoinPartyDto;
    };
    export interface RemovePartyDto {
        userToRemove: string;
    }
    export type RemoveFromPartyArgs = {
        data: RemovePartyDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const PartyMode = {
        CLOSED: "closed",
        OPEN: "open",
        FRIENDS_ONLY: "friends_only",
    } as const;
    export type PartyMode = (typeof PartyMode)[keyof typeof PartyMode];
    export interface UpdatePartyDto {
        mode?: PartyMode;
        leader?: string;
    }
    export type UpdatePartyArgs = {
        data: UpdatePartyDto;
    };
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }
    export interface GameParty {
        partyId: string;
        leader: string;
        mode: PartyMode;
        lastUpdated: number;
        members: PublicUser[];
    }
    export interface PartyData {
        leader: string;
        partyId: string;
        mode: PartyMode;
        lastUpdated: number;
    }
    export interface PartySnapshot extends PartyData {
        members: PublicUser[];
        invited: string[];
    }

    export interface ClientSpec {
        getUserParty(
            args: GetUserPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameParty | undefined }>;
        getParty(args: GetPartyArgs["params"], options?: RequestOptions): Promise<{ party: GameParty | undefined }>;
        getSelfParty(options?: RequestOptions): Promise<{ party: PartySnapshot }>;
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

        async getUserParty(
            args: GetUserPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameParty | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Party:getUserParty",
                path: `/parties/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:getUserParty",
            });
        }
        async getParty(
            args: GetPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameParty | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Party:getParty",
                path: `/parties/party-id/${encodeURIComponent(args.partyId)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:getParty",
            });
        }
        async getSelfParty(options?: RequestOptions): Promise<{ party: PartySnapshot }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Party:getSelfParty",
                path: `/parties/party/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Party:getSelfParty",
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
// ====+==== Servers TYPES ====+====
export namespace GameCoordinatorServers {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AccessMode = {
        CLOSED: "CLOSED",
        OPEN: "OPEN",
        FRIENDS_ONLY: "FRIENDS_ONLY",
    } as const;
    export type AccessMode = (typeof AccessMode)[keyof typeof AccessMode];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AgonesFleet = {
        COST_OPTIMIZED: "cost-optimized",
        STANDARD: "standard",
        HIGH_PERFORMANCE: "high-performance",
    } as const;
    export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];
    export interface CreateServerDto {
        sceneId?: string;
        region?: string;
        accessMode?: AccessMode;
        allowedUids?: string[];
        maxPlayers?: number;
        tags?: string[];
        gameConfig?: unknown;
        fleet?: AgonesFleet;
    }
    export type CreateServerArgs = {
        data: CreateServerDto;
    };
    export type VerifyAgonesCommunicationArgs = {
        params: {
            clusterId: string;
        };
    };
    export interface QueryServersDto {
        serverIds: string[];
    }
    export type GetServersArgs = {
        query: QueryServersDto;
    };
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
    export interface PublicServerData {
        serverId: string;
        playerCount: number;
        maxPlayers: number;
        name?: string;
        description?: string;
        sceneId: string;
        accessMode: AccessMode;
        tags: string[];
    }
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }
    export interface ServerListEntryWithFriends extends PublicServerData {
        friends: PublicUser[];
    }

    export interface ClientSpec {
        getRegionIds(options?: RequestOptions): Promise<{ regionIds: string[] }>;
        getPingServers(options?: RequestOptions): Promise<{ [regionId: string]: string }>;
        createServer(args: CreateServerArgs["data"], options?: RequestOptions): Promise<PublicServerData>;
        verifyAgonesCommunication(
            args: VerifyAgonesCommunicationArgs["params"],
            options?: RequestOptions,
        ): Promise<{ clusterId: string; success: boolean; active: boolean; redirectedTo?: string }>;
        getServers(
            args: GetServersArgs["query"],
            options?: RequestOptions,
        ): Promise<{ [serverId: string]: PublicServerData }>;
        getServerList(args: GetServerListArgs, options?: RequestOptions): Promise<{ entries: PublicServerData[] }>;
        getServerListOfFriends(
            args: GetServerListOfFriendsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ entries: ServerListEntryWithFriends[] }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getRegionIds(options?: RequestOptions): Promise<{ regionIds: string[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getRegionIds",
                path: `/servers/regions`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getRegionIds",
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
        async createServer(args: CreateServerArgs["data"], options?: RequestOptions): Promise<PublicServerData> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Servers:createServer",
                path: `/servers/create`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:createServer",
                body: args,
            });
        }
        async verifyAgonesCommunication(
            args: VerifyAgonesCommunicationArgs["params"],
            options?: RequestOptions,
        ): Promise<{ clusterId: string; success: boolean; active: boolean; redirectedTo?: string }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Servers:verifyAgonesCommunication",
                path: `/servers/verify-agones-communication/cluster-id/${encodeURIComponent(args.clusterId)}/ready`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:verifyAgonesCommunication",
            });
        }
        async getServers(
            args: GetServersArgs["query"],
            options?: RequestOptions,
        ): Promise<{ [serverId: string]: PublicServerData }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getServers",
                path: `/servers/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getServers",
                query: args,
            });
        }
        async getServerList(
            args: GetServerListArgs,
            options?: RequestOptions,
        ): Promise<{ entries: PublicServerData[] }> {
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
        ): Promise<{ entries: ServerListEntryWithFriends[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Servers:getServerListOfFriends",
                path: `/servers/game-id/${encodeURIComponent(args.gameId)}/list/friends`,
                retryKey: options?.retryKey ?? "GameCoordinator:Servers:getServerListOfFriends",
            });
        }
    }
}
// ====+==== Stats TYPES ====+====
export namespace GameCoordinatorStats {
    export interface GamePlayerCountDto {
        gameIds: string[];
    }
    export type GetGamePlayersArgs = {
        data: GamePlayerCountDto;
    };

    export interface ClientSpec {
        getStats(
            options?: RequestOptions,
        ): Promise<{ players: { online: number; inGame: number }; games: { active: number } }>;
        getGamePlayers(
            args: GetGamePlayersArgs["data"],
            options?: RequestOptions,
        ): Promise<{ [gameId: string]: number }>;
        getTopGames(options?: RequestOptions): Promise<[string, number][]>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getStats(
            options?: RequestOptions,
        ): Promise<{ players: { online: number; inGame: number }; games: { active: number } }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Stats:getStats",
                path: `/stats/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Stats:getStats",
            });
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
// ====+==== SteamAuth TYPES ====+====
export namespace GameCoordinatorSteamAuth {
    export type SteamAuthReturnArgs = {
        query: {
            site: string;
        };
    };

    export interface ClientSpec {
        steamAuthMain(options?: RequestOptions): Promise<void>;
        steamAuthCreate(options?: RequestOptions): Promise<void>;
        steamAuthTest(options?: RequestOptions): Promise<void>;
        steamAuthReturn(args: SteamAuthReturnArgs["query"], options?: RequestOptions): Promise<void>;
        steamAuthInGame(options?: RequestOptions): Promise<{ firebaseToken: string }>;
        steamAuthInGamePlaytest(options?: RequestOptions): Promise<{ firebaseToken: string }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async steamAuthMain(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthMain",
                path: `/auth/steam/`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthMain",
            });
        }
        async steamAuthCreate(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthCreate",
                path: `/auth/steam/create`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthCreate",
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
        async steamAuthReturn(args: SteamAuthReturnArgs["query"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:SteamAuth:steamAuthReturn",
                path: `/auth/steam/return`,
                retryKey: options?.retryKey ?? "GameCoordinator:SteamAuth:steamAuthReturn",
                query: args,
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
    }
}
// ====+==== Transfers TYPES ====+====
export namespace GameCoordinatorTransfers {
    export interface TransferToGameDto {
        uids: string[];
        gameId: string;
        preferredServerId?: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }
    export type SendToGameArgs = {
        data: TransferToGameDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AccessMode = {
        CLOSED: "CLOSED",
        OPEN: "OPEN",
        FRIENDS_ONLY: "FRIENDS_ONLY",
    } as const;
    export type AccessMode = (typeof AccessMode)[keyof typeof AccessMode];
    export interface TransferToMatchingServerDto {
        uids: string[];
        sceneId?: string;
        maxPlayers?: number;
        regions?: string[];
        tag?: string;
        accessMode?: AccessMode;
        serverId?: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }
    export type SendToMatchingServerArgs = {
        data: TransferToMatchingServerDto;
    };
    export interface TransferToPlayerDto {
        uids: string[];
        targetUserId: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }
    export type SendToPlayerArgs = {
        data: TransferToPlayerDto;
    };
    export interface TransferToServerIdDto {
        uids: string[];
        serverId: string;
        loadingScreenImageId?: string;
        serverTransferData?: unknown;
        clientTransferData?: unknown;
    }
    export type SendToServerArgs = {
        data: TransferToServerIdDto;
    };
    export interface GameTransferValidationDto {
        userIdToken: string;
    }
    export type ValidateTransferArgs = {
        data: GameTransferValidationDto;
    };
    export interface ClientTransferRequestDto {
        gameId: string;
        preferredServerId?: string;
        withParty?: boolean;
    }
    export type RequestSelfTransferArgs = {
        data: ClientTransferRequestDto;
    };
    export interface TransferSuccessResult {
        transfersRequested: true;
        pendingTransfer: boolean;
        userIds: string[];
    }
    export interface TransferFailureResult {
        transfersRequested: false;
        reason: string;
    }
    export type TransferResult = TransferSuccessResult | TransferFailureResult;
    export interface GameServer {
        serverId: string;
        ip: string;
        port: number;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const TransferSource = {
        USER: "USER",
        SERVER: "SERVER",
    } as const;
    export type TransferSource = (typeof TransferSource)[keyof typeof TransferSource];
    export type TransferSourceData =
        | { type: typeof TransferSource.USER; userId: string }
        | { type: typeof TransferSource.SERVER; gameId: string; serverId: string };
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }
    export interface ServerTransferData {
        gameId: string;
        gameServer: GameServer;
        requestTime: number;
        transferSource: TransferSourceData;
        user: PublicUser;
        orgRoleName: string | undefined;
        isEasyEmployee: boolean;
        clientTransferData?: unknown;
        serverTransferData?: unknown;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AllocationState = {
        ALLOCATED: "ALLOCATED",
        RECENTLY_ALLOCATED: "RECENTLY_ALLOCATED",
        PENDING: "PENDING",
    } as const;
    export type AllocationState = (typeof AllocationState)[keyof typeof AllocationState];
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AgonesFleet = {
        COST_OPTIMIZED: "cost-optimized",
        STANDARD: "standard",
        HIGH_PERFORMANCE: "high-performance",
    } as const;
    export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];
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
        "agones.dev/sdk-AccessMode": AccessMode;
        MaxPlayers: string;
        MarkedForShutdown?: string;
    }
    export interface PreloadablePackageVersionLabel {
        packageSlug: string;
        packageVersionId: string;
        assetVersionNumber: number;
        codeVersionNumber: number;
        publishVersionNumber: number | undefined;
    }
    export type PackageVersionLabel = { packageSlug: string } | PreloadablePackageVersionLabel;
    export interface BaseServerData<T extends AllocationState> {
        allocationState: T;
        organizationId: string;
        gameId: string;
        gameVersion: { gameVersionId: string; assetVersionNumber: number; codeVersionNumber: number };
        serverId: string;
        region: string;
        fleet: AgonesFleet;
        labels: StandardServerLabels;
        requiredPackages: PackageVersionLabel[];
        maxPlayers: number;
        serverListData: { name?: string; description?: string; listed: boolean };
        status: {
            tags: { values: string[] | undefined };
            allowedPlayers: { values: string[] | undefined };
            players: { capacity: number; values: string[] | undefined };
        };
    }
    export interface AllocatedServerData extends BaseServerData<typeof AllocationState.ALLOCATED> {
        cluster: string;
        gameServer: GameServer;
        status: {
            state: "Ready" | "Allocated" | "Shutdown" | "Scheduled";
            tags: { capacity: number; values: string[] | undefined };
            players: { capacity: number; values: string[] | undefined };
            allowedPlayers: { capacity: number; values: string[] | undefined };
        };
    }
    export interface ClientTransferData {
        gameId: string;
        gameVersion: AllocatedServerData["gameVersion"];
        gameServer: GameServer;
        requestTime: number;
        transferData?: unknown;
        requiredPackages: PackageVersionLabel[];
        transferSource: TransferSourceData;
        orgRoleName: string | undefined;
        loadingScreenImageId?: string;
        clientTransferData: unknown;
    }

    export interface ClientSpec {
        sendToGame(args: SendToGameArgs["data"], options?: RequestOptions): Promise<TransferResult>;
        sendToMatchingServer(args: SendToMatchingServerArgs["data"], options?: RequestOptions): Promise<TransferResult>;
        sendToPlayer(args: SendToPlayerArgs["data"], options?: RequestOptions): Promise<TransferResult>;
        sendToServer(args: SendToServerArgs["data"], options?: RequestOptions): Promise<TransferResult>;
        validateTransfer(args: ValidateTransferArgs["data"], options?: RequestOptions): Promise<ServerTransferData>;
        requestSelfTransfer(args: RequestSelfTransferArgs["data"], options?: RequestOptions): Promise<TransferResult>;
        requestSelfToPartyTransfer(options?: RequestOptions): Promise<TransferResult>;
        requestTransferPartyToSelf(options?: RequestOptions): Promise<TransferResult>;
        requestCurrentTransfer(options?: RequestOptions): Promise<{ transfer: ClientTransferData | undefined }>;
        cancelTransfer(options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async sendToGame(args: SendToGameArgs["data"], options?: RequestOptions): Promise<TransferResult> {
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
        ): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:sendToMatchingServer",
                path: `/transfers/transfer/target/matching`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:sendToMatchingServer",
                body: args,
            });
        }
        async sendToPlayer(args: SendToPlayerArgs["data"], options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:sendToPlayer",
                path: `/transfers/transfer/target/player`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:sendToPlayer",
                body: args,
            });
        }
        async sendToServer(args: SendToServerArgs["data"], options?: RequestOptions): Promise<TransferResult> {
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
        ): Promise<ServerTransferData> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:validateTransfer",
                path: `/transfers/transfer/validate`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:validateTransfer",
                body: args,
            });
        }
        async requestSelfTransfer(
            args: RequestSelfTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestSelfTransfer",
                path: `/transfers/transfer/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestSelfTransfer",
                body: args,
            });
        }
        async requestSelfToPartyTransfer(options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestSelfToPartyTransfer",
                path: `/transfers/transfer/self/party`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestSelfToPartyTransfer",
            });
        }
        async requestTransferPartyToSelf(options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:requestTransferPartyToSelf",
                path: `/transfers/transfer/party`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestTransferPartyToSelf",
            });
        }
        async requestCurrentTransfer(options?: RequestOptions): Promise<{ transfer: ClientTransferData | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Transfers:requestCurrentTransfer",
                path: `/transfers/transfer/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:requestCurrentTransfer",
            });
        }
        async cancelTransfer(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Transfers:cancelTransfer",
                path: `/transfers/transfer/cancel`,
                retryKey: options?.retryKey ?? "GameCoordinator:Transfers:cancelTransfer",
            });
        }
    }
}
// ====+==== UserLocations TYPES ====+====
export namespace GameCoordinatorUserLocations {
    export interface QueryUserLocationsDto {
        userIds: string[];
    }
    export type FindArgs = {
        query: QueryUserLocationsDto;
    };

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
// ====+==== UserSession TYPES ====+====
export namespace GameCoordinatorUserSession {
    export type KickPlayerFromGCEdgeArgs = {
        params: {
            uid: string;
        };
    };
    export interface UpdateSessionDto {
        regionLatencies?: Record<string, number>;
    }
    export type UpdateSessionArgs = {
        data: UpdateSessionDto;
    };

    export interface ClientSpec {
        kickPlayerFromGCEdge(args: KickPlayerFromGCEdgeArgs["params"], options?: RequestOptions): Promise<void>;
        updateSession(args: UpdateSessionArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async kickPlayerFromGCEdge(args: KickPlayerFromGCEdgeArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:UserSession:kickPlayerFromGCEdge",
                path: `/user-session/kick/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserSession:kickPlayerFromGCEdge",
            });
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
// ====+==== UserStatus TYPES ====+====
export namespace GameCoordinatorUserStatus {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const UserStatus = {
        OFFLINE: "offline",
        ONLINE: "online",
        IN_GAME: "in_game",
    } as const;
    export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
    export interface UpdateUserStatusDto {
        status: UserStatus;
        gameId?: string;
        serverId?: string;
        metadata?: unknown;
    }
    export type UpdateUserStatusArgs = {
        data: UpdateUserStatusDto;
    };
    export interface BaseUserData {
        userId: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const PartyMode = {
        CLOSED: "closed",
        OPEN: "open",
        FRIENDS_ONLY: "friends_only",
    } as const;
    export type PartyMode = (typeof PartyMode)[keyof typeof PartyMode];
    export interface BaseUserStatus<S extends UserStatus> extends BaseUserData {
        status: S;
        partyMode: PartyMode;
        metadata?: unknown;
    }
    export type UserOfflineStatus = BaseUserStatus<typeof UserStatus.OFFLINE>;
    export type UserOnlineStatus = BaseUserStatus<typeof UserStatus.ONLINE>;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const GameVisibility = {
        PUBLIC: "PUBLIC",
        PRIVATE: "PRIVATE",
        UNLISTED: "UNLISTED",
    } as const;
    export type GameVisibility = (typeof GameVisibility)[keyof typeof GameVisibility];
    export interface UserInGameStatus extends BaseUserStatus<typeof UserStatus.IN_GAME> {
        gameId: string;
        game: { name: string; icon: string; visibility: GameVisibility };
        serverId?: string;
    }
    export type UserStatusData = UserOfflineStatus | UserOnlineStatus | UserInGameStatus;
    export type UserStatusDataWithRefreshHint = UserStatusData & { refreshIn: number };

    export interface ClientSpec {
        updateUserStatus(
            args: UpdateUserStatusArgs["data"],
            options?: RequestOptions,
        ): Promise<UserStatusDataWithRefreshHint>;
        refreshFriends(options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async updateUserStatus(
            args: UpdateUserStatusArgs["data"],
            options?: RequestOptions,
        ): Promise<UserStatusDataWithRefreshHint> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "GameCoordinator:UserStatus:updateUserStatus",
                path: `/user-status/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserStatus:updateUserStatus",
                body: args,
            });
        }
        async refreshFriends(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:UserStatus:refreshFriends",
                path: `/user-status/friends`,
                retryKey: options?.retryKey ?? "GameCoordinator:UserStatus:refreshFriends",
            });
        }
    }
}
// ====+==== Users TYPES ====+====
export namespace GameCoordinatorUsers {
    export interface CreateUserDto {
        username: string;
    }
    export type CreateArgs = {
        data: CreateUserDto;
    };
    export interface QueryUsersDto {
        strict?: boolean;
        users: string[];
    }
    export type FindArgs = {
        query: QueryUsersDto;
    };
    export type GetByUidArgs = {
        params: {
            uid: string;
        };
        query?: {
            admin?: boolean;
        };
    };
    export interface QueryUserDto {
        username: string;
    }
    export type FindByUsernameArgs = {
        query: QueryUserDto;
    };
    export interface UpdateUserDto {
        username?: string;
        statusText?: string | undefined;
        profileImageId?: string | undefined;
    }
    export type UpdateArgs = {
        data: UpdateUserDto;
    };
    export type GetUsernameAvailabilityArgs = {
        query: QueryUserDto;
    };
    export interface AdminBanUserDto {
        username?: string;
        uid?: string;
        ban: boolean;
    }
    export type AdminBanUserArgs = {
        data: AdminBanUserDto;
    };
    export interface AdminEditUserDto {
        uid: string;
        username?: string;
        statusText?: string | undefined;
    }
    export type AdminEditUserArgs = {
        data: AdminEditUserDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const Role = {
        USER: "user",
        EASY_EMPLOYEE: "easy-employee",
        SERVICE: "service",
        GAME_SERVER: "game-server",
        GCP: "gcp",
    } as const;
    export type Role = (typeof Role)[keyof typeof Role];
    export type EasyUserWithRole = GameCoordinatorPrisma.EasyUser & { role: Role };
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }

    export interface ClientSpec {
        create(args: CreateArgs["data"], options?: RequestOptions): Promise<{ user: EasyUserWithRole }>;
        deleteUser(options?: RequestOptions): Promise<{ success: boolean }>;
        login(options?: RequestOptions): Promise<{ user: EasyUserWithRole | undefined }>;
        find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorPrisma.EasyUser[] | PublicUser[]>;
        getByUid(
            args: GetByUidArgs,
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser | PublicUser | undefined }>;
        findByUsername(
            args: FindByUsernameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ user: PublicUser | undefined }>;
        update(args: UpdateArgs["data"], options?: RequestOptions): Promise<{ user: GameCoordinatorPrisma.EasyUser }>;
        getUsernameAvailability(
            args: GetUsernameAvailabilityArgs["query"],
            options?: RequestOptions,
        ): Promise<{ available: boolean }>;
        adminBanUser(
            args: AdminBanUserArgs["data"],
            options?: RequestOptions,
        ): Promise<{ uid: string; username: string | undefined; banned: boolean }>;
        adminEditUser(
            args: AdminEditUserArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async create(args: CreateArgs["data"], options?: RequestOptions): Promise<{ user: EasyUserWithRole }> {
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
        async login(options?: RequestOptions): Promise<{ user: EasyUserWithRole | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:login",
                path: `/users/self`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:login",
            });
        }
        async find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorPrisma.EasyUser[] | PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:find",
                path: `/users/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:find",
                query: args,
            });
        }
        async getByUid(
            args: GetByUidArgs,
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser | PublicUser | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:getByUid",
                path: `/users/uid/${encodeURIComponent(args.params.uid)}`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:getByUid",
                query: args.query,
            });
        }
        async findByUsername(
            args: FindByUsernameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ user: PublicUser | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:Users:findByUsername",
                path: `/users/user`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:findByUsername",
                query: args,
            });
        }
        async update(
            args: UpdateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "GameCoordinator:Users:update",
                path: `/users/`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:update",
                body: args,
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
        async adminBanUser(
            args: AdminBanUserArgs["data"],
            options?: RequestOptions,
        ): Promise<{ uid: string; username: string | undefined; banned: boolean }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "GameCoordinator:Users:adminBanUser",
                path: `/users/admin/ban`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:adminBanUser",
                body: args,
            });
        }
        async adminEditUser(
            args: AdminEditUserArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser }> {
            return await this.makeRequest({
                method: "PATCH",
                routeId: "GameCoordinator:Users:adminEditUser",
                path: `/users/admin/edit`,
                retryKey: options?.retryKey ?? "GameCoordinator:Users:adminEditUser",
                body: args,
            });
        }
    }
}
// ====+==== BundleVersions TYPES ====+====
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
// ====+==== MMQueue TYPES ====+====
export namespace GameCoordinatorMMQueue {
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
    export type GetGameConfigurationsArgs = {
        params: {
            gameId: string;
        };
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const AgonesFleet = {
        COST_OPTIMIZED: "cost-optimized",
        STANDARD: "standard",
        HIGH_PERFORMANCE: "high-performance",
    } as const;
    export type AgonesFleet = (typeof AgonesFleet)[keyof typeof AgonesFleet];
    export interface LinearExpansionSettings {
        type: "Linear";
        base: number;
        delta: number;
        limit: number;
        secondsBetweenExpansions: number;
    }
    export interface FixedExpansionSettings {
        type: "Fixed";
        values: number[];
        secondsBetweenExpansions: number;
    }
    export type ExpansionSettings = LinearExpansionSettings | FixedExpansionSettings;
    export interface PutQueueTeamDto {
        name: string;
        minSize: number | ExpansionSettings;
        maxSize: number | ExpansionSettings;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const RuleType = {
        TeamFixedRolesRule: "TeamFixedRolesRule",
        TeamSizeBalanceRule: "TeamSizeBalanceRule",
        MatchSetIntersectionRule: "MatchSetIntersectionRule",
        StringEqualityRule: "StringEqualityRule",
        DifferenceRule: "DifferenceRule",
        RegionPriorityRule: "RegionPriorityRule",
    } as const;
    export type RuleType = (typeof RuleType)[keyof typeof RuleType];
    export interface DifferenceRule {
        attribute: string;
        difference: number | ExpansionSettings;
        scope: "match" | "team";
        secondsUntilOptional?: number;
    }
    export interface StringEqualityRule {
        attribute: string;
        scope: "match" | "team";
        secondsUntilOptional?: number;
        otherTeamsShouldBeDifferent?: boolean;
    }
    export interface MatchSetIntersectionRule {
        attribute: string;
        minSize: number | ExpansionSettings;
        secondsUntilOptional?: number;
    }
    export interface TeamSizeBalanceRule {
        difference: number | ExpansionSettings;
        secondsUntilOptional?: number;
    }
    export interface TeamFixedRolesRule {
        teams: string[];
        attribute: string;
        teamMakeup: { [roleName: string]: { quantity: number } };
        onEmptyBackfillMissingRoles?: boolean;
    }
    export interface RegionPriorityRule {
        waitPerRegion: number;
        secondsUntilOptional?: number;
    }
    export type Rule =
        | DifferenceRule
        | StringEqualityRule
        | MatchSetIntersectionRule
        | TeamSizeBalanceRule
        | TeamFixedRolesRule
        | RegionPriorityRule;
    export interface PutQueueRuleDto {
        name: string;
        type: RuleType;
        data: Rule;
    }
    export interface PutQueueDto {
        sceneId: string;
        fleet?: AgonesFleet;
        enabled?: boolean;
        teams?: PutQueueTeamDto[];
        rules?: PutQueueRuleDto[];
    }
    export type PutQueueConfigurationArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
        data: PutQueueDto;
    };
    export type DeleteQueueConfigurationArgs = {
        params: {
            gameId: string;
            queueId: string;
        };
    };
    export interface MatchmakingQueueTeam {
        name: string;
        minSize: number | ExpansionSettings;
        maxSize: number | ExpansionSettings;
    }
    export interface MatchmakingQueueRule {
        name: string;
        type: RuleType;
        data: Rule;
    }
    export interface MatchmakingQueueConfig {
        queueId: string;
        gameId: string;
        sceneId: string;
        fleet: AgonesFleet;
        teams?: MatchmakingQueueTeam[];
        rules?: MatchmakingQueueRule[];
        enabled: boolean;
        createdAt: string;
    }

    export interface ClientSpec {
        getQueueConfiguration(
            args: GetQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<{ queueConfig: MatchmakingQueueConfig | undefined }>;
        getGameConfigurations(
            args: GetGameConfigurationsArgs["params"],
            options?: RequestOptions,
        ): Promise<MatchmakingQueueConfig[]>;
        putQueueConfiguration(
            args: PutQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<MatchmakingQueueConfig>;
        deleteQueueConfiguration(args: DeleteQueueConfigurationArgs["params"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getQueueConfiguration(
            args: GetQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<{ queueConfig: MatchmakingQueueConfig | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MMQueue:getQueueConfiguration",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.params.gameId)}/queue-id/${encodeURIComponent(args.params.queueId)}/configuration`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:getQueueConfiguration",
                query: args.query,
            });
        }
        async getGameConfigurations(
            args: GetGameConfigurationsArgs["params"],
            options?: RequestOptions,
        ): Promise<MatchmakingQueueConfig[]> {
            return await this.makeRequest({
                method: "GET",
                routeId: "GameCoordinator:MMQueue:getGameConfigurations",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.gameId)}/configuration`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:getGameConfigurations",
            });
        }
        async putQueueConfiguration(
            args: PutQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<MatchmakingQueueConfig> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "GameCoordinator:MMQueue:putQueueConfiguration",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.params.gameId)}/queue-id/${encodeURIComponent(args.params.queueId)}/configuration`,
                retryKey: options?.retryKey ?? "GameCoordinator:MMQueue:putQueueConfiguration",
                body: args.data,
            });
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
    }
}

export interface GameCoordinatorClientSpec {
    chat: GameCoordinatorChat.ClientSpec;
    friends: GameCoordinatorFriends.ClientSpec;
    groupsDebug: GameCoordinatorGroupsDebug.ClientSpec;
    groups: GameCoordinatorGroups.ClientSpec;
    matchmakingDebug: GameCoordinatorMatchmakingDebug.ClientSpec;
    matchmaking: GameCoordinatorMatchmaking.ClientSpec;
    party: GameCoordinatorParty.ClientSpec;
    servers: GameCoordinatorServers.ClientSpec;
    stats: GameCoordinatorStats.ClientSpec;
    steamAuth: GameCoordinatorSteamAuth.ClientSpec;
    transfers: GameCoordinatorTransfers.ClientSpec;
    userLocations: GameCoordinatorUserLocations.ClientSpec;
    userSession: GameCoordinatorUserSession.ClientSpec;
    userStatus: GameCoordinatorUserStatus.ClientSpec;
    users: GameCoordinatorUsers.ClientSpec;
    bundleVersions: GameCoordinatorBundleVersions.ClientSpec;
    mMQueue: GameCoordinatorMMQueue.ClientSpec;
}

export class GameCoordinatorClient implements GameCoordinatorClientSpec {
    public readonly chat: GameCoordinatorChat.ClientSpec;
    public readonly friends: GameCoordinatorFriends.ClientSpec;
    public readonly groupsDebug: GameCoordinatorGroupsDebug.ClientSpec;
    public readonly groups: GameCoordinatorGroups.ClientSpec;
    public readonly matchmakingDebug: GameCoordinatorMatchmakingDebug.ClientSpec;
    public readonly matchmaking: GameCoordinatorMatchmaking.ClientSpec;
    public readonly party: GameCoordinatorParty.ClientSpec;
    public readonly servers: GameCoordinatorServers.ClientSpec;
    public readonly stats: GameCoordinatorStats.ClientSpec;
    public readonly steamAuth: GameCoordinatorSteamAuth.ClientSpec;
    public readonly transfers: GameCoordinatorTransfers.ClientSpec;
    public readonly userLocations: GameCoordinatorUserLocations.ClientSpec;
    public readonly userSession: GameCoordinatorUserSession.ClientSpec;
    public readonly userStatus: GameCoordinatorUserStatus.ClientSpec;
    public readonly users: GameCoordinatorUsers.ClientSpec;
    public readonly bundleVersions: GameCoordinatorBundleVersions.ClientSpec;
    public readonly mMQueue: GameCoordinatorMMQueue.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.chat = new GameCoordinatorChat.Client(makeRequest);
        this.friends = new GameCoordinatorFriends.Client(makeRequest);
        this.groupsDebug = new GameCoordinatorGroupsDebug.Client(makeRequest);
        this.groups = new GameCoordinatorGroups.Client(makeRequest);
        this.matchmakingDebug = new GameCoordinatorMatchmakingDebug.Client(makeRequest);
        this.matchmaking = new GameCoordinatorMatchmaking.Client(makeRequest);
        this.party = new GameCoordinatorParty.Client(makeRequest);
        this.servers = new GameCoordinatorServers.Client(makeRequest);
        this.stats = new GameCoordinatorStats.Client(makeRequest);
        this.steamAuth = new GameCoordinatorSteamAuth.Client(makeRequest);
        this.transfers = new GameCoordinatorTransfers.Client(makeRequest);
        this.userLocations = new GameCoordinatorUserLocations.Client(makeRequest);
        this.userSession = new GameCoordinatorUserSession.Client(makeRequest);
        this.userStatus = new GameCoordinatorUserStatus.Client(makeRequest);
        this.users = new GameCoordinatorUsers.Client(makeRequest);
        this.bundleVersions = new GameCoordinatorBundleVersions.Client(makeRequest);
        this.mMQueue = new GameCoordinatorMMQueue.Client(makeRequest);
    }
}
