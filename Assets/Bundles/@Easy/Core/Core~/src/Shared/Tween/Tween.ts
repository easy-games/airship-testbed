import { OnFixedUpdate, OnUpdate } from "Shared/Util/Timer";

/* eslint-disable @typescript-eslint/no-loss-of-precision */
type BasicEasingFunction = (
	elapsedTime: number,
	initialValue: number,
	changeInValue: number,
	totalDuration: number,
) => number;

type PeriodicEasingFunction = (
	elapsedTime: number,
	initialValue: number,
	changeInValue: number,
	totalDuration: number,
	amplitude: number,
	period: number,
) => number;

export const LinearEase: BasicEasingFunction = (t, b, c, d) => {
	return (c * t) / d + b;
};

export const InElastic: PeriodicEasingFunction = (t, b, c, d, a, p) => {
	t = t / d - 1;
	if (t === -1) {
		return b;
	} else {
		if (t === 0) {
			return b + c;
		} else {
			p ??= d * 0.3;
			let abs_c: number;

			if (c < 0) {
				abs_c = -c;
			} else {
				abs_c = c;
			}

			if (a === undefined || a < abs_c) {
				// eslint-disable-next-line prettier/prettier
				return -(c * 1024 ** t * math.sin((t * d - p * 0.25) * 6.2831853071795864 / p)) + b;
			} else {
				// eslint-disable-next-line prettier/prettier
				return -(a * 1024 ** t * math.sin((t * d - p / 6.2831853071795864 * math.asin(c/a)) * 6.2831853071795864 / p)) + b;
			}
		}
	}
};

function numberLerp(v0: number, v1: number) {
	const dv = v1 - v0;
	return (t: number) => {
		return v0 + dv * t;
	};
}

export class Tween {
	private running = false;
	private disconnect: (() => void) | undefined;
	private interpolator: (step: number) => void;

	protected constructor(
		duration: number,
		easingFunction: BasicEasingFunction | PeriodicEasingFunction,
		callback: (value: number) => void,
		initialValue = 0,
		endValue = 1,
		v1?: number,
		v2?: number,
	) {
		const lerpFn = numberLerp(initialValue, endValue);

		this.interpolator = (step: number) => {
			print("step", step);
			const elapsedTime = this.elapsedTime + step;
			this.elapsedTime = elapsedTime;

			if (duration > elapsedTime) {
				const v = lerpFn(easingFunction(elapsedTime, 0, 1, duration, v1!, v2!));
				callback(v);
			} else {
				callback(endValue);
				this.Pause();
			}
		};
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
			this.disconnect = OnFixedUpdate.Connect(this.interpolator);
			this.running = true;
		}

		return this;
	}

	private elapsedTime = 0;

	// Can't get this working right. lol
	public static InElastic(
		totalDuration: number,
		callback: (delta: number) => void,
		initialValue?: number,
		endValue?: number,
	) {
		return new Tween(totalDuration, InElastic, callback, initialValue, endValue);
	}

	public static Linear(
		totalDuration: number,
		callback: (delta: number) => void,
		initialValue?: number,
		endValue?: number,
	) {
		return new Tween(totalDuration, LinearEase, callback, initialValue, endValue);
	}
}
