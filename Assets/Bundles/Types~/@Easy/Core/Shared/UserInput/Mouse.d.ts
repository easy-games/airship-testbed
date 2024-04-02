import { Signal } from "../Util/Signal";
import { PointerButtonSignal } from "./Drivers/Signals/PointerButtonSignal";
import { ScrollSignal } from "./Drivers/Signals/ScrollSignal";
export declare class Mouse {
    static readonly global: Mouse;
    private readonly bin;
    private readonly mouseDriver;
    readonly leftDown: Signal<[event: PointerButtonSignal]>;
    readonly leftUp: Signal<[event: PointerButtonSignal]>;
    readonly rightDown: Signal<[event: PointerButtonSignal]>;
    readonly rightUp: Signal<[event: PointerButtonSignal]>;
    readonly middleDown: Signal<[event: PointerButtonSignal]>;
    readonly middleUp: Signal<[event: PointerButtonSignal]>;
    readonly scrolled: Signal<[event: ScrollSignal]>;
    readonly moved: Signal<[position: Vector2]>;
    private isLeftDown;
    private isRightDown;
    private isMiddleDown;
    private position;
    constructor();
    OnButtonDown(button: MouseButton, callback: (event: PointerButtonSignal) => void): () => void;
    OnButtonUp(button: MouseButton, callback: (event: PointerButtonSignal) => void): () => void;
    /** Returns `true` if the left mouse button is down. */
    IsLeftButtonDown(): boolean;
    /** Returns `true` if the right mouse button is down. */
    IsRightButtonDown(): boolean;
    /** Returns `true` if the middle mouse button is down. */
    IsMiddleButtonDown(): boolean;
    /** Gets the position of the mouse on-screen. */
    GetPosition(): Vector2;
    /** Gets the position of the mouse on-screen as a Vector3, with the Z axis set to 0. */
    GetPositionV3(): Vector3;
    /** Gets the mouse's change in position on-screen over the last frame. */
    GetDelta(): Vector2;
    /**
     * Locks the mouse.
     * Returns an ID that can be used to unlock the mouse.
     */
    AddUnlocker(): number;
    RemoveUnlocker(id: number): void;
    ClearAllLockers(): void;
    /** Check if the mouse is locked. */
    IsLocked(): boolean;
    /** Cleans up the mouse. */
    Destroy(): void;
}
