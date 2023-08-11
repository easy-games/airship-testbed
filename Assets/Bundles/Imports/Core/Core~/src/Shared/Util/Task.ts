import { SetInterval, SetTimeout } from "./Timer";
import { TimeUtil } from "./TimeUtil";

/** Wrapper around the `coroutine` module to emulate Roblox's task module. */
export class Task {
	/**
	 * Calls/resumes a function immediately through the engine scheduler.
	 * @param callback A function.
	 */
	public static Spawn(callback: () => void): void {
		return coroutine.wrap(callback)();
	}

	/**
	 * Schedules a function to be called/resumed after the given duration (in seconds) has passed,
	 * without throttling.
	 * @param duration A delay duration in seconds.
	 * @param callback A function.
	 */
	public static Delay(duration: number, callback: () => void): void {
		SetTimeout(duration, callback);
	}

	/**
	 * Schedules a function to be called after every interval (in seconds) has passed,
	 * without throttling.
	 * @param duration A interval duration in seconds.
	 * @param callback A function.
	 * @returns A cancellation function.
	 */
	public static Repeat(interval: number, callback: () => void): () => void {
		return SetInterval(interval, callback);
	}

	/**
	 * Yields the current thread until the given duration (in seconds) has passed, without throttling.
	 * @param duration A wait duration in seconds.
	 */
	public static Wait(duration: number): void {
		wait(duration);
	}

	/**
	 * Yields execution until next frame.
	 */
	public static WaitFrame(): void {
		/* TEMP. */
		Task.Wait(TimeUtil.GetDeltaTime());
	}

	/**
	 * Calls/resumes a function on the next resumption cycle.
	 * @param callback A function.
	 */
	public static Defer(callback: () => void): void {
		/* TEMP. */
		Task.WaitFrame();
		callback();
	}
}
