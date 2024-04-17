type BasicEasingFunction = (elapsedTime: number, initialValue: number, changeInValue: number, totalDuration: number) => number;
type PeriodicEasingFunction = (elapsedTime: number, initialValue: number, changeInValue: number, totalDuration: number, amplitude: number, period: number) => number;
export declare const LinearEase: BasicEasingFunction;
export declare const InElastic: PeriodicEasingFunction;
export declare class Tween {
    private running;
    private disconnect;
    private interpolator;
    protected constructor(duration: number, easingFunction: BasicEasingFunction | PeriodicEasingFunction, callback: (value: number) => void, initialValue?: number, endValue?: number, v1?: number, v2?: number);
    Cancel(): this;
    Pause(): this;
    Play(): this;
    IsPlaying(): boolean;
    private elapsedTime;
    static InElastic(totalDuration: number, callback: (delta: number) => void, initialValue?: number, endValue?: number): Tween;
    static Linear(totalDuration: number, callback: (delta: number) => void, initialValue?: number, endValue?: number): Tween;
}
export {};
