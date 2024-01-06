/// <reference types="@easy-games/compiler-types" />
export declare enum MeshFlashType {
    Tween = 0,
    Instant = 1
}
export default class MeshFlashingBehaviour extends AirshipBehaviour {
    private originalColor;
    meshRenderer: MeshRenderer;
    flashFrequency: number;
    flashIntensity: number;
    Start(): void;
    TweenFlash(count?: number, frequency?: number): void;
    InstantFlash(count?: number, frequency?: number): void;
    private flashingBin;
    FlashStart(flashType: MeshFlashType, options: MeshFlashOptions): void;
    FlashStop(): void;
}
export interface MeshFlashOptions {
    readonly IntervalTickMod?: number;
    readonly Frequency?: number;
}
