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

declare const enum LuauContext {
	Game,
	Protected,
}

declare namespace contextbridge {
	/** Subscribe to broadcasts for a specific `topic`. The returned function can be called to unsubscribe the function. */
	function subscribe(topic: string, handler: (fromContext: LuauContext, ...args: unknown[]) => void): () => void;

	/** Broadcast on a specific channel `topic` to all Luau contexts. */
	function broadcast(topic: string, ...args: unknown[]): void;

	/** Assign a callback for a specific `topic` for the current Luau context. Only one can be assigned per context and topic pair. */
	function callback(topic: string, callback: Callback): void;

	/** Invoke a callback within `toContext` for `topic`. */
	type InvokeResponse = T extends unknown[] ? LuaTuple<T> : T;
	function invoke<InvokeResponse>(topic: string, toContext: LuauContext, ...args: unknown[]): InvokeResponse;
}
