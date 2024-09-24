import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Signal } from "../Util/Signal";
import { TweenEasingFunction } from "./EasingFunctions";

type LerpFunction<T> = (value: number) => T;

function NumberLerp(v0: number, v1: number): LerpFunction<number> {
	const dv = v1 - v0;
	return (t: number) => {
		return v0 + dv * t;
	};
}

function VectorLerp(v0: Vector3, v1: Vector3): LerpFunction<Vector3> {
	return (t: number) => Vector3.Lerp(v0, v1, t);
}

function Vector2Lerp(v0: Vector2, v1: Vector2): LerpFunction<Vector2> {
	return (t: number) => Vector2.Lerp(v0, v1, t);
}

function ColorLerp(v0: Color, v1: Color): LerpFunction<Color> {
	return (t: number) => Color.Lerp(v0, v1, t);
}

type TweenSignal<T> = Pick<
	Signal<T>,
	"Connect" | "ConnectWithPriority" | "Once" | "Wait" | "HasConnections" | "GetConnectionCount"
>;
export interface LuauTween<T> {
	Cancel(): LuauTween<T>;
	Pause(): LuauTween<T>;
	Play(): LuauTween<T>;
	SetEasingFunction(easingFunction: TweenEasingFunction): LuauTween<T>;
	SetUseUnscaledTime(useUnscaledTime: boolean): LuauTween<T>;
	IsPlaying(): boolean;
	Destroy(): void;

	readonly OnCompleted: TweenSignal<void>;
}

export type TweenCallback<T> = (value: T) => void;

export class Tween<T> implements LuauTween<T> {
	private running = false;
	private elapsedTime = 0;
	private disconnect: (() => void) | undefined;

	private duration: number;
	private interpolator: (step: number) => void;
	private lerpFunction: LerpFunction<T>;
	private callback: (value: T) => void;
	private endValue: T;
	private useUnscaledTime = false;

	public readonly OnCompleted = new Signal<void>();

	protected constructor(
		duration: number,
		easingFunction: TweenEasingFunction,
		lerpFunction: LerpFunction<T>,
		callback: (value: T) => void,
		endValue: T,
	) {
		this.duration = duration;
		this.callback = callback;
		this.lerpFunction = lerpFunction;
		this.endValue = endValue;

		this.SetEasingFunction(easingFunction);
	}

	public SetUseUnscaledTime(useUnscaledTime: boolean) {
		this.useUnscaledTime = useUnscaledTime;
		return this;
	}

	public SetEasingFunction(easingFunction: TweenEasingFunction) {
		const lerpFunction = this.lerpFunction;
		const duration = this.duration;
		const callback = this.callback;
		const endValue = this.endValue;

		const wasPlaying = this.IsPlaying();
		if (wasPlaying) this.Pause();

		this.interpolator = (step: number) => {
			const elapsedTime = this.elapsedTime + (this.useUnscaledTime ? Time.unscaledDeltaTime : step);
			this.elapsedTime = elapsedTime;

			if (duration > elapsedTime) {
				const v = lerpFunction(easingFunction(elapsedTime, 0, 1, duration, undefined!, undefined!));
				callback(v);
			} else {
				callback(endValue);
				this.OnCompleted.Fire();
				this.Pause();
			}
		};

		if (wasPlaying) this.Play();
		return this;
	}

	public Cancel() {
		this.elapsedTime = 0;
		this.Pause();

		return this;
	}

	public Pause() {
		if (this.running) {
			this.disconnect?.();
			this.running = false;
		}

		return this;
	}

	public Play() {
		if (!this.running) {
			this.disconnect = OnUpdate.Connect(this.interpolator);
			this.running = true;
		}

		return this;
	}

	public IsPlaying() {
		return this.running;
	}

	public static Number(
		easingFunction: TweenEasingFunction,
		durationSeconds: number,
		callback: (val: number) => void,
		from: number = 0,
		to: number = 1,
	): LuauTween<number> {
		return new Tween<number>(durationSeconds, easingFunction, NumberLerp(from, to), callback, to).Play();
	}

	public static Vector3(
		easingFunction: TweenEasingFunction,
		durationSeconds: number,
		callback: TweenCallback<Vector3>,
		from: Vector3 = Vector3.zero,
		to: Vector3 = Vector3.one,
	): LuauTween<Vector3> {
		return new Tween(durationSeconds, easingFunction, VectorLerp(from, to), callback, to).Play();
	}

	public static Vector2(
		easingFunction: TweenEasingFunction,
		durationSeconds: number,
		callback: TweenCallback<Vector2>,
		from: Vector2 = Vector2.zero,
		to: Vector2 = Vector2.one,
	): LuauTween<Vector2> {
		return new Tween(durationSeconds, easingFunction, Vector2Lerp(from, to), callback, to).Play();
	}

	public static Color(
		easingFunction: TweenEasingFunction,
		durationSeconds: number,
		callback: TweenCallback<Color>,
		from: Color = Color.black,
		to: Color = Color.white,
	): LuauTween<Color> {
		return new Tween(durationSeconds, easingFunction, ColorLerp(from, to), callback, to).Play();
	}

	public Destroy() {
		this.disconnect?.();
		this.OnCompleted.Destroy();
	}
}
