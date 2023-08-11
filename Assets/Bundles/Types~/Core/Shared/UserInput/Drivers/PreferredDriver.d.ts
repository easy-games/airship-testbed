export declare class PreferredDriver {
    private static inst;
    private scheme;
    readonly SchemeChanged: any;
    private constructor();
    GetScheme(): string;
    /** **NOTE:** Internal only. Use `Preferred` class instead. */
    static instance(): PreferredDriver;
}
