/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Signal } from "../../Util/Signal";
import { PointerButtonSignal } from "./Signals/PointerButtonSignal";
import { ScrollSignal } from "./Signals/ScrollSignal";
export declare class MouseDriver {
    private static inst;
    readonly LeftButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly RightButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly MiddleButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly Scrolled: Signal<[event: ScrollSignal]>;
    readonly Moved: Signal<[location: Vector3]>;
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
