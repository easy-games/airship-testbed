import { OnUpdate } from "./Timer";

let startTime = os.time();

/**
 * Time synced between server and client.
 */
export function SharedTime() {
	return InstanceFinder.TimeManager.TicksToTime(TickType.Tick);
}

export function WaitFrame() {
	const promise = new Promise<void>((resolve) => {
		OnUpdate.Once(() => {
			resolve();
		});
	});
	promise.await();
}

export class TimeUtil {
	/**
	 * @returns Time elapsed since server/client has started.
	 */
	public static GetLifetimeSeconds(): number {
		return os.time() - startTime;
	}

	/**
	 * @returns Time synchronized between server and client.
	 */
	public static GetServerTime(): number {
		return SharedTime();
	}

	/**
	 * @returns The interval in seconds from the last frame to the current one.
	 */
	public static GetDeltaTime(): number {
		return Time.deltaTime;
	}

	/**
	 * @returns The interval in seconds from the last physics frame to the current one.
	 */
	public static GetFixedDeltaTime(): number {
		return Time.fixedDeltaTime;
	}
}
