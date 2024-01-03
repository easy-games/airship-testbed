export interface ProgressBarOptions {
    initialPercentDelta?: number;
    fillColor?: Color;
    deathOnZero?: boolean;
}
export declare class Healthbar {
    private readonly transformKey;
    private readonly graphicsKey;
    private readonly animKey;
    transform: RectTransform;
    private refs;
    private fillImage;
    private fillTransform;
    private changeFillTransform;
    private growthFillTransform;
    private graphicsHolder;
    private brokenGraphicsHolder;
    private deathAnim;
    fillDurationInSeconds: number;
    changeDelayInSeconds: number;
    changeDurationInSeconds: number;
    private enabled;
    deathOnZero: boolean;
    private currentDelta;
    constructor(transform: Transform, options?: ProgressBarOptions);
    SetActive(visible: boolean): void;
    SetColor(newColor: Color): void;
    InstantlySetValue(percentDelta: number): void;
    SetValue(percentDelta: number): void;
    Destroy(): void;
}
