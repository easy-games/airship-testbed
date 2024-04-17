import { Signal } from "../../Util/Signal";
import { PointerButtonSignal } from "./Signals/PointerButtonSignal";
import { ScrollSignal } from "./Signals/ScrollSignal";
export declare class MouseDriver {
    private static inst;
    readonly leftButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly rightButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly middleButtonChanged: Signal<[mouseEvent: PointerButtonSignal]>;
    readonly scrolled: Signal<[event: ScrollSignal]>;
    readonly moved: Signal<[position: Vector2]>;
    private readonly inputBridge;
    private constructor();
    IsLeftDown(): boolean;
    IsRightDown(): boolean;
    IsMiddleDown(): boolean;
    GetPosition(): Vector2;
    GetDelta(): Vector2;
    IsLocked(): boolean;
    SetLocked(locked: boolean): void;
    ToggleMouseVisibility(isVisible: boolean): void;
    /** **NOTE:** Internal only. Use `Mouse` class instead. */
    static Instance(): MouseDriver;
}
