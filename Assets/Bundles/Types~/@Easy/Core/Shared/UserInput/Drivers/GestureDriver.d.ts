/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Signal } from "../../Util/Signal";
export declare class GestureDriver {
    private readonly bin;
    private readonly touchscreenDriver;
    readonly pan: Signal<[position: Vector3, phase: TouchPhase]>;
    readonly pinch: Signal<[distance: number, scale: number, phase: TouchPhase]>;
    private readonly positions;
    private oneFingerGestureCapture?;
    private twoFingerGestureCapture?;
    constructor();
    private hasOneTouching;
    private hasTwoTouching;
    Destroy(): void;
}
