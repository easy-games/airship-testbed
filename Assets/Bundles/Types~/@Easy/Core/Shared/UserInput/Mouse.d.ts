/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Signal } from "../Util/Signal";
import { PointerButtonSignal } from "./Drivers/Signals/PointerButtonSignal";
import { ScrollSignal } from "./Drivers/Signals/ScrollSignal";
export declare class Mouse {
    private readonly bin;
    private readonly mouseDriver;
    readonly leftDown: Signal<[event: PointerButtonSignal]>;
    readonly leftUp: Signal<[event: PointerButtonSignal]>;
    readonly rightDown: Signal<[event: PointerButtonSignal]>;
    readonly rightUp: Signal<[event: PointerButtonSignal]>;
    readonly middleDown: Signal<[event: PointerButtonSignal]>;
    readonly middleUp: Signal<[event: PointerButtonSignal]>;
    readonly scrolled: Signal<[event: ScrollSignal]>;
    readonly moved: Signal<[location: Vector3]>;
    private isLeftDown;
    private isRightDown;
    private isMiddleDown;
    private location;
    constructor();
    /** Returns `true` if the left mouse button is down. */
    IsLeftButtonDown(): boolean;
    /** Returns `true` if the right mouse button is down. */
    IsRightButtonDown(): boolean;
    /** Returns `true` if the middle mouse button is down. */
    IsMiddleButtonDown(): boolean;
    /** Gets the position of the mouse on-screen. */
    GetLocation(): Vector3;
    /** Sets the position of the mouse on-screen. */
    SetLocation(position: Vector3): void;
    /** Gets the mouse's change in position on-screen over the last frame. */
    GetDelta(): Vector3;
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
