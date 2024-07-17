type MonoSignalParams<T> = Parameters<
	T extends unknown[] ? (...args: T) => never : T extends unknown ? (arg: T) => never : () => never
>;

type MonoSignalCallback<T> = (...args: MonoSignalParams<T>) => boolean | undefined;

/** Represents a connection to a MonoSignal. */
interface MonoSignalConnection {
	readonly Connected: boolean;
	Disconnect(): void;
}

/** Represents a Unity-specific signal bound to either a C# event or a UnityEvent. */
interface MonoSignal<T extends unknown[] | unknown> {
	/**
	 * Connect a callback function to the signal. When the signal is fired, the callback
	 * will be invoked.
	 *
	 * To cancel propagation of the event to the next callbacks, the callback may return
	 * `true` to indicate a cancellation. Callbacks can only cancel the event if they
	 * have not yielded.
	 */
	Connect(callback: MonoSignalCallback<T>): MonoSignalConnection;

	/**
	 * Connect a callback function to the signal with the given priority (highest priority
	 * goes first). When the signal is fired, the callback will be invoked.
	 *
	 * To cancel propagation of the event to the next callbacks, the callback may return
	 * `true` to indicate a cancellation. Callbacks can only cancel the event if they
	 * have not yielded.
	 */
	ConnectWithPriority(priority: number, callback: MonoSignalCallback<T>): MonoSignalConnection;

	/**
	 * Connect a callback function to the signal. When the signal is fired, the callback
	 * will be invoked and the connection will be automatically disconnected.
	 *
	 * To cancel propagation of the event to the next callbacks, the callback may return
	 * `true` to indicate a cancellation. Callbacks can only cancel the event if they
	 * have not yielded.
	 */
	Once(callback: MonoSignalCallback<T>): MonoSignalConnection;

	/**
	 * Connect a callback function to the signal with the given priority (highest priority
	 * goes first). When the signal is fired, the callback will be invoked and the connection
	 * will be automatically disconnected.
	 *
	 * To cancel propagation of the event to the next callbacks, the callback may return
	 * `true` to indicate a cancellation. Callbacks can only cancel the event if they
	 * have not yielded.
	 */
	OnceWithPriority(priority: number, callback: MonoSignalCallback<T>): MonoSignalConnection;

	/**
	 * Disconnect all connections to this signal.
	 */
	DisconnectAll(): void;
}
