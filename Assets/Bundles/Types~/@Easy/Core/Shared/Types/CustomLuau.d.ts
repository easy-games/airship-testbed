declare namespace task {
	/** Resumes the passed thread or function instantly using the engine's scheduler. */
	function spawn<T extends Callback>(callback: T, ...args: Parameters<T>): thread;
	function spawn(thread: thread, ...args: unknown[]): thread;

	/** Resumes the passed thread or function after the elapsed `delayTime` seconds using the engine's scheduler. */
	function delay<T extends Callback>(delayTime: number, callback: T, ...args: Parameters<T>): thread;
	function delay(delayTime: number, thread: thread, ...args: unknown[]): thread;

	/** Yields the current thread until the next frame. */
	function wait(): void;
	/** Yields the current thread for `delayTime` seconds. */
	function wait(delayTime: number): void;

	/** Cancels the given thread. */
	function cancel(thread: thread): void;
}
