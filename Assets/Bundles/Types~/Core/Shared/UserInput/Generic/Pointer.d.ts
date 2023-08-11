export declare class Pointer {
    private readonly bin;
    private readonly touchscreen;
    private readonly mouse;
    readonly Down: any;
    readonly Up: any;
    readonly Moved: any;
    constructor();
    /**
     * Cleans up the pointer listeners.
     */
    Destroy(): void;
}
