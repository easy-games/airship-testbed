/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
export declare class EasyCore {
    static EasyCoreAPI: EasyCoreAPI;
    private static isInitialized;
    private static idToken;
    private static headersMap;
    private static coreUserData;
    static InitAsync(): Promise<void>;
    static GetHeadersMap(): Map<string, string>;
    static GetCoreUserData(): CoreUserData | undefined;
    static GetAsync<T>(url: string, params?: Map<string, string> | undefined, headers?: Map<string, string> | undefined): Promise<T>;
    static PostAsync<T>(url: string, body: string, params?: Map<string, string> | undefined, headers?: Map<string, string> | undefined): Promise<T>;
    static PatchAsync(url: string, body: string, params?: Map<string, string> | undefined, headers?: Map<string, string> | undefined): Promise<void>;
    static DeleteAsync<T>(url: string, params?: Map<string, string> | undefined, headers?: Map<string, string> | undefined): Promise<void>;
    static EmitAsync(eventName: string, jsonEvent?: string | undefined): Promise<void>;
    private static GetEncodedMap;
    private static PostInit;
    private static SetIdToken;
}
