import { Signal } from "./Signal";

export const OnUpdate = new Signal<[deltaTime: number]>().WithYieldTracking(false);
export const OnLateUpdate = new Signal<[deltaTime: number]>().WithYieldTracking(false);
export const OnFixedUpdate = new Signal<[fixedDeltaTime: number]>().WithYieldTracking(false);
export const OnTick = new Signal<void>().WithYieldTracking(false);

export function SetTimeout<T extends unknown[]>(duration: number, callback: (...args: T) => void, ...args: T) {
	const triggerTime = Time.time + duration;
	const disconnect = OnUpdate.Connect(() => {
		if (Time.time >= triggerTime) {
			disconnect();
			callback(...args);
		}
	});
	return disconnect;
}

export function SetInterval(interval: number, callback: Callback, immediate?: boolean) {
	if (immediate) {
		callback();
	}
	let nextTriggerTime = Time.time + interval;
	const disconnect = OnUpdate.Connect(() => {
		const now = Time.time;
		if (now >= nextTriggerTime) {
			nextTriggerTime = now + interval;
			callback();
		}
	});
	return disconnect;
}
