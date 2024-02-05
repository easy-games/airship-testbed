import { Signal } from "../../Util/Signal";
import { PointerButtonSignal } from "./Signals/PointerButtonSignal";
import { ScrollSignal } from "./Signals/ScrollSignal";
export declare class MouseDriver {
    private static inst;
    readonly leftButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly rightButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly middleButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly scrolled: Signal<[event: ScrollSignal]>;
    readonly moved: Signal<[location: Vector3]>;
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
    static Instance(): MouseDriver;
}
