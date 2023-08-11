/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
export declare class Mouse {
    private readonly bin;
    private readonly mouseDriver;
    readonly LeftDown: any;
    readonly LeftUp: any;
    readonly RightDown: any;
    readonly RightUp: any;
    readonly MiddleDown: any;
    readonly MiddleUp: any;
    readonly Scrolled: any;
    readonly Moved: any;
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
