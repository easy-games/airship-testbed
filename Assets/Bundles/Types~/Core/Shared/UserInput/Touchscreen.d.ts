export declare class Touchscreen {
    private readonly bin;
    private readonly touchscreenDriver;
    private readonly gestureDriver;
    readonly Touch: any;
    readonly TouchTap: any;
    readonly PrimaryTouch: any;
    readonly PrimaryTouchTap: any;
    readonly Pan: any;
    readonly Pinch: any;
    constructor();
    /**
     * Cleans up the touchscreen listener.
     */
    Destroy(): void;
}
