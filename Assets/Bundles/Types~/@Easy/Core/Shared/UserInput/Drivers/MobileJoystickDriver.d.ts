import { Signal } from "../../Util/Signal";
export declare class MobileJoystickDriver {
    private static inst;
    readonly changed: Signal<[position: Vector3, phase: MobileJoystickPhase]>;
    private constructor();
    SetVisible(visible: boolean): void;
    IsVisible(): void;
    /** **NOTE:** Internal only. Use `Touchscreen` class instead. */
    static Instance(): MobileJoystickDriver;
}
