/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Signal } from "../../Util/Signal";
import { PointerButtonSignal } from "../Drivers/Signals/PointerButtonSignal";
export declare class Pointer {
    private readonly bin;
    private readonly touchscreen;
    private readonly mouse;
    readonly down: Signal<[event: PointerButtonSignal]>;
    readonly up: Signal<[event: PointerButtonSignal]>;
    readonly moved: Signal<[location: Vector3]>;
    constructor();
    /**
     * Cleans up the pointer listeners.
     */
    Destroy(): void;
}
