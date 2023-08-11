export declare class GestureDriver {
    private readonly bin;
    private readonly touchscreenDriver;
    readonly Pan: any;
    readonly Pinch: any;
    private readonly positions;
    private oneFingerGestureCapture?;
    private twoFingerGestureCapture?;
    constructor();
    private hasOneTouching;
    private hasTwoTouching;
    Destroy(): void;
}
