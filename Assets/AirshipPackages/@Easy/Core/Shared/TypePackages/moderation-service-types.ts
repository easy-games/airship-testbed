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
        conversationId: string;
        conversationMethod: ModerationServiceModeration.PlatformCommunicationMethods;
        messageId?: string;
        senderId: string;
        message: string;
        sentTimestamp?: string;
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

export interface ModerationServiceClientSpec {
    moderation: ModerationServiceModeration.ClientSpec;
}

export class ModerationServiceClient implements ModerationServiceClientSpec {
    public readonly moderation: ModerationServiceModeration.ClientSpec;

    constructor(makeRequest: MakeRequest) {
        this.moderation = new ModerationServiceModeration.Client(makeRequest);
    }
}
