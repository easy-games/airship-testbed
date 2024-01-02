export declare const SecondsToMinutes = 60;
export declare const SecondsToHours = 3600;
export declare const SecondsToDays = 86400;
export declare const MinutesToDays = 1440;
export declare namespace Duration {
    type Seconds = number & {
        readonly tag?: never;
    };
}
/**
 * Represents a span of time
 */
export declare class Duration {
    readonly totalSeconds: number;
    static readonly ZERO: Duration;
    private constructor();
    Add(time: Duration): Duration;
    Sub(time: Duration): Duration;
    Mul(factor: number): Duration;
    Negate(): Duration;
    static FromSeconds(seconds: number): Duration;
    static FromMinutes(minutes: number): Duration;
    static FromHours(hours: number): Duration;
    static FromDays(days: number): Duration;
    static FromWeeks(weeks: number): Duration;
    Format(format?: string): string;
    GetDays(): number;
    GetHours(): number;
    GetMinutes(): number;
    GetSeconds(): number;
    GetTotalDays(): number;
    GetTotalHours(): number;
    GetTotalMinutes(): number;
    GetTotalSeconds(): number;
}
