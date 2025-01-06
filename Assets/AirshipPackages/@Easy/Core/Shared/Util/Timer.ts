import { Signal } from "./Signal";

export const OnUpdate = new Signal<[deltaTime: number]>().WithAllowYield(false);
export const OnLateUpdate = new Signal<[deltaTime: number]>().WithAllowYield(false);
export const OnFixedUpdate = new Signal<[fixedDeltaTime: number]>().WithAllowYield(false);

export function SetTimeout<T extends unknown[]>(duration: number, callback: (...args: T) => void, ...args: T) {
	const thread = task.delay(
		duration,
		(...args: T) => {
			task.spawn(callback, ...args);
		},
		...args,
	);

	return () => {
		task.cancel(thread);
	};
}

export function SetInterval(interval: number, callback: Callback, immediate?: boolean) {
	const thread = task.spawn(() => {
		if (immediate) {
			task.spawn(callback);
		}
		while (true) {
			task.wait(interval);
			task.spawn(callback);
		}
	});

	return () => {
		task.cancel(thread);
	};
}
