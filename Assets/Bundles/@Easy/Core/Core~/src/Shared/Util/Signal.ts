import ObjectUtils from "@easy-games/unity-object-utils";
import { Cancellable } from "./Cancellable";

type SignalParams<T> = Parameters<
	T extends unknown[] ? (...args: T) => never : T extends unknown ? (arg: T) => never : () => never
>;
export type SignalCallback<T> = (...args: SignalParams<T>) => unknown;
type SignalWait<T> = T extends unknown[] ? LuaTuple<T> : T;

interface CallbackItem<T> {
	id: number;
	callback: SignalCallback<T>;
}

export const enum SignalPriority {
	HIGHEST = 0,
	HIGH = 100,
	NORMAL = 200,
	LOW = 300,
	LOWEST = 400,

	/**
	 * The very last priority to get fired.
	 */
	MONITOR = 500,
}

let idCounter = 1;
export class Signal<T extends unknown[] | unknown> {
	private debugLogging = false;
	private trackYielding = true;
	private readonly connections: Map<number, Array<CallbackItem<T>>> = new Map();
	public debugGameObject = false;
	// private readonly connections: Array<CallbackItem<T>> = [];

	/**
	 * Connect a callback function to the signal.
	 *
	 * The returned function can be called to disconnect the callback.
	 */
	public Connect(callback: SignalCallback<T>): () => void {
		return this.ConnectWithPriority(SignalPriority.NORMAL, callback);
	}

	/**
	 * Connect a callback function to the signal.
	 * Highest SignalPriority is called first.
	 *
	 * The returned function can be called to disconnect the callback.
	 */
	public ConnectWithPriority(priority: SignalPriority, callback: SignalCallback<T>): () => void {
		let id = idCounter;
		idCounter++;
		const item: CallbackItem<T> = {
			callback,
			id,
		};
		if (this.connections.has(priority)) {
			this.connections.get(priority)!.push(item);
		} else {
			this.connections.set(priority, [item]);
		}
		return () => {
			for (const [priority, items] of this.connections) {
				let removed = false;
				for (const i of $range(0, items.size() - 1)) {
					const item = items[i];
					if (item.id === id) {
						items.remove(i);
						removed = true;
						break;
					}
				}
				if (removed) {
					if (items.size() === 0) {
						this.connections.delete(priority);
					}
					break;
				}
			}
		};
	}

	/**
	 * Connects a callback function to the signal. The connection is
	 * automatically disconnected after the first invocation.
	 *
	 * The returned function can be called to disconnect the callback.
	 */
	public Once(callback: SignalCallback<T>): () => void {
		let done = false;
		const c = this.Connect((...args) => {
			if (done) return;
			done = true;
			c();
			callback(...args);
		});
		return c;
	}

	/**
	 * Invokes all callback functions with the given arguments.
	 */
	public Fire(...args: SignalParams<T>): T {
		if (this.debugLogging) {
			print("key count: " + this.connections.size());
			let callbackCount = 0;
			for (let priority of ObjectUtils.keys(this.connections)) {
				for (let connection of this.connections.get(priority)!) {
					callbackCount++;
				}
			}
			print("callback count: " + callbackCount);
		}

		let fireCount = 0;
		let keys = ObjectUtils.keys(this.connections).sort((a, b) => a < b);
		let cancelled = false;
		let isCancellable = false;
		if (args.size() === 1 && args[0] instanceof Cancellable) {
			isCancellable = true;
		}
		for (let priority of keys) {
			const entries = [...this.connections.get(priority)!];
			for (let entry of entries) {
				fireCount++;

				const thread = coroutine.create(entry.callback);
				// if (this.debugGameObject) {
				// 	const go = args[0] as GameObject;
				// 	print("fire go.name=" + go.name);
				// }
				const [success, err] = coroutine.resume(thread, ...args);
				if (!success) {
					error(err);
				}
				if (coroutine.status(thread) !== "dead") {
					warn(debug.traceback(thread, "Signal yielded unexpectedly. This might be an error."));
				}

				if (isCancellable) {
					const cancellable = args[0] as Cancellable;
					if (cancellable.IsCancelled()) {
						cancelled = true;
						break;
					}
				}
			}
			if (cancelled) {
				break;
			}
		}
		if (this.debugLogging) {
			print("fire count: " + fireCount);
		}
		return args[0] as T;
	}

	/**
	 * Yields the current thread until the next invocation of the
	 * signal occurs. The invoked arguments will be returned.
	 */
	public Wait() {
		const thread = coroutine.running();
		this.Once((...args) => {
			const [success, err] = coroutine.resume(thread, ...args);
			if (!success) {
				error(err);
			}
		});
		return coroutine.yield() as SignalWait<T>;
	}

	/**
	 * Fires the given signal any time this signal is fired.
	 *
	 * The returned function can be called to disconnect the proxy.
	 */
	public Proxy(signal: Signal<T>) {
		return this.Connect((...args) => {
			signal.Fire(...args);
		});
	}

	/**
	 * Clears all connections.
	 */
	public DisconnectAll() {
		this.connections.clear();
	}

	/**
	 * Returns `true` if there are any connections.
	 */
	public HasConnections() {
		return !this.connections.isEmpty();
	}

	/**
	 * Alias for `DisconnectAll()`.
	 */
	public Destroy() {
		this.DisconnectAll();
	}

	public SetDebug(value: boolean): Signal<T> {
		this.debugLogging = value;
		return this;
	}

	public WithYieldTracking(value: boolean): Signal<T> {
		this.trackYielding = value;
		return this;
	}

	public GetConnectionCount(): number {
		let i = 0;
		for (const value of ObjectUtils.values(this.connections)) {
			i += value.size();
		}
		return i;
	}
}
