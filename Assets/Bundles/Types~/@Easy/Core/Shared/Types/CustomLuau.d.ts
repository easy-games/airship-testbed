declare namespace task {
	/** Resumes the passed thread or function instantly using the engine's scheduler. */
	function spawn<T extends Callback>(callback: T, ...args: Parameters<T>): thread;
	function spawn(thread: thread, ...args: unknown[]): thread;

	/** Resumes the passed thread or function at the end of the invocation cycle using the engine's scheduler. */
	function defer<T extends Callback>(callback: T, ...args: Parameters<T>): thread;
	function defer(thread: thread, ...args: unknown[]): thread;

	/** Resumes the passed thread or function after the elapsed `delayTime` seconds using the engine's scheduler. */
	function delay<T extends Callback>(delayTime: number, callback: T, ...args: Parameters<T>): thread;
	function delay(delayTime: number, thread: thread, ...args: unknown[]): thread;

	/** Yields the current thread until the next frame. Returns the delta time waited. */
	function wait(): number;
	/** Yields the current thread for `delayTime` seconds. Returns the delta time waited. */
	function wait(delayTime: number): number;

	/** Cancels the given thread. */
	function cancel(thread: thread): void;
}

/** The context in which Luau is running. */
declare const enum LuauContext {
	Game = 1 << 0,
	Protected = 1 << 1,
}

declare namespace contextbridge {
	type SubscribeCallback = (fromContext: LuauContext, ...args: any[]) => void;

	/**
	 * Subscribe to broadcasts for a specific `topic`. The returned function can be called to unsubscribe the function.
	 *
	 * **NOTE**: Use with `contextbridge.broadcast()`.
	 */
	function subscribe<T extends SubscribeCallback>(topic: string, handler: T): () => void;

	/**
	 * Broadcast on a specific channel `topic` to all Luau contexts.
	 *
	 * **NOTE**: Use with `contextbridge.subscribe()`.
	 */
	function broadcast<T extends Callback>(topic: string, ...args: Parameters<T>): void;

	/**
	 * Assign a callback for a specific `topic` for the current Luau context. Only one can be assigned per context and topic pair.
	 *
	 * **NOTE**: Use with `contextbridge.invoke()`.
	 */
	function callback<T extends Callback>(
		topic: string,
		callback: (fromContext: LuauContext, ...args: Parameters<T>) => ReturnType<T>,
	): void;

	/**
	 * Invoke a callback within `toContext` for `topic`.
	 *
	 * **NOTE**: Use with `contextbridge.callback()`.
	 */
	function invoke<T extends Callback>(topic: string, toContext: LuauContext, ...args: Parameters<T>): ReturnType<T>;

	/** Gets the context of the current running thread. */
	function current(): LuauContext;
}
