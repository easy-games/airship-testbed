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
export namespace ModerationServicePrisma {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const ModerationSeverity = {
        IMMEDIATE_ACTION: 5,
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
        NONE: 0,
    } as const;
    export type ModerationSeverity = (typeof ModerationSeverity)[keyof typeof ModerationSeverity];
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
}
// ====+==== Moderation TYPES ====+====
export namespace ModerationServiceModeration {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export const PlatformCommunicationMethods = {
        DirectMessage: "DM",
        Party: "PARTY",
        GameServerChat: "GAME_SERVER_CHAT",
    } as const;
    export type PlatformCommunicationMethods =
        (typeof PlatformCommunicationMethods)[keyof typeof PlatformCommunicationMethods];
    export interface ModerateTextDto {
        text: string;
    }
    export type ModerateTextArgs = {
        data: ModerateTextDto;
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
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
    export interface ModerateChatDto {
        conversationId: string;
        conversationMethod: PlatformCommunicationMethods;
        messageId?: string;
        senderId: string;
        message: string;
        sentTimestamp?: string;
    }
    export type ModerateChatArgs = {
        data: ModerateChatDto;
    };
    export interface BaseModerationResponse {
        conversationId: string;
        messageId: string;
        messageBlocked: boolean;
        transformedMessage?: string;
    }
    export interface BlockedModerationResponse extends BaseModerationResponse {
        messageBlocked: true;
        messageBlockedReasons: Array<ModerationCategories | string>;
    }
    export interface UnblockedModerationResponse extends BaseModerationResponse {
        messageBlocked: false;
    }
    export type ModerationResponse = BlockedModerationResponse | UnblockedModerationResponse;
    export interface BaseModerateTextResponse {
        censored: boolean;
        text: string;
    }
    export interface BlockedModerateTextResponse extends BaseModerateTextResponse {
        blocked: true;
        blockedReasons: Array<ModerationCategories | string>;
    }
    export interface UnblockedModerateTextResponse extends BaseModerateTextResponse {
        blocked: false;
    }
    export type ModerateTextResponse = BlockedModerateTextResponse | UnblockedModerateTextResponse;

    export interface ClientSpec {
        moderateChat(args: ModerateChatArgs["data"], options?: RequestOptions): Promise<ModerationResponse>;
        moderateText(args: ModerateTextArgs["data"], options?: RequestOptions): Promise<ModerateTextResponse>;
    }

    export class Client implements ClientSpec {
        private readonly makeRequest: MakeRequest;

        constructor(makeRequest: MakeRequest) {
            this.makeRequest = makeRequest;
        }

        async moderateChat(args: ModerateChatArgs["data"], options?: RequestOptions): Promise<ModerationResponse> {
            return await this.makeRequest({
                method: "POST",
                routeId: "ModerationService:Moderation:moderateChat",
                path: `/moderation/chat`,
                retryKey: options?.retryKey ?? "ModerationService:Moderation:moderateChat",
                body: args,
            });
        }

        async moderateText(args: ModerateTextArgs["data"], options?: RequestOptions): Promise<ModerateTextResponse> {
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
