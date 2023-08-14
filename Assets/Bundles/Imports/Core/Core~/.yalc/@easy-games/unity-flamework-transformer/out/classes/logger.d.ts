export declare class Logger {
    static debug: boolean;
    static verbose: boolean;
    private static timerTotals;
    private static timers;
    private static timerHandle?;
    static timer(name: string): void;
    static timerEnd(): void;
    static queueTimer(): void;
    static write(message: string): void;
    static writeLine(...messages: Array<unknown>): void;
    static writeLineIfVerbose(...messages: Array<unknown>): void;
    static info(...messages: Array<unknown>): void;
    static infoIfVerbose(...messages: Array<unknown>): void;
    static warn(...messages: Array<unknown>): void;
    static warnIfVerbose(...messages: Array<unknown>): void;
    static error(...messages: Array<unknown>): void;
    private static benchmarkLabels;
    private static benchmarkOutput;
    static benchmark(label: string): void;
    static benchmarkEnd(): void;
}
