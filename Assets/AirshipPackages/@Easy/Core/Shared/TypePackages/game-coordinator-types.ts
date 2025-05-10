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

    export interface GameCoordinatorChatClient {
        sendDirectMessage(args: SendDirectMessageArgs["data"], options?: RequestOptions): Promise<void>;
        sendPartyMessage(args: SendPartyMessageArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class GameCoordinatorChatBaseClient implements GameCoordinatorChatClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async sendDirectMessage(args: SendDirectMessageArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/chat/message/direct`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async sendPartyMessage(args: SendPartyMessageArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/chat/message/party`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
    }
}
// ====+==== Friends TYPES ====+====
export namespace GameCoordinatorFriends {
    export type GetFriendsOfUserArgs = {
        params: {
            uid: string;
        };
    };
    export type StatusWithOtherUserArgs = {
        params: {
            uid: string;
        };
    };
    export type StatusOf2UsersArgs = {
        params: {
            uid: string;
            uid2: string;
        };
    };
    export interface QueryFriendsDto {
        users: string[];
    }
    export type FindArgs = {
        query: QueryFriendsDto;
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
    export interface FriendsOfUsers {
        [uid: string]: PublicUser[];
    }
    export interface FriendRequests {
        outgoingRequests: PublicUser[];
        incomingRequests: PublicUser[];
        friends: PublicUser[];
    }
    export type FriendshipRequestResult = "initiated" | "accepted";

    export interface GameCoordinatorFriendsClient {
        getFriends(options?: RequestOptions): Promise<PublicUser[]>;
        getFriendsOfUser(args: GetFriendsOfUserArgs["params"], options?: RequestOptions): Promise<PublicUser[]>;
        statusWithOtherUser(args: StatusWithOtherUserArgs["params"], options?: RequestOptions): Promise<FriendsStatus>;
        statusOf2Users(args: StatusOf2UsersArgs["params"], options?: RequestOptions): Promise<FriendsStatus>;
        find(args: FindArgs["query"], options?: RequestOptions): Promise<FriendsOfUsers>;
        terminateFriendship(args: TerminateFriendshipArgs["params"], options?: RequestOptions): Promise<void>;
        getRequests(options?: RequestOptions): Promise<FriendRequests>;
        requestFriendship(
            args: RequestFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: FriendshipRequestResult }>;
    }

    export class GameCoordinatorFriendsBaseClient implements GameCoordinatorFriendsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getFriends(options?: RequestOptions): Promise<PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/friends/self`,
                retryKey: options?.retryKey,
            });
        }
        async getFriendsOfUser(args: GetFriendsOfUserArgs["params"], options?: RequestOptions): Promise<PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/friends/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey,
            });
        }
        async statusWithOtherUser(
            args: StatusWithOtherUserArgs["params"],
            options?: RequestOptions,
        ): Promise<FriendsStatus> {
            return await this.makeRequest({
                method: "GET",
                path: `/friends/uid/${encodeURIComponent(args.uid)}/status`,
                retryKey: options?.retryKey,
            });
        }
        async statusOf2Users(args: StatusOf2UsersArgs["params"], options?: RequestOptions): Promise<FriendsStatus> {
            return await this.makeRequest({
                method: "GET",
                path: `/friends/uid/${encodeURIComponent(args.uid)}/uid2/${encodeURIComponent(args.uid2)}/status`,
                retryKey: options?.retryKey,
            });
        }
        async find(args: FindArgs["query"], options?: RequestOptions): Promise<FriendsOfUsers> {
            return await this.makeRequest({
                method: "GET",
                path: `/friends/`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
        async terminateFriendship(args: TerminateFriendshipArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/friends/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey,
            });
        }
        async getRequests(options?: RequestOptions): Promise<FriendRequests> {
            return await this.makeRequest({
                method: "GET",
                path: `/friends/requests/self`,
                retryKey: options?.retryKey,
            });
        }
        async requestFriendship(
            args: RequestFriendshipArgs["data"],
            options?: RequestOptions,
        ): Promise<{ result: FriendshipRequestResult }> {
            return await this.makeRequest({
                method: "POST",
                path: `/friends/requests/self`,
                retryKey: options?.retryKey,
                body: args,
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

    export interface GameCoordinatorGroupsClient {
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

    export class GameCoordinatorGroupsBaseClient implements GameCoordinatorGroupsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async createGroup(args: CreateGroupArgs["data"], options?: RequestOptions): Promise<{ group: Group }> {
            return await this.makeRequest({
                method: "POST",
                path: `/groups/`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async getGroupById(
            args: GetGroupByIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/groups/group-id/${encodeURIComponent(args.groupId)}`,
                retryKey: options?.retryKey,
            });
        }
        async getGroupForUserId(
            args: GetGroupForUserIdArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/groups/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey,
            });
        }
        async getGameGroupForSelf(
            args: GetGameGroupForSelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ group: Group | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/groups/game-id/${encodeURIComponent(args.gameId)}/self`,
                retryKey: options?.retryKey,
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
    export interface MatchTeamGroupPlayer {
        id: string;
        attributes: Record<string, unknown>;
    }
    export interface MatchTeamGroup {
        id: string;
        players: MatchTeamGroupPlayer[];
        attributes: Record<string, unknown>;
    }
    export interface MatchTeam {
        name: string;
        groups: MatchTeamGroup[];
    }
    export interface MatchConfig {
        teams: MatchTeam[];
    }
    export interface CreateMatchDto {
        gameId: string;
        queueId: string;
        region: string;
        groupIds: string[];
        matchConfig: MatchConfig;
    }
    export type CreateMatchArgs = {
        data: CreateMatchDto;
    };
    export interface CompleteMatchDto {
        serverId: string;
        gameId: string;
        groupIds: string[];
    }
    export type ProcessCompletedMatchArgs = {
        data: CompleteMatchDto;
    };
    export interface TicketFailedDto {
        gameId: string;
        groupId: string;
        queueId: string;
    }
    export type NotifyTicketFailedArgs = {
        data: TicketFailedDto;
    };

    export interface GameCoordinatorMatchmakingClient {
        joinQueue(args: JoinQueueArgs["data"], options?: RequestOptions): Promise<void>;
        leaveQueue(args: LeaveQueueArgs["data"], options?: RequestOptions): Promise<void>;
        leaveQueueSelf(args: LeaveQueueSelfArgs["data"], options?: RequestOptions): Promise<void>;
        createMatch(args: CreateMatchArgs["data"], options?: RequestOptions): Promise<void>;
        processCompletedMatch(args: ProcessCompletedMatchArgs["data"], options?: RequestOptions): Promise<void>;
        notifyTicketFailed(args: NotifyTicketFailedArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class GameCoordinatorMatchmakingBaseClient implements GameCoordinatorMatchmakingClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async joinQueue(args: JoinQueueArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/matchmaking/queue/join`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async leaveQueue(args: LeaveQueueArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/matchmaking/queue/leave`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async leaveQueueSelf(args: LeaveQueueSelfArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/matchmaking/queue/leave/self`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async createMatch(args: CreateMatchArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/matchmaking/match/create`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async processCompletedMatch(args: ProcessCompletedMatchArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/matchmaking/match/complete`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async notifyTicketFailed(args: NotifyTicketFailedArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/matchmaking/notify/ticket-failed`,
                retryKey: options?.retryKey,
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

    export interface GameCoordinatorPartyClient {
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

    export class GameCoordinatorPartyBaseClient implements GameCoordinatorPartyClient {
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
                path: `/parties/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey,
            });
        }
        async getParty(
            args: GetPartyArgs["params"],
            options?: RequestOptions,
        ): Promise<{ party: GameParty | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/parties/party-id/${encodeURIComponent(args.partyId)}`,
                retryKey: options?.retryKey,
            });
        }
        async getSelfParty(options?: RequestOptions): Promise<{ party: PartySnapshot }> {
            return await this.makeRequest({
                method: "GET",
                path: `/parties/party/self`,
                retryKey: options?.retryKey,
            });
        }
        async inviteUser(args: InviteUserArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/parties/party/invite`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async joinParty(args: JoinPartyArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/parties/party/join`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async removeFromParty(args: RemoveFromPartyArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/parties/party/remove`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async updateParty(args: UpdatePartyArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "PUT",
                path: `/parties/party`,
                retryKey: options?.retryKey,
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
    export type GetPendingCountArgs = {
        params: {
            clusterId: string;
            fleet: AgonesFleet;
        };
    };
    export type ReadyNotificationArgs = {
        params: {
            clusterId: string;
            fleet: AgonesFleet;
        };
    };
    export type NotifyTicketFailureArgs = {
        params: {
            regionId: string;
            clusterId: string;
            tickedId: string;
            ticketId: string;
        };
    };
    export type NotifyAllocationFailureArgs = {
        params: {
            regionId: string;
            clusterId: string;
            serverId: string;
        };
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
            page?: string;
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

    export interface GameCoordinatorServersClient {
        getRegionIds(options?: RequestOptions): Promise<{ regionIds: string[] }>;
        getPingServers(options?: RequestOptions): Promise<{ [regionId: string]: string }>;
        createServer(args: CreateServerArgs["data"], options?: RequestOptions): Promise<PublicServerData>;
        getPendingCount(
            args: GetPendingCountArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pendingAllocations: number; fixedMinimumReplicas: number }>;
        readyNotification(args: ReadyNotificationArgs["params"], options?: RequestOptions): Promise<void>;
        notifyTicketFailure(args: NotifyTicketFailureArgs["params"], options?: RequestOptions): Promise<void>;
        notifyAllocationFailure(args: NotifyAllocationFailureArgs["params"], options?: RequestOptions): Promise<void>;
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

    export class GameCoordinatorServersBaseClient implements GameCoordinatorServersClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getRegionIds(options?: RequestOptions): Promise<{ regionIds: string[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/servers/regions`,
                retryKey: options?.retryKey,
            });
        }
        async getPingServers(options?: RequestOptions): Promise<{ [regionId: string]: string }> {
            return await this.makeRequest({
                method: "GET",
                path: `/servers/regions/ping-servers`,
                retryKey: options?.retryKey,
            });
        }
        async createServer(args: CreateServerArgs["data"], options?: RequestOptions): Promise<PublicServerData> {
            return await this.makeRequest({
                method: "POST",
                path: `/servers/create`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async getPendingCount(
            args: GetPendingCountArgs["params"],
            options?: RequestOptions,
        ): Promise<{ pendingAllocations: number; fixedMinimumReplicas: number }> {
            return await this.makeRequest({
                method: "GET",
                path: `/servers/cluster/cluster-id/${encodeURIComponent(args.clusterId)}/fleet/${encodeURIComponent(args.fleet)}/pending`,
                retryKey: options?.retryKey,
            });
        }
        async readyNotification(args: ReadyNotificationArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/servers/cluster/cluster-id/${encodeURIComponent(args.clusterId)}/fleet/${encodeURIComponent(args.fleet)}/notify/ready`,
                retryKey: options?.retryKey,
            });
        }
        async notifyTicketFailure(args: NotifyTicketFailureArgs["params"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/servers/notify/region-id/${encodeURIComponent(args.regionId)}/cluster-id/${encodeURIComponent(args.clusterId)}/ticket-id/${encodeURIComponent(args.ticketId)}/failure`,
                retryKey: options?.retryKey,
            });
        }
        async notifyAllocationFailure(
            args: NotifyAllocationFailureArgs["params"],
            options?: RequestOptions,
        ): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/servers/notify/region-id/${encodeURIComponent(args.regionId)}/cluster-id/${encodeURIComponent(args.clusterId)}/server-id/${encodeURIComponent(args.serverId)}/failure`,
                retryKey: options?.retryKey,
            });
        }
        async verifyAgonesCommunication(
            args: VerifyAgonesCommunicationArgs["params"],
            options?: RequestOptions,
        ): Promise<{ clusterId: string; success: boolean; active: boolean; redirectedTo?: string }> {
            return await this.makeRequest({
                method: "POST",
                path: `/servers/verify-agones-communication/cluster-id/${encodeURIComponent(args.clusterId)}/ready`,
                retryKey: options?.retryKey,
            });
        }
        async getServers(
            args: GetServersArgs["query"],
            options?: RequestOptions,
        ): Promise<{ [serverId: string]: PublicServerData }> {
            return await this.makeRequest({
                method: "GET",
                path: `/servers/`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
        async getServerList(
            args: GetServerListArgs,
            options?: RequestOptions,
        ): Promise<{ entries: PublicServerData[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/servers/game-id/${encodeURIComponent(args.params.gameId)}/list`,
                retryKey: options?.retryKey,
                query: args.query,
            });
        }
        async getServerListOfFriends(
            args: GetServerListOfFriendsArgs["params"],
            options?: RequestOptions,
        ): Promise<{ entries: ServerListEntryWithFriends[] }> {
            return await this.makeRequest({
                method: "GET",
                path: `/servers/game-id/${encodeURIComponent(args.gameId)}/list/friends`,
                retryKey: options?.retryKey,
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

    export interface GameCoordinatorStatsClient {
        getStats(
            options?: RequestOptions,
        ): Promise<{ players: { online: number; inGame: number }; games: { active: number } }>;
        getGamePlayers(
            args: GetGamePlayersArgs["data"],
            options?: RequestOptions,
        ): Promise<{ [gameId: string]: number }>;
        getTopGames(options?: RequestOptions): Promise<[string, number][]>;
    }

    export class GameCoordinatorStatsBaseClient implements GameCoordinatorStatsClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getStats(
            options?: RequestOptions,
        ): Promise<{ players: { online: number; inGame: number }; games: { active: number } }> {
            return await this.makeRequest({
                method: "GET",
                path: `/stats/`,
                retryKey: options?.retryKey,
            });
        }
        async getGamePlayers(
            args: GetGamePlayersArgs["data"],
            options?: RequestOptions,
        ): Promise<{ [gameId: string]: number }> {
            return await this.makeRequest({
                method: "POST",
                path: `/stats/players/games`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async getTopGames(options?: RequestOptions): Promise<[string, number][]> {
            return await this.makeRequest({
                method: "GET",
                path: `/stats/top-games`,
                retryKey: options?.retryKey,
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

    export interface GameCoordinatorSteamAuthClient {
        steamAuthMain(options?: RequestOptions): Promise<void>;
        steamAuthCreate(options?: RequestOptions): Promise<void>;
        steamAuthTest(options?: RequestOptions): Promise<void>;
        steamAuthReturn(args: SteamAuthReturnArgs["query"], options?: RequestOptions): Promise<void>;
        steamAuthInGame(options?: RequestOptions): Promise<{ firebaseToken: string }>;
    }

    export class GameCoordinatorSteamAuthBaseClient implements GameCoordinatorSteamAuthClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async steamAuthMain(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                path: `/auth/steam/`,
                retryKey: options?.retryKey,
            });
        }
        async steamAuthCreate(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                path: `/auth/steam/create`,
                retryKey: options?.retryKey,
            });
        }
        async steamAuthTest(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                path: `/auth/steam/test`,
                retryKey: options?.retryKey,
            });
        }
        async steamAuthReturn(args: SteamAuthReturnArgs["query"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                path: `/auth/steam/return`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
        async steamAuthInGame(options?: RequestOptions): Promise<{ firebaseToken: string }> {
            return await this.makeRequest({
                method: "GET",
                path: `/auth/steam/in-game`,
                retryKey: options?.retryKey,
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
        loadingScreenImageId?: string;
    }

    export interface GameCoordinatorTransfersClient {
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

    export class GameCoordinatorTransfersBaseClient implements GameCoordinatorTransfersClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async sendToGame(args: SendToGameArgs["data"], options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/target/game`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async sendToMatchingServer(
            args: SendToMatchingServerArgs["data"],
            options?: RequestOptions,
        ): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/target/matching`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async sendToPlayer(args: SendToPlayerArgs["data"], options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/target/player`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async sendToServer(args: SendToServerArgs["data"], options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/target/server`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async validateTransfer(
            args: ValidateTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<ServerTransferData> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/validate`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async requestSelfTransfer(
            args: RequestSelfTransferArgs["data"],
            options?: RequestOptions,
        ): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/self`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async requestSelfToPartyTransfer(options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/self/party`,
                retryKey: options?.retryKey,
            });
        }
        async requestTransferPartyToSelf(options?: RequestOptions): Promise<TransferResult> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/party`,
                retryKey: options?.retryKey,
            });
        }
        async requestCurrentTransfer(options?: RequestOptions): Promise<{ transfer: ClientTransferData | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/transfers/transfer/self`,
                retryKey: options?.retryKey,
            });
        }
        async cancelTransfer(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/transfers/transfer/cancel`,
                retryKey: options?.retryKey,
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

    export interface GameCoordinatorUserLocationsClient {
        find(args: FindArgs["query"], options?: RequestOptions): Promise<{ [userId: string]: { serverId: string } }>;
    }

    export class GameCoordinatorUserLocationsBaseClient implements GameCoordinatorUserLocationsClient {
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
                path: `/user-locations/`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
    }
}
// ====+==== UserSession TYPES ====+====
export namespace GameCoordinatorUserSession {
    export interface UpdateSessionDto {
        regionLatencies?: Record<string, number>;
    }
    export type UpdateSessionArgs = {
        data: UpdateSessionDto;
    };
    export interface SessionStartedDto {
        userId: string;
        startTime: number;
    }
    export type SessionStartedArgs = {
        data: SessionStartedDto;
    };
    export interface SessionEndedDto {
        userId: string;
        endTime: number;
    }
    export type SessionEndedArgs = {
        data: SessionEndedDto;
    };

    export interface GameCoordinatorUserSessionClient {
        updateSession(args: UpdateSessionArgs["data"], options?: RequestOptions): Promise<void>;
        sessionStarted(args: SessionStartedArgs["data"], options?: RequestOptions): Promise<void>;
        sessionEnded(args: SessionEndedArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class GameCoordinatorUserSessionBaseClient implements GameCoordinatorUserSessionClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async updateSession(args: UpdateSessionArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "PUT",
                path: `/user-session/data`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async sessionStarted(args: SessionStartedArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/user-session/started`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async sessionEnded(args: SessionEndedArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                path: `/user-session/ended`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
    }
}
// ====+==== UserStatus TYPES ====+====
export namespace GameCoordinatorUserStatus {
    export type GetUserStatusArgs = {
        params: {
            uid: string;
        };
    };
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
    export interface BaseUserStatus<S extends UserStatus> extends BaseUserData {
        status: S;
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

    export interface GameCoordinatorUserStatusClient {
        getUserStatus(args: GetUserStatusArgs["params"], options?: RequestOptions): Promise<UserStatusData>;
        updateUserStatus(args: UpdateUserStatusArgs["data"], options?: RequestOptions): Promise<UserStatusData>;
        refreshFriends(options?: RequestOptions): Promise<void>;
    }

    export class GameCoordinatorUserStatusBaseClient implements GameCoordinatorUserStatusClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getUserStatus(args: GetUserStatusArgs["params"], options?: RequestOptions): Promise<UserStatusData> {
            return await this.makeRequest({
                method: "GET",
                path: `/user-status/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey,
            });
        }
        async updateUserStatus(args: UpdateUserStatusArgs["data"], options?: RequestOptions): Promise<UserStatusData> {
            return await this.makeRequest({
                method: "PUT",
                path: `/user-status/self`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async refreshFriends(options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "GET",
                path: `/user-status/friends`,
                retryKey: options?.retryKey,
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const Role = {
        USER: "user",
        EASY_EMPLOYEE: "easy-employee",
        SERVICE: "service",
        GAME_SERVER: "game-server",
        GCP: "gcp",
    } as const;
    export type Role = (typeof Role)[keyof typeof Role];
    export interface PublicUser {
        uid: string;
        username: string;
        usernameLower: string;
        statusText?: string;
        profileImageId?: string;
        lastOnlineTime?: string;
    }

    export interface GameCoordinatorUsersClient {
        create(args: CreateArgs["data"], options?: RequestOptions): Promise<{ user: GameCoordinatorPrisma.EasyUser }>;
        deleteUser(options?: RequestOptions): Promise<{ success: boolean }>;
        login(
            options?: RequestOptions,
        ): Promise<{ user: (GameCoordinatorPrisma.EasyUser & { role: Role }) | undefined }>;
        find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorPrisma.EasyUser[] | PublicUser[]>;
        getByUid(
            args: GetByUidArgs["params"],
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
    }

    export class GameCoordinatorUsersBaseClient implements GameCoordinatorUsersClient {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async create(
            args: CreateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser }> {
            return await this.makeRequest({
                method: "POST",
                path: `/users/self`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async deleteUser(options?: RequestOptions): Promise<{ success: boolean }> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/users/self`,
                retryKey: options?.retryKey,
            });
        }
        async login(
            options?: RequestOptions,
        ): Promise<{ user: (GameCoordinatorPrisma.EasyUser & { role: Role }) | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/users/self`,
                retryKey: options?.retryKey,
            });
        }
        async find(
            args: FindArgs["query"],
            options?: RequestOptions,
        ): Promise<GameCoordinatorPrisma.EasyUser[] | PublicUser[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/users/`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
        async getByUid(
            args: GetByUidArgs["params"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser | PublicUser | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/users/uid/${encodeURIComponent(args.uid)}`,
                retryKey: options?.retryKey,
            });
        }
        async findByUsername(
            args: FindByUsernameArgs["query"],
            options?: RequestOptions,
        ): Promise<{ user: PublicUser | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/users/user`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
        async update(
            args: UpdateArgs["data"],
            options?: RequestOptions,
        ): Promise<{ user: GameCoordinatorPrisma.EasyUser }> {
            return await this.makeRequest({
                method: "PATCH",
                path: `/users/`,
                retryKey: options?.retryKey,
                body: args,
            });
        }
        async getUsernameAvailability(
            args: GetUsernameAvailabilityArgs["query"],
            options?: RequestOptions,
        ): Promise<{ available: boolean }> {
            return await this.makeRequest({
                method: "GET",
                path: `/users/availability`,
                retryKey: options?.retryKey,
                query: args,
            });
        }
        async adminBanUser(
            args: AdminBanUserArgs["data"],
            options?: RequestOptions,
        ): Promise<{ uid: string; username: string | undefined; banned: boolean }> {
            return await this.makeRequest({
                method: "POST",
                path: `/users/admin/ban`,
                retryKey: options?.retryKey,
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

    export interface GameCoordinatorBundleVersionsClient {
        gameVersion(
            args: GameVersionArgs["params"],
            options?: RequestOptions,
        ): Promise<{ gameVersion: { playerVersion: number; assetBundleVersion: number } | undefined }>;
        platformVersion(
            options?: RequestOptions,
        ): Promise<{ platformVersion: { Core: number; Player: string; MinPlayerVersion: number } | undefined }>;
    }

    export class GameCoordinatorBundleVersionsBaseClient implements GameCoordinatorBundleVersionsClient {
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
                path: `/versions/gameId/${encodeURIComponent(args.gameId)}`,
                retryKey: options?.retryKey,
            });
        }
        async platformVersion(
            options?: RequestOptions,
        ): Promise<{ platformVersion: { Core: number; Player: string; MinPlayerVersion: number } | undefined }> {
            return await this.makeRequest({
                method: "GET",
                path: `/versions/platform`,
                retryKey: options?.retryKey,
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
        query: {
            rules: string;
            teams: string;
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
        RegionLatencyRule: "RegionLatencyRule",
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
        type: RuleType | string;
        data: unknown;
    }
    export interface MatchmakingQueueConfig {
        queueId: string;
        gameId: string;
        sceneId: string;
        fleet: string;
        teams?: MatchmakingQueueTeam[];
        rules?: MatchmakingQueueRule[];
        enabled: boolean;
        createdAt: string;
    }

    export interface GameCoordinatorMMQueueClient {
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

    export class GameCoordinatorMMQueueBaseClient implements GameCoordinatorMMQueueClient {
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
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.params.gameId)}/queue-id/${encodeURIComponent(args.params.queueId)}/configuration`,
                retryKey: options?.retryKey,
                query: args.query,
            });
        }
        async getGameConfigurations(
            args: GetGameConfigurationsArgs["params"],
            options?: RequestOptions,
        ): Promise<MatchmakingQueueConfig[]> {
            return await this.makeRequest({
                method: "GET",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.gameId)}/configuration`,
                retryKey: options?.retryKey,
            });
        }
        async putQueueConfiguration(
            args: PutQueueConfigurationArgs,
            options?: RequestOptions,
        ): Promise<MatchmakingQueueConfig> {
            return await this.makeRequest({
                method: "PUT",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.params.gameId)}/queue-id/${encodeURIComponent(args.params.queueId)}/configuration`,
                retryKey: options?.retryKey,
                body: args.data,
            });
        }
        async deleteQueueConfiguration(
            args: DeleteQueueConfigurationArgs["params"],
            options?: RequestOptions,
        ): Promise<void> {
            return await this.makeRequest({
                method: "DELETE",
                path: `/matchmaking/queues/game-id/${encodeURIComponent(args.gameId)}/queue-id/${encodeURIComponent(args.queueId)}`,
                retryKey: options?.retryKey,
            });
        }
    }
}

export interface GameCoordinatorClient {
    chat: GameCoordinatorChat.GameCoordinatorChatClient;
    friends: GameCoordinatorFriends.GameCoordinatorFriendsClient;
    groups: GameCoordinatorGroups.GameCoordinatorGroupsClient;
    matchmaking: GameCoordinatorMatchmaking.GameCoordinatorMatchmakingClient;
    party: GameCoordinatorParty.GameCoordinatorPartyClient;
    servers: GameCoordinatorServers.GameCoordinatorServersClient;
    stats: GameCoordinatorStats.GameCoordinatorStatsClient;
    steamAuth: GameCoordinatorSteamAuth.GameCoordinatorSteamAuthClient;
    transfers: GameCoordinatorTransfers.GameCoordinatorTransfersClient;
    userLocations: GameCoordinatorUserLocations.GameCoordinatorUserLocationsClient;
    userSession: GameCoordinatorUserSession.GameCoordinatorUserSessionClient;
    userStatus: GameCoordinatorUserStatus.GameCoordinatorUserStatusClient;
    users: GameCoordinatorUsers.GameCoordinatorUsersClient;
    bundleVersions: GameCoordinatorBundleVersions.GameCoordinatorBundleVersionsClient;
    mMQueue: GameCoordinatorMMQueue.GameCoordinatorMMQueueClient;
}

export class GameCoordinatorBaseClient implements GameCoordinatorClient {
    public readonly chat: GameCoordinatorChat.GameCoordinatorChatClient;
    public readonly friends: GameCoordinatorFriends.GameCoordinatorFriendsClient;
    public readonly groups: GameCoordinatorGroups.GameCoordinatorGroupsClient;
    public readonly matchmaking: GameCoordinatorMatchmaking.GameCoordinatorMatchmakingClient;
    public readonly party: GameCoordinatorParty.GameCoordinatorPartyClient;
    public readonly servers: GameCoordinatorServers.GameCoordinatorServersClient;
    public readonly stats: GameCoordinatorStats.GameCoordinatorStatsClient;
    public readonly steamAuth: GameCoordinatorSteamAuth.GameCoordinatorSteamAuthClient;
    public readonly transfers: GameCoordinatorTransfers.GameCoordinatorTransfersClient;
    public readonly userLocations: GameCoordinatorUserLocations.GameCoordinatorUserLocationsClient;
    public readonly userSession: GameCoordinatorUserSession.GameCoordinatorUserSessionClient;
    public readonly userStatus: GameCoordinatorUserStatus.GameCoordinatorUserStatusClient;
    public readonly users: GameCoordinatorUsers.GameCoordinatorUsersClient;
    public readonly bundleVersions: GameCoordinatorBundleVersions.GameCoordinatorBundleVersionsClient;
    public readonly mMQueue: GameCoordinatorMMQueue.GameCoordinatorMMQueueClient;

    constructor(makeRequest: MakeRequest) {
        this.chat = new GameCoordinatorChat.GameCoordinatorChatBaseClient(makeRequest);
        this.friends = new GameCoordinatorFriends.GameCoordinatorFriendsBaseClient(makeRequest);
        this.groups = new GameCoordinatorGroups.GameCoordinatorGroupsBaseClient(makeRequest);
        this.matchmaking = new GameCoordinatorMatchmaking.GameCoordinatorMatchmakingBaseClient(makeRequest);
        this.party = new GameCoordinatorParty.GameCoordinatorPartyBaseClient(makeRequest);
        this.servers = new GameCoordinatorServers.GameCoordinatorServersBaseClient(makeRequest);
        this.stats = new GameCoordinatorStats.GameCoordinatorStatsBaseClient(makeRequest);
        this.steamAuth = new GameCoordinatorSteamAuth.GameCoordinatorSteamAuthBaseClient(makeRequest);
        this.transfers = new GameCoordinatorTransfers.GameCoordinatorTransfersBaseClient(makeRequest);
        this.userLocations = new GameCoordinatorUserLocations.GameCoordinatorUserLocationsBaseClient(makeRequest);
        this.userSession = new GameCoordinatorUserSession.GameCoordinatorUserSessionBaseClient(makeRequest);
        this.userStatus = new GameCoordinatorUserStatus.GameCoordinatorUserStatusBaseClient(makeRequest);
        this.users = new GameCoordinatorUsers.GameCoordinatorUsersBaseClient(makeRequest);
        this.bundleVersions = new GameCoordinatorBundleVersions.GameCoordinatorBundleVersionsBaseClient(makeRequest);
        this.mMQueue = new GameCoordinatorMMQueue.GameCoordinatorMMQueueBaseClient(makeRequest);
    }
}
