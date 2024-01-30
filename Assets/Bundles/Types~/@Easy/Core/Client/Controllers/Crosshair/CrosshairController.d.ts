export declare class CrosshairController {
    private crosshairPrefab;
    private crosshairImage;
    private crosshairModifier;
    private crosshairVisible;
    private enabled;
    constructor();
    SetEnabled(enabled: boolean): void;
    private SetVisible;
    /**
     * Registers a disabler for the crosshair
     * @returns A cleanup function you can call to remove this disabler
     */
    AddDisabler(): () => void;
    IsVisible(): boolean;
}
