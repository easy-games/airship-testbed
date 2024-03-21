/// <reference types="@easy-games/compiler-types" />
export declare class SpringTween {
    private readonly minDuration;
    private readonly spring;
    private elapsedTime;
    constructor(position: Vector3, angularFrequency: number, minDuration: number);
    SetGoal(goal: Vector3): void;
    Impulse(impulse: Vector3): void;
    ResetTo(position: Vector3): void;
    Update(deltaTime: number): LuaTuple<[position: Vector3, isDone: boolean]>;
}
