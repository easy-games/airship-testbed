export declare class TouchscreenDriver {
    private static inst;
    readonly Touch: any;
    readonly TouchTap: any;
    private constructor();
    /** **NOTE:** Internal only. Use `Touchscreen` class instead. */
    static instance(): TouchscreenDriver;
}
