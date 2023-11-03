export declare const SECONDS_TO_MINUTES = 60;
export declare const SECONDS_TO_HOURS = 3600;
export declare const SECONDS_TO_DAYS = 86400;
export declare const MINUTES_TO_DAYS = 1440;
export declare namespace Duration {
    type Seconds = number;
}
/**
 * Represents a span of time
 */
export declare class Duration {
    readonly totalSeconds: number;
    static readonly ZERO: Duration;
    private constructor();
    add(time: Duration): Duration;
    sub(time: Duration): Duration;
    mul(factor: number): Duration;
    negate(): Duration;
    static fromSeconds(seconds: number): Duration;
    static fromMinutes(minutes: number): Duration;
    static fromHours(hours: number): Duration;
    static fromDays(days: number): Duration;
    static fromWeeks(weeks: number): Duration;
    format(format?: string): string;
    getDays(): number;
    getHours(): number;
    getMinutes(): number;
    getSeconds(): number;
    getTotalDays(): number;
    getTotalHours(): number;
    getTotalMinutes(): number;
    getTotalSeconds(): number;
}
