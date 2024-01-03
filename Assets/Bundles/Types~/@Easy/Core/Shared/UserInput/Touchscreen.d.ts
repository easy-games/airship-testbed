/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Signal } from "../Util/Signal";
export declare class Touchscreen {
    private readonly bin;
    private readonly touchscreenDriver;
    private readonly gestureDriver;
    readonly touch: Signal<[touchIndex: number, position: Vector3, phase: TouchPhase]>;
    readonly touchTap: Signal<[touchIndex: number, position: Vector3, phase: InputActionPhase]>;
    readonly primaryTouch: Signal<[position: Vector3, phase: TouchPhase]>;
    readonly primaryTouchTap: Signal<[position: Vector3, phase: InputActionPhase]>;
    readonly pan: Signal<[position: Vector3, phase: TouchPhase]>;
    readonly pinch: Signal<[distance: number, scale: number, phase: TouchPhase]>;
    constructor();
    /**
     * Cleans up the touchscreen listener.
     */
    Destroy(): void;
}
