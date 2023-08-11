export declare class MobileJoystickDriver {
    private static inst;
    readonly Changed: any;
    private constructor();
    SetVisible(visible: boolean): void;
    IsVisible(): boolean;
    /** **NOTE:** Internal only. Use `Touchscreen` class instead. */
    static instance(): MobileJoystickDriver;
}
