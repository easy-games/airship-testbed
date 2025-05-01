export class TaskUtil {
	public static RunWithoutYield<T extends Callback>(callback: T): ReturnType<T> {
		let result: ReturnType<T>;
		const thread = task.spawnDetached(() => {
			result = callback();
		});
		if (coroutine.status(thread) !== "dead") {
			error(
				debug.traceback(
					thread,
					"Yield detected in a callback where yielding is not allowed! This will cause undefined behavior!",
				),
			);
		}
		return result! as ReturnType<T>;
	}
}
