/**
 * Time synced between server and client.
 */
export declare function SharedTime(): number;
export declare function WaitFrame(): void;
export declare class TimeUtil {
    /**
     * @returns Time elapsed since server/client has started.
     */
    static GetLifetimeSeconds(): number;
    /**
     * @returns Time synchronized between server and client.
     */
    static GetServerTime(): number;
    /**
     * @returns The interval in seconds from the last frame to the current one.
     */
    static GetDeltaTime(): number;
    /**
     * @returns The interval in seconds from the last physics frame to the current one.
     */
    static GetFixedDeltaTime(): number;
    static FormatTimeAgo(secondsAgo: number, config?: {
        includeAgo?: boolean;
    }): string;
    static FormatCountdown(
    /** The remaining countdown time in seconds */
    timeLeftSec: number, config?: {
        seconds?: boolean;
        minutes?: boolean;
        hours?: boolean;
        days?: boolean;
        /**
         * Makes sure single digits are padded with a 0. (ex. 7 sec -> 07 sec) DEFAULT TRUE.
         */
        disablePadding?: boolean;
        /**
         * How many decimals points to append to the seconds time
         */
        decimalPoints?: number;
        seperator?: string;
    }): string;
}
