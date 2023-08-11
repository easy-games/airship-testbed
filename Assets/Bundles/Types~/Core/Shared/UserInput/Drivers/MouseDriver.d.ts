/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
export declare class MouseDriver {
    private static inst;
    readonly LeftButtonChanged: any;
    readonly RightButtonChanged: any;
    readonly MiddleButtonChanged: any;
    readonly Scrolled: any;
    readonly Moved: any;
    private readonly inputProxy;
    private constructor();
    IsLeftDown(): boolean;
    IsRightDown(): boolean;
    IsMiddleDown(): boolean;
    GetLocation(): Vector3;
    GetDelta(): Vector3;
    SetLocation(position: Vector3): void;
    IsLocked(): boolean;
    SetLocked(locked: boolean): void;
    /** **NOTE:** Internal only. Use `Mouse` class instead. */
    static instance(): MouseDriver;
}
