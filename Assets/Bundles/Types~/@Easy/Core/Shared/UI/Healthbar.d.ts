export interface ProgressBarOptions {
    initialPercentDelta?: number;
    fillColor?: Color;
    deathOnZero?: boolean;
}
export declare class Healthbar {
    private readonly TransformKey;
    private readonly GraphicsKey;
    private readonly AnimKey;
    Transform: RectTransform;
    private refs;
    private fillImage;
    private fillTransform;
    private changeFillTransform;
    private growthFillTransform;
    private graphicsHolder;
    private brokenGraphicsHolder;
    private deathAnim;
    FillDurationInSeconds: number;
    ChangeDelayInSeconds: number;
    ChangeDurationInSeconds: number;
    private enabled;
    DeathOnZero: boolean;
    private currentDelta;
    constructor(transform: Transform, options?: ProgressBarOptions);
    SetActive(visible: boolean): void;
    SetColor(newColor: Color): void;
    InstantlySetValue(percentDelta: number): void;
    SetValue(percentDelta: number): void;
    Destroy(): void;
}
