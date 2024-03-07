/**
 * @deprecated use "Game" instead.
 */
export declare class RunUtil {
    static IsClient(): boolean;
    static IsServer(): boolean;
    static IsEditor(): boolean;
    /**
     * Shortcut for checking if both IsClient() and IsServer() is true.
     */
    static IsHosting(): boolean;
    static IsClone(): boolean;
    static IsWindows(): boolean;
    static IsMac(): boolean;
}
