/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Signal } from "../../Util/Signal";
import { PointerButtonSignal } from "../Drivers/Signals/PointerButtonSignal";
export declare class Pointer {
    private readonly bin;
    private readonly touchscreen;
    private readonly mouse;
    readonly Down: Signal<[event: PointerButtonSignal]>;
    readonly Up: Signal<[event: PointerButtonSignal]>;
    readonly Moved: Signal<[location: Vector3]>;
    constructor();
    /**
     * Cleans up the pointer listeners.
     */
    Destroy(): void;
}
