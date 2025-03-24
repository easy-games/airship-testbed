import { Signal } from "./Signal";

/**
 * Hooks onto the MonoBehaviour `Update` lifecycle.
 */
export const OnUpdate = new Signal<[deltaTime: number]>().WithAllowYield(false);

/**
 * Hooks onto the MonoBehaviour `LateUpdate` lifecycle.
 */
export const OnLateUpdate = new Signal<[deltaTime: number]>().WithAllowYield(false);

/**
 * Hooks onto the MonoBehaviour `FixedUpdate` lifecycle.
 */
export const OnFixedUpdate = new Signal<[fixedDeltaTime: number]>().WithAllowYield(false);

/**
 * Runs the given callback after `duration` seconds. Returns a cancellation function.
 *
 * **Note:** This is functionally equivalent to `task.delay`, except a cancellation function
 * is returned rather than the created thread.
 *
 * @param duration Seconds to wait before calling the `callback` function.
 * @param callback The function to call.
 * @param args Optional arguments to pass to the callback function.
 * @returns Cancellation function.
 *
 * ```ts
 * const cancel = SetTimeout(1, () => {
 *   print("This code runs after 1 second");
 * });
 *
 * // Optionally stop the timeout from running:
 * cancel();
 * ```
 */
export function SetTimeout<T extends unknown[]>(duration: number, callback: (...args: T) => void, ...args: T) {
	let thread = task.delay(
		duration,
		(...args: T) => {
			thread = task.defer(callback, ...args);
		},
		...args,
	);

	return () => {
		task.cancel(thread);
	};
}

/**
 * Continuously calls the callback function every `interval` seconds.
 *
 * @param interval Seconds between calls.
 * @param callback Function to be called.
 * @param immediate Whether or not to call the callback immediately, rather than wait for the first interval (default `false`).
 * @returns Cancellation function.
 *
 * ```ts
 * const cancel = SetInterval(1, () => {
 *   print("This code runs every 1 second");
 * });
 *
 * // Optionally call the cancel function stop the loop:
 * cancel();
 * ```
 */
export function SetInterval(interval: number, callback: Callback, immediate?: boolean) {
	const thread = task.spawn(() => {
		if (immediate) {
			task.defer(callback);
		}
		while (true) {
			task.wait(interval);
			task.defer(callback);
		}
	});

	return () => {
		task.cancel(thread);
	};
}
