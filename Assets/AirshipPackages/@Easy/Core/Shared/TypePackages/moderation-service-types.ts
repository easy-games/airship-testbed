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
export namespace ModerationServiceDatabaseTypes {
    export const GameModerationActionStatus = {
        ACTIVE: "ACTIVE",
        EXPIRED: "EXPIRED",
        REMOVED: "REMOVED",
    } as const;
    export type GameModerationActionStatus =
        (typeof GameModerationActionStatus)[keyof typeof GameModerationActionStatus];

    export const GameModerationActionType = {
        BAN: "BAN",
        MUTE: "MUTE",
        KICK: "KICK",
    } as const;
    export type GameModerationActionType = (typeof GameModerationActionType)[keyof typeof GameModerationActionType];

    export const GameModerationAuditLogType = {
        KICK: "KICK",
        UPDATE_KICK: "UPDATE_KICK",
        REMOVE_KICK: "REMOVE_KICK",
        BAN: "BAN",
        UPDATE_BAN: "UPDATE_BAN",
        REMOVE_BAN: "REMOVE_BAN",
        MUTE: "MUTE",
        UPDATE_MUTE: "UPDATE_MUTE",
        REMOVE_MUTE: "REMOVE_MUTE",
        ADD_NOTE: "ADD_NOTE",
        UPDATE_NOTE: "UPDATE_NOTE",
        DELETE_NOTE: "DELETE_NOTE",
    } as const;
    export type GameModerationAuditLogType =
        (typeof GameModerationAuditLogType)[keyof typeof GameModerationAuditLogType];

    export type GameModerationRole = {
        roleName: string;
        createdAt: string;
        gameId: string;
        permissionsData: unknown;
    };

    export const PlatformModerationActionSource = {
        MODERATOR: "MODERATOR",
        AUTO_MOD: "AUTO_MOD",
    } as const;
    export type PlatformModerationActionSource =
        (typeof PlatformModerationActionSource)[keyof typeof PlatformModerationActionSource];

    export const PlatformModerationActionStatus = {
        ACTIVE: "ACTIVE",
        EXPIRED: "EXPIRED",
        REMOVED: "REMOVED",
    } as const;
    export type PlatformModerationActionStatus =
        (typeof PlatformModerationActionStatus)[keyof typeof PlatformModerationActionStatus];

    export const PlatformModerationActionType = {
        BAN: "BAN",
        MUTE: "MUTE",
        KICK: "KICK",
    } as const;
    export type PlatformModerationActionType =
        (typeof PlatformModerationActionType)[keyof typeof PlatformModerationActionType];

    export const PlatformModerationAuditLogType = {
        KICK: "KICK",
        UPDATE_KICK: "UPDATE_KICK",
        REMOVE_KICK: "REMOVE_KICK",
        BAN: "BAN",
        UPDATE_BAN: "UPDATE_BAN",
        REMOVE_BAN: "REMOVE_BAN",
        MUTE: "MUTE",
        UPDATE_MUTE: "UPDATE_MUTE",
        REMOVE_MUTE: "REMOVE_MUTE",
        ADD_NOTE: "ADD_NOTE",
        UPDATE_NOTE: "UPDATE_NOTE",
        DELETE_NOTE: "DELETE_NOTE",
        RESOLVE_REPORT: "RESOLVE_REPORT",
        ADD_PLATFORM_MODERATOR: "ADD_PLATFORM_MODERATOR",
        REMOVE_PLATFORM_MODERATOR: "REMOVE_PLATFORM_MODERATOR",
    } as const;
    export type PlatformModerationAuditLogType =
        (typeof PlatformModerationAuditLogType)[keyof typeof PlatformModerationAuditLogType];
}

// ====+==== Internal Types ====+====
export namespace InternalModerationServiceTypes {
    export type Override<T1, T2> = Omit<T1, keyof T2 & keyof T1> & T2;
}

// ====+==== External Types ====+====
export namespace ExternalModerationServiceTypes {
    export const DeploymentPlatform = {
        WINDOWS: "Windows",
        MAC: "Mac",
        LINUX: "Linux",
        IOS: "iOS",
        Android: "Android",
    } as const;
    export type DeploymentPlatform = (typeof DeploymentPlatform)[keyof typeof DeploymentPlatform];

    export interface GameLink {
        type: ExternalModerationServiceTypes.GameLinkType;
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
        adminBanned: boolean;
    };

    export type PermissionEntry<
        T extends ExternalModerationServiceTypes.PermissionGroup = ExternalModerationServiceTypes.PermissionGroup,
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

    export interface PublicGame {
        id: string;
        slug: string | undefined;
        slugProperCase: string | undefined;
        name: string;
        description: string;
        iconImageId: string;
        organizationId: string;
        createdAt: string;
        visibility: ExternalModerationServiceTypes.GameVisibility;
        lastVersionUpdate: string | undefined;
        archivedAt: string | undefined;
        loadingScreenImageId: string | undefined;
        logoImageId: string | undefined;
        videoId: string | undefined;
        links: ExternalModerationServiceTypes.GameLink[] | undefined;
        plays: number;
        favorites: number;
        plays24h: number;
        uniquePlays24h: number;
        platforms: ExternalModerationServiceTypes.DeploymentPlatform[];
        liveStats?: { playerCount: number };
        organization?: ExternalModerationServiceTypes.Organization;
    }

    export interface WithOrg {
        organization: ExternalModerationServiceTypes.Organization;
    }
}

// ====+==== GameModeration Types ====+====
export namespace ModerationServiceGameModeration {
    export interface ActionCreatedContext {
        reason?: string;
        duration?: string;
    }

    export interface ActionRemovedContext {
        removedReason?: string;
    }

    export interface ActionUpdatedContext {
        previousReason?: string;
        newReason?: string;
        previousDuration?: string;
        newDuration?: string;
    }

    export type AddNoteArgs = {
        data: ModerationServiceGameModeration.GameAddUserNoteDto;
    };

    export interface BaseGameUserLookupDto {
        uid: string;
        gameId: string;
        moderatorUid?: string;
    }

    export type DeleteActionArgs = {
        data: ModerationServiceGameModeration.GameRemoveActionDto;
    };

    export type DeleteNoteArgs = {
        params: {
            noteId: string;
        };
        query: {
            gameId: string;
        };
    };

    export interface GameActionLogDto {
        gameId: string;
        skip?: number;
        limit?: number;
        includeAuditLogs?: boolean;
        targetUid?: string;
        moderatorUid?: string;
        actionType?: ModerationServiceDatabaseTypes.GameModerationActionType;
        createdBeforeTimestamp?: string;
        createdAfterTimestamp?: string;
    }

    export interface GameActionLogResponse {
        logs: {
            action: ModerationServiceGameModeration.PublicGameModerationAction;
            auditLogs?: ModerationServiceGameModeration.PublicGameAuditLog[];
        }[];
    }

    export interface GameActionLookupResponse {
        action: ModerationServiceGameModeration.PublicGameModerationAction;
        auditLogs?: ModerationServiceGameModeration.PublicGameAuditLog[];
    }

    export interface GameActiveModerationResponse {
        uid: string;
        gameId: string;
        activeBan: ModerationServiceGameModeration.PublicGameModerationAction | undefined;
        activeMute: ModerationServiceGameModeration.PublicGameModerationAction | undefined;
    }

    export interface GameAddUserNoteDto extends ModerationServiceGameModeration.BaseGameUserLookupDto {
        note: string;
    }

    export type GameAuditLogContext =
        | ModerationServiceGameModeration.ActionCreatedContext
        | ModerationServiceGameModeration.ActionUpdatedContext
        | ModerationServiceGameModeration.ActionRemovedContext
        | ModerationServiceGameModeration.NoteContext;

    export interface GameAuditLogDto {
        gameId: string;
        skip?: number;
        limit?: number;
        targetUid?: string;
        moderatorUid?: string;
        auditLogType?: ModerationServiceDatabaseTypes.GameModerationAuditLogType;
        relatedActionId?: string;
        createdBeforeTimestamp?: string;
        createdAfterTimestamp?: string;
    }

    export interface GameAuditLogResponse {
        logs: ModerationServiceGameModeration.PublicGameAuditLog[];
    }

    export interface GameBatchActiveModerationResponse {
        profiles: Record<string, ModerationServiceGameModeration.GameActiveModerationResponse>;
    }

    export interface GameBatchModerationProfileResponse {
        profiles: Record<string, ModerationServiceGameModeration.GameModerationProfileResponse>;
    }

    export interface GameBatchUserLookupDto {
        uids: string[];
        gameId: string;
    }

    export interface GameModerationHistoryDto extends ModerationServiceGameModeration.BaseGameUserLookupDto {
        skip?: number;
        limit?: number;
    }

    export interface GameModerationHistoryResponse {
        actions: ModerationServiceGameModeration.PublicGameModerationAction[];
        notes: ModerationServiceGameModeration.PublicGameUserNote[];
    }

    export interface GameModerationProfileResponse {
        uid: string;
        gameId: string;
        activeBan: ModerationServiceGameModeration.PublicGameModerationAction | undefined;
        activeMute: ModerationServiceGameModeration.PublicGameModerationAction | undefined;
        actions: ModerationServiceGameModeration.PublicGameModerationAction[];
        notes: ModerationServiceGameModeration.PublicGameUserNote[];
    }

    export interface GamePostActionDto extends ModerationServiceGameModeration.BaseGameUserLookupDto {
        actionType: ModerationServiceDatabaseTypes.GameModerationActionType;
        reason?: string;
        duration?: string;
    }

    export interface GameRemoveActionDto {
        gameId: string;
        moderatorUid?: string;
        actionId?: string;
        actionType?: ModerationServiceDatabaseTypes.GameModerationActionType;
        uid?: string;
        reason?: string;
    }

    export interface GameUpdateActionDto {
        actionId: string;
        gameId: string;
        reason?: string;
        duration?: string;
        permanent?: boolean;
        moderatorUid?: string;
    }

    export interface GameUpdateUserNoteDto {
        noteId: string;
        gameId: string;
        note: string;
    }

    export type GameUserLookupDto = ModerationServiceGameModeration.BaseGameUserLookupDto;

    export type GetActionByIdArgs = {
        params: {
            actionId: string;
        };
        query: {
            gameId: string;
            includeAuditLogs: boolean;
        };
    };

    export type GetActionLogArgs = {
        query: ModerationServiceGameModeration.GameActionLogDto;
    };

    export type GetActiveActionsArgs = {
        query: ModerationServiceGameModeration.GameUserLookupDto;
    };

    export type GetAuditLogArgs = {
        query: ModerationServiceGameModeration.GameAuditLogDto;
    };

    export type GetBatchActiveActionsArgs = {
        data: ModerationServiceGameModeration.GameBatchUserLookupDto;
    };

    export type GetBatchUserModerationProfilesArgs = {
        data: ModerationServiceGameModeration.GameBatchUserLookupDto;
    };

    export type GetModerationHistoryArgs = {
        query?: ModerationServiceGameModeration.GameModerationHistoryDto;
    };

    export type GetUserModerationProfileArgs = {
        query: ModerationServiceGameModeration.GameUserLookupDto;
    };

    export interface NoteContext {
        noteContent?: string;
        previousContent?: string;
    }

    export type PostActionArgs = {
        data: ModerationServiceGameModeration.GamePostActionDto;
    };

    export interface PublicGameAuditLog {
        id: string;
        relatedActionId: string;
        targetUid: string;
        moderatorUid: string;
        gameId: string;
        auditLogType: ModerationServiceDatabaseTypes.GameModerationAuditLogType;
        createdAt: string;
        context?: ModerationServiceGameModeration.GameAuditLogContext;
    }

    export interface PublicGameModerationAction {
        id: string;
        uid: string;
        moderatorUid: string;
        gameId: string;
        actionType: ModerationServiceDatabaseTypes.GameModerationActionType;
        status: ModerationServiceDatabaseTypes.GameModerationActionStatus;
        reason: string | undefined;
        removedReason: string | undefined;
        createdAt: string;
        lastUpdatedAt: string;
        expiresAt: string | undefined;
    }

    export interface PublicGameUserNote {
        id: string;
        uid: string;
        moderatorUid: string;
        gameId: string;
        reason: string;
        createdAt: string;
        lastUpdatedAt: string;
    }

    export type UpdateActionArgs = {
        data: ModerationServiceGameModeration.GameUpdateActionDto;
    };

    export type UpdateNoteArgs = {
        data: ModerationServiceGameModeration.GameUpdateUserNoteDto;
    };

    export interface ClientSpec {
        addNote(
            args: AddNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameUserNote>;
        deleteAction(
            args: DeleteActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameModerationAction>;
        deleteNote(
            args: DeleteNoteArgs,
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameUserNote>;
        getActionById(
            args: GetActionByIdArgs,
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameActionLookupResponse>;
        getActionLog(
            args: GetActionLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameActionLogResponse>;
        getActiveActions(
            args: GetActiveActionsArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameActiveModerationResponse>;
        getAuditLog(
            args: GetAuditLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameAuditLogResponse>;
        getBatchActiveActions(
            args: GetBatchActiveActionsArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameBatchActiveModerationResponse>;
        getBatchUserModerationProfiles(
            args: GetBatchUserModerationProfilesArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameBatchModerationProfileResponse>;
        getModerationHistory(
            args?: GetModerationHistoryArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameModerationHistoryResponse>;
        getUserModerationProfile(
            args: GetUserModerationProfileArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameModerationProfileResponse>;
        postAction(
            args: PostActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameModerationAction>;
        updateAction(
            args: UpdateActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameModerationAction>;
        updateNote(
            args: UpdateNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameUserNote>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async addNote(
            args: AddNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameUserNote> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:addNote",
                path: `/moderation/game/note`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:addNote",
                body: args,
            });
        }
        async deleteAction(
            args: DeleteActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameModerationAction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:deleteAction",
                path: `/moderation/game/action/delete`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:deleteAction",
                body: args,
            });
        }
        async deleteNote(
            args: DeleteNoteArgs,
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameUserNote> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ModerationService:GameModeration:deleteNote",
                path: `/moderation/game/note/note-id/${encodeURIComponent(args.params.noteId)}`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:deleteNote",
                query: args.query,
            });
        }
        async getActionById(
            args: GetActionByIdArgs,
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameActionLookupResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:GameModeration:getActionById",
                path: `/moderation/game/action/action-id/${encodeURIComponent(args.params.actionId)}`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getActionById",
                query: args.query,
            });
        }
        async getActionLog(
            args: GetActionLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameActionLogResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:GameModeration:getActionLog",
                path: `/moderation/game/action-log`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getActionLog",
                query: args,
            });
        }
        async getActiveActions(
            args: GetActiveActionsArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameActiveModerationResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:GameModeration:getActiveActions",
                path: `/moderation/game/active-moderation`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getActiveActions",
                query: args,
            });
        }
        async getAuditLog(
            args: GetAuditLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameAuditLogResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:GameModeration:getAuditLog",
                path: `/moderation/game/audit-log`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getAuditLog",
                query: args,
            });
        }
        async getBatchActiveActions(
            args: GetBatchActiveActionsArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameBatchActiveModerationResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:getBatchActiveActions",
                path: `/moderation/game/active-moderation/batch`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getBatchActiveActions",
                body: args,
            });
        }
        async getBatchUserModerationProfiles(
            args: GetBatchUserModerationProfilesArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameBatchModerationProfileResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:getBatchUserModerationProfiles",
                path: `/moderation/game/moderation-profile/batch`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getBatchUserModerationProfiles",
                body: args,
            });
        }
        async getModerationHistory(
            args?: GetModerationHistoryArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameModerationHistoryResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:GameModeration:getModerationHistory",
                path: `/moderation/game/moderation-history`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getModerationHistory",
                query: args,
            });
        }
        async getUserModerationProfile(
            args: GetUserModerationProfileArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.GameModerationProfileResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:GameModeration:getUserModerationProfile",
                path: `/moderation/game/moderation-profile`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:getUserModerationProfile",
                query: args,
            });
        }
        async postAction(
            args: PostActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameModerationAction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:postAction",
                path: `/moderation/game/action`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:postAction",
                body: args,
            });
        }
        async updateAction(
            args: UpdateActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameModerationAction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:updateAction",
                path: `/moderation/game/action/update`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:updateAction",
                body: args,
            });
        }
        async updateNote(
            args: UpdateNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceGameModeration.PublicGameUserNote> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:GameModeration:updateNote",
                path: `/moderation/game/note/update`,
                retryKey: options?.retryKey ?? "ModerationService:GameModeration:updateNote",
                body: args,
            });
        }
    }
}

// ====+==== Moderation Types ====+====
export namespace ModerationServiceModeration {
    export interface BaseModerateTextResponse {
        censored: boolean;
        text: string;
    }

    export interface BaseModerationResponse {
        conversationId: string;
        messageId: string;
        messageBlocked: boolean;
        transformedMessage: string;
    }

    export interface BlockedModerateTextResponse extends ModerationServiceModeration.BaseModerateTextResponse {
        blocked: true;
        blockedReasons: Array<ModerationServiceModeration.ModerationCategories | string>;
    }

    export interface BlockedModerationResponse extends ModerationServiceModeration.BaseModerationResponse {
        messageBlocked: true;
        messageBlockedReasons: Array<ModerationServiceModeration.ModerationCategories | string>;
    }

    export type ModerateChatArgs = {
        data: ModerationServiceModeration.ModerateChatDto;
    };

    export interface ModerateChatDto {
        gameserver?: ModerationServiceModeration.ModerateChatGameserverDto;
        conversationId: string;
        conversationMethod: ModerationServiceModeration.PlatformCommunicationMethods;
        messageId?: string;
        senderId: string;
        message: string;
        sentTimestamp?: string;
    }

    export interface ModerateChatGameserverDto {
        organizationId: string;
        gameId: string;
        serverId: string;
    }

    export type ModerateTextArgs = {
        data: ModerationServiceModeration.ModerateTextDto;
    };

    export interface ModerateTextDto {
        text: string;
    }

    export type ModerateTextResponse =
        | ModerationServiceModeration.BlockedModerateTextResponse
        | ModerationServiceModeration.UnblockedModerateTextResponse;

    export const ModerationCategories = {
        HATE: "HATE",
        HARASSMENT: "HARASSMENT",
        LANGUAGE: "LANGUAGE",
        SELF_HARM: "SELF_HARM",
        ILLICIT: "ILLICIT",
        VIOLENCE: "VIOLENCE",
        SEXUAL: "SEXUAL",
        UNDER_AGE: "UNDER_AGE",
    } as const;
    export type ModerationCategories = (typeof ModerationCategories)[keyof typeof ModerationCategories];

    export type ModerationResponse =
        | ModerationServiceModeration.BlockedModerationResponse
        | ModerationServiceModeration.UnblockedModerationResponse;

    export const PlatformCommunicationMethods = {
        DirectMessage: "DM",
        Party: "PARTY",
        GameServerChat: "GAME_SERVER_CHAT",
        ModerateText: "MODERATE_TEXT",
        VoiceChat: "VOICE_CHAT",
    } as const;
    export type PlatformCommunicationMethods =
        (typeof PlatformCommunicationMethods)[keyof typeof PlatformCommunicationMethods];

    export interface UnblockedModerateTextResponse extends ModerationServiceModeration.BaseModerateTextResponse {
        blocked: false;
    }

    export interface UnblockedModerationResponse extends ModerationServiceModeration.BaseModerationResponse {
        messageBlocked: false;
    }

    export interface ClientSpec {
        moderateChat(
            args: ModerateChatArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceModeration.ModerationResponse>;
        moderateText(
            args: ModerateTextArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceModeration.ModerateTextResponse>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async moderateChat(
            args: ModerateChatArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceModeration.ModerationResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:Moderation:moderateChat",
                path: `/moderation/chat`,
                retryKey: options?.retryKey ?? "ModerationService:Moderation:moderateChat",
                body: args,
            });
        }
        async moderateText(
            args: ModerateTextArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServiceModeration.ModerateTextResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:Moderation:moderateText",
                path: `/moderation/text`,
                retryKey: options?.retryKey ?? "ModerationService:Moderation:moderateText",
                body: args,
            });
        }
    }
}

// ====+==== ModerationRoles Types ====+====
export namespace ModerationServiceModerationRoles {
    export type AddMemberArgs = {
        params: {
            gameId: string;
            roleName: string;
        };
        data: { uid: string };
    };

    export type CreateRoleArgs = {
        params: {
            gameId: string;
        };
        data: ModerationServiceModerationRoles.CreateRoleDto;
    };

    export interface CreateRoleDto {
        name: string;
        permissionsData: ModerationServicePermissions.ModerationRolePermissionsDto;
    }

    export type DeleteRoleArgs = {
        params: {
            gameId: string;
            roleName: string;
        };
    };

    export type GameModerationMembershipByOrg = {
        organization: ExternalModerationServiceTypes.WithOrg["organization"];
        memberships: ModerationServiceModerationRoles.GameModerationMembershipEntry[];
    };

    export type GameModerationMembershipEntry = {
        gameId: string;
        roleName: string;
        permissionsData: ModerationServiceModerationRoles.ModerationRolePermissionsData;
        game: ExternalModerationServiceTypes.PublicGame;
    };

    export type GetMembersWithRolesArgs = {
        params: {
            gameId: string;
        };
    };

    export type GetRolesArgs = {
        params: {
            gameId: string;
        };
    };

    export interface ModerationRolePermissionsData {
        permissions: ExternalModerationServiceTypes.PermissionEntry;
    }

    export type PublicGameModerationMember = { uid: string; roleName: string; joinedAt: string };

    export type PublicGameModerationMemberWithRole = ModerationServiceModerationRoles.PublicGameModerationMember & {
        role: ModerationServiceModerationRoles.PublicModerationRole;
    };

    export type PublicModerationRole = InternalModerationServiceTypes.Override<
        ModerationServiceDatabaseTypes.GameModerationRole,
        { permissionsData: ModerationServiceModerationRoles.ModerationRolePermissionsData }
    >;

    export type PublicModerationRoleWithMembers = ModerationServiceModerationRoles.PublicModerationRole & {
        members: ModerationServiceModerationRoles.PublicGameModerationMember[];
    };

    export type RemoveMemberArgs = {
        params: {
            gameId: string;
        };
        data: { uid: string; roleName: string };
    };

    export type SelfArgs = {
        params: {
            gameId: string;
        };
    };

    export type UpdateMemberArgs = {
        params: {
            gameId: string;
        };
        data: ModerationServiceModerationRoles.UpdateMemberDto;
    };

    export interface UpdateMemberDto {
        uid: string;
        oldRoleName: string;
        newRoleName: string;
    }

    export type UpdateRoleArgs = {
        params: {
            gameId: string;
            roleName: string;
        };
        data: ModerationServiceModerationRoles.UpdateRoleDto;
    };

    export interface UpdateRoleDto {
        name: string;
        permissionsData: ModerationServicePermissions.ModerationRolePermissionsDto;
    }

    export interface ClientSpec {
        addMember(
            args: AddMemberArgs,
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }>;
        createRole(
            args: CreateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }>;
        deleteRole(
            args: DeleteRoleArgs["params"],
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }>;
        getMembersWithRoles(
            args: GetMembersWithRolesArgs["params"],
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }>;
        getRoles(
            args: GetRolesArgs["params"],
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }>;
        getSelfMemberships(
            options?: RequestOptions,
        ): Promise<{ memberships: ModerationServiceModerationRoles.GameModerationMembershipByOrg[] }>;
        removeMember(
            args: RemoveMemberArgs,
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }>;
        self(
            args: SelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ role: ModerationServiceModerationRoles.PublicModerationRole | undefined }>;
        updateMember(
            args: UpdateMemberArgs,
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }>;
        updateRole(
            args: UpdateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async addMember(
            args: AddMemberArgs,
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:ModerationRoles:addMember",
                path: `/roles/game-id/${encodeURIComponent(args.params.gameId)}/role-name/${encodeURIComponent(args.params.roleName)}/add-member`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:addMember",
                body: args.data,
            });
        }
        async createRole(
            args: CreateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:ModerationRoles:createRole",
                path: `/roles/game-id/${encodeURIComponent(args.params.gameId)}/create`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:createRole",
                body: args.data,
            });
        }
        async deleteRole(
            args: DeleteRoleArgs["params"],
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ModerationService:ModerationRoles:deleteRole",
                path: `/roles/game-id/${encodeURIComponent(args.gameId)}/role-name/${encodeURIComponent(args.roleName)}`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:deleteRole",
            });
        }
        async getMembersWithRoles(
            args: GetMembersWithRolesArgs["params"],
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:ModerationRoles:getMembersWithRoles",
                path: `/roles/game-id/${encodeURIComponent(args.gameId)}/members`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:getMembersWithRoles",
            });
        }
        async getRoles(
            args: GetRolesArgs["params"],
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:ModerationRoles:getRoles",
                path: `/roles/game-id/${encodeURIComponent(args.gameId)}`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:getRoles",
            });
        }
        async getSelfMemberships(
            options?: RequestOptions,
        ): Promise<{ memberships: ModerationServiceModerationRoles.GameModerationMembershipByOrg[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:ModerationRoles:getSelfMemberships",
                path: `/roles/self/memberships`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:getSelfMemberships",
            });
        }
        async removeMember(
            args: RemoveMemberArgs,
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ModerationService:ModerationRoles:removeMember",
                path: `/roles/game-id/${encodeURIComponent(args.params.gameId)}/remove-member`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:removeMember",
                body: args.data,
            });
        }
        async self(
            args: SelfArgs["params"],
            options?: RequestOptions,
        ): Promise<{ role: ModerationServiceModerationRoles.PublicModerationRole | undefined }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:ModerationRoles:self",
                path: `/roles/game-id/${encodeURIComponent(args.gameId)}/self`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:self",
            });
        }
        async updateMember(
            args: UpdateMemberArgs,
            options?: RequestOptions,
        ): Promise<{ members: ModerationServiceModerationRoles.PublicGameModerationMemberWithRole[] }> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "ModerationService:ModerationRoles:updateMember",
                path: `/roles/game-id/${encodeURIComponent(args.params.gameId)}/update-member`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:updateMember",
                body: args.data,
            });
        }
        async updateRole(
            args: UpdateRoleArgs,
            options?: RequestOptions,
        ): Promise<{ roles: ModerationServiceModerationRoles.PublicModerationRoleWithMembers[] }> {
            return await this.makeRequest({
                method: "PUT",
                routeId: "ModerationService:ModerationRoles:updateRole",
                path: `/roles/game-id/${encodeURIComponent(args.params.gameId)}/role-name/${encodeURIComponent(args.params.roleName)}`,
                retryKey: options?.retryKey ?? "ModerationService:ModerationRoles:updateRole",
                body: args.data,
            });
        }
    }
}

// ====+==== Permissions Types ====+====
export namespace ModerationServicePermissions {
    export interface ModerationRolePermissionsDto {
        permissions: ExternalModerationServiceTypes.PermissionEntry;
    }

    export interface ClientSpec {
        getSchema(
            options?: RequestOptions,
        ): Promise<{ schema: readonly ExternalModerationServiceTypes.PermissionNode[] }>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async getSchema(
            options?: RequestOptions,
        ): Promise<{ schema: readonly ExternalModerationServiceTypes.PermissionNode[] }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:Permissions:getSchema",
                path: `/permissions/schema`,
                retryKey: options?.retryKey ?? "ModerationService:Permissions:getSchema",
            });
        }
    }
}

// ====+==== PlatformModeration Types ====+====
export namespace ModerationServicePlatformModeration {
    export interface ActionCreatedContext {
        reason?: string;
        duration?: string;
        conversationId?: string;
    }

    export interface ActionRemovedContext {
        removedReason?: string;
    }

    export interface ActionUpdatedContext {
        previousReason?: string;
        newReason?: string;
        previousDuration?: string;
        newDuration?: string;
    }

    export type AddNoteArgs = {
        data: ModerationServicePlatformModeration.PlatformAddUserNoteDto;
    };

    export type AuditLogContext =
        | ModerationServicePlatformModeration.ActionCreatedContext
        | ModerationServicePlatformModeration.ActionUpdatedContext
        | ModerationServicePlatformModeration.ActionRemovedContext
        | ModerationServicePlatformModeration.NoteContext
        | ModerationServicePlatformModeration.ResolveReportContext;

    export interface BaseUserLookupDto {
        uid: string;
    }

    export interface BatchUserLookupDto {
        uids: string[];
    }

    export type DeleteActionArgs = {
        data: ModerationServicePlatformModeration.PlatformRemoveActionDto;
    };

    export type DeleteNoteArgs = {
        params: {
            noteId: string;
        };
    };

    export type GetActionByIdArgs = {
        params: {
            actionId: string;
        };
        query: {
            includeAuditLogs: boolean;
        };
    };

    export type GetActionLogArgs = {
        query?: ModerationServicePlatformModeration.PlatformActionLogDto;
    };

    export type GetActiveActionsArgs = {
        query: ModerationServicePlatformModeration.UserLookupDto;
    };

    export type GetAuditLogArgs = {
        query?: ModerationServicePlatformModeration.PlatformAuditLogDto;
    };

    export type GetBatchActiveActionsArgs = {
        data: ModerationServicePlatformModeration.BatchUserLookupDto;
    };

    export type GetBatchUserModerationProfilesArgs = {
        data: ModerationServicePlatformModeration.BatchUserLookupDto;
    };

    export type GetModerationHistoryArgs = {
        query?: ModerationServicePlatformModeration.PlatformModerationHistoryDto;
    };

    export type GetUserModerationProfileArgs = {
        query: ModerationServicePlatformModeration.UserLookupDto;
    };

    export interface NoteContext {
        noteContent?: string;
        previousContent?: string;
    }

    export interface PlatformActionLogDto {
        skip?: number;
        limit?: number;
        includeAuditLogs?: boolean;
        targetUid?: string;
        moderatorUid?: string;
        actionType?: ModerationServiceDatabaseTypes.PlatformModerationActionType;
        createdBeforeTimestamp?: string;
        createdAfterTimestamp?: string;
    }

    export interface PlatformActionLogResponse {
        logs: {
            action: ModerationServicePlatformModeration.PublicPlatformModerationAction;
            auditLogs?: ModerationServicePlatformModeration.PublicPlatformAuditLog[];
        }[];
    }

    export interface PlatformActionLookupResponse {
        action: ModerationServicePlatformModeration.PublicPlatformModerationAction;
        auditLogs?: ModerationServicePlatformModeration.PublicPlatformAuditLog[];
    }

    export interface PlatformActiveModerationResponse {
        uid: string;
        activeBan: ModerationServicePlatformModeration.PublicPlatformModerationAction | undefined;
        activeMute: ModerationServicePlatformModeration.PublicPlatformModerationAction | undefined;
    }

    export interface PlatformAddUserNoteDto extends ModerationServicePlatformModeration.BaseUserLookupDto {
        note: string;
    }

    export interface PlatformAuditLogDto {
        skip?: number;
        limit?: number;
        targetUid?: string;
        moderatorUid?: string;
        auditLogType?: ModerationServiceDatabaseTypes.PlatformModerationAuditLogType;
        relatedActionId?: string;
        createdBeforeTimestamp?: string;
        createdAfterTimestamp?: string;
    }

    export interface PlatformAuditLogResponse {
        logs: ModerationServicePlatformModeration.PublicPlatformAuditLog[];
    }

    export interface PlatformBatchActiveModerationResponse {
        profiles: Record<string, ModerationServicePlatformModeration.PlatformActiveModerationResponse>;
    }

    export interface PlatformBatchModerationProfileResponse {
        profiles: Record<string, ModerationServicePlatformModeration.PlatformModerationProfileResponse>;
    }

    export interface PlatformModerationHistoryDto extends ModerationServicePlatformModeration.BaseUserLookupDto {
        skip?: number;
        limit?: number;
    }

    export interface PlatformModerationHistoryResponse {
        actions: ModerationServicePlatformModeration.PublicPlatformModerationAction[];
        notes: ModerationServicePlatformModeration.PublicPlatformUserNote[];
    }

    export interface PlatformModerationProfileResponse {
        uid: string;
        activeBan: ModerationServicePlatformModeration.PublicPlatformModerationAction | undefined;
        activeMute: ModerationServicePlatformModeration.PublicPlatformModerationAction | undefined;
        actions: ModerationServicePlatformModeration.PublicPlatformModerationAction[];
        notes: ModerationServicePlatformModeration.PublicPlatformUserNote[];
    }

    export interface PlatformPostActionDto extends ModerationServicePlatformModeration.BaseUserLookupDto {
        actionType: ModerationServiceDatabaseTypes.PlatformModerationActionType;
        reason?: string;
        duration?: string;
    }

    export interface PlatformRemoveActionDto extends ModerationServicePlatformModeration.BaseUserLookupDto {
        actionId?: string;
        actionType?: ModerationServiceDatabaseTypes.PlatformModerationActionType;
        reason?: string;
    }

    export interface PlatformSetFirebaseStateDto extends ModerationServicePlatformModeration.BaseUserLookupDto {
        disabled: boolean;
    }

    export interface PlatformUpdateActionDto {
        actionId: string;
        reason?: string;
        duration?: string;
        permanent?: boolean;
    }

    export interface PlatformUpdateUserNoteDto {
        noteId: string;
        note: string;
    }

    export type PostActionArgs = {
        data: ModerationServicePlatformModeration.PlatformPostActionDto;
    };

    export interface PublicPlatformAuditLog {
        id: string;
        relatedActionId: string;
        targetUid: string;
        moderatorUid: string | undefined;
        auditLogType: ModerationServiceDatabaseTypes.PlatformModerationAuditLogType;
        createdAt: string;
        context?: ModerationServicePlatformModeration.AuditLogContext;
    }

    export interface PublicPlatformModerationAction {
        id: string;
        uid: string;
        moderatorUid: string | undefined;
        actionType: ModerationServiceDatabaseTypes.PlatformModerationActionType;
        status: ModerationServiceDatabaseTypes.PlatformModerationActionStatus;
        reason: string | undefined;
        removedReason: string | undefined;
        actionSource: ModerationServiceDatabaseTypes.PlatformModerationActionSource;
        createdAt: string;
        lastUpdatedAt: string;
        expiresAt: string | undefined;
    }

    export interface PublicPlatformUserNote {
        id: string;
        uid: string;
        moderatorUid: string;
        reason: string;
        createdAt: string;
        lastUpdatedAt: string;
    }

    export interface ResolveReportContext {
        actions?: string[];
        notes?: string;
    }

    export type SetFirebaseStateArgs = {
        data: ModerationServicePlatformModeration.PlatformSetFirebaseStateDto;
    };

    export type UpdateActionArgs = {
        data: ModerationServicePlatformModeration.PlatformUpdateActionDto;
    };

    export type UpdateNoteArgs = {
        data: ModerationServicePlatformModeration.PlatformUpdateUserNoteDto;
    };

    export type UserLookupDto = ModerationServicePlatformModeration.BaseUserLookupDto;

    export interface ClientSpec {
        addNote(
            args: AddNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformUserNote>;
        deleteAction(
            args: DeleteActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformModerationAction>;
        deleteNote(
            args: DeleteNoteArgs["params"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformUserNote>;
        getActionById(
            args: GetActionByIdArgs,
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformActionLookupResponse>;
        getActionLog(
            args?: GetActionLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformActionLogResponse>;
        getActiveActions(
            args: GetActiveActionsArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformActiveModerationResponse>;
        getAuditLog(
            args?: GetAuditLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformAuditLogResponse>;
        getBatchActiveActions(
            args: GetBatchActiveActionsArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformBatchActiveModerationResponse>;
        getBatchUserModerationProfiles(
            args: GetBatchUserModerationProfilesArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformBatchModerationProfileResponse>;
        getModerationHistory(
            args?: GetModerationHistoryArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformModerationHistoryResponse>;
        getUserModerationProfile(
            args: GetUserModerationProfileArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformModerationProfileResponse>;
        isModerator(options?: RequestOptions): Promise<{ isModerator: boolean }>;
        postAction(
            args: PostActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformModerationAction>;
        setFirebaseState(args: SetFirebaseStateArgs["data"], options?: RequestOptions): Promise<void>;
        updateAction(
            args: UpdateActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformModerationAction>;
        updateNote(
            args: UpdateNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformUserNote>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async addNote(
            args: AddNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformUserNote> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:addNote",
                path: `/moderation/platform/note`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:addNote",
                body: args,
            });
        }
        async deleteAction(
            args: DeleteActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformModerationAction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:deleteAction",
                path: `/moderation/platform/action/delete`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:deleteAction",
                body: args,
            });
        }
        async deleteNote(
            args: DeleteNoteArgs["params"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformUserNote> {
            return await this.makeRequest({
                method: "DELETE",
                routeId: "ModerationService:PlatformModeration:deleteNote",
                path: `/moderation/platform/note/note-id/${encodeURIComponent(args.noteId)}`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:deleteNote",
            });
        }
        async getActionById(
            args: GetActionByIdArgs,
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformActionLookupResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:getActionById",
                path: `/moderation/platform/action/action-id/${encodeURIComponent(args.params.actionId)}`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getActionById",
                query: args.query,
            });
        }
        async getActionLog(
            args?: GetActionLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformActionLogResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:getActionLog",
                path: `/moderation/platform/action-log`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getActionLog",
                query: args,
            });
        }
        async getActiveActions(
            args: GetActiveActionsArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformActiveModerationResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:getActiveActions",
                path: `/moderation/platform/active-moderation`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getActiveActions",
                query: args,
            });
        }
        async getAuditLog(
            args?: GetAuditLogArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformAuditLogResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:getAuditLog",
                path: `/moderation/platform/audit-log`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getAuditLog",
                query: args,
            });
        }
        async getBatchActiveActions(
            args: GetBatchActiveActionsArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformBatchActiveModerationResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:getBatchActiveActions",
                path: `/moderation/platform/active-moderation/batch`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getBatchActiveActions",
                body: args,
            });
        }
        async getBatchUserModerationProfiles(
            args: GetBatchUserModerationProfilesArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformBatchModerationProfileResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:getBatchUserModerationProfiles",
                path: `/moderation/platform/moderation-profile/batch`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getBatchUserModerationProfiles",
                body: args,
            });
        }
        async getModerationHistory(
            args?: GetModerationHistoryArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformModerationHistoryResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:getModerationHistory",
                path: `/moderation/platform/moderation-history`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getModerationHistory",
                query: args,
            });
        }
        async getUserModerationProfile(
            args: GetUserModerationProfileArgs["query"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PlatformModerationProfileResponse> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:getUserModerationProfile",
                path: `/moderation/platform/moderation-profile`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:getUserModerationProfile",
                query: args,
            });
        }
        async isModerator(options?: RequestOptions): Promise<{ isModerator: boolean }> {
            return await this.makeRequest({
                method: "GET",
                routeId: "ModerationService:PlatformModeration:isModerator",
                path: `/moderation/platform/moderator/self`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:isModerator",
            });
        }
        async postAction(
            args: PostActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformModerationAction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:postAction",
                path: `/moderation/platform/action`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:postAction",
                body: args,
            });
        }
        async setFirebaseState(args: SetFirebaseStateArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:setFirebaseState",
                path: `/moderation/platform/firebase/set-disabled`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:setFirebaseState",
                body: args,
            });
        }
        async updateAction(
            args: UpdateActionArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformModerationAction> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:updateAction",
                path: `/moderation/platform/action/update`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:updateAction",
                body: args,
            });
        }
        async updateNote(
            args: UpdateNoteArgs["data"],
            options?: RequestOptions,
        ): Promise<ModerationServicePlatformModeration.PublicPlatformUserNote> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:PlatformModeration:updateNote",
                path: `/moderation/platform/note/update`,
                retryKey: options?.retryKey ?? "ModerationService:PlatformModeration:updateNote",
                body: args,
            });
        }
    }
}

// ====+==== UserReport Types ====+====
export namespace ModerationServiceUserReport {
    export interface BaseReport<T extends string> {
        type: T;
    }

    export type ReportedAvatar = ModerationServiceUserReport.BaseReport<typeof UserReportReasons.AVATAR>;

    export interface ReportedChat extends ModerationServiceUserReport.BaseReport<typeof UserReportReasons.CHAT> {
        conversationId: string;
        messageId?: string;
    }

    export type ReportedContent =
        | ModerationServiceUserReport.ReportedChat
        | ModerationServiceUserReport.ReportedUsername
        | ModerationServiceUserReport.ReportedAvatar;

    export type ReportedUsername = ModerationServiceUserReport.BaseReport<typeof UserReportReasons.USERNAME>;

    export type ReportUserArgs = {
        data: ModerationServiceUserReport.UserReportDto;
    };

    export interface UserReportDto {
        uid: string;
        gameId?: string;
        reasons: ModerationServiceUserReport.ReportedContent[];
    }

    export const UserReportReasons = {
        AVATAR: "avatar",
        USERNAME: "username",
        CHAT: "chat",
    } as const;
    export type UserReportReasons = (typeof UserReportReasons)[keyof typeof UserReportReasons];

    export interface ClientSpec {
        reportUser(args: ReportUserArgs["data"], options?: RequestOptions): Promise<void>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async reportUser(args: ReportUserArgs["data"], options?: RequestOptions): Promise<void> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:UserReport:reportUser",
                path: `/user-report/`,
                retryKey: options?.retryKey ?? "ModerationService:UserReport:reportUser",
                body: args,
            });
        }
    }
}

export interface ModerationServiceClientSpec {
    gameModeration: ModerationServiceGameModeration.ClientSpec;
    moderation: ModerationServiceModeration.ClientSpec;
    moderationRoles: ModerationServiceModerationRoles.ClientSpec;
    permissions: ModerationServicePermissions.ClientSpec;
    platformModeration: ModerationServicePlatformModeration.ClientSpec;
    userReport: ModerationServiceUserReport.ClientSpec;
}

export class ModerationServiceClient implements ModerationServiceClientSpec {
    public readonly gameModeration: ModerationServiceGameModeration.ClientSpec;
    public readonly moderation: ModerationServiceModeration.ClientSpec;
    public readonly moderationRoles: ModerationServiceModerationRoles.ClientSpec;
    public readonly permissions: ModerationServicePermissions.ClientSpec;
    public readonly platformModeration: ModerationServicePlatformModeration.ClientSpec;
    public readonly userReport: ModerationServiceUserReport.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.gameModeration = new ModerationServiceGameModeration.Client(makeRequest);
        this.moderation = new ModerationServiceModeration.Client(makeRequest);
        this.moderationRoles = new ModerationServiceModerationRoles.Client(makeRequest);
        this.permissions = new ModerationServicePermissions.Client(makeRequest);
        this.platformModeration = new ModerationServicePlatformModeration.Client(makeRequest);
        this.userReport = new ModerationServiceUserReport.Client(makeRequest);
    }
}
