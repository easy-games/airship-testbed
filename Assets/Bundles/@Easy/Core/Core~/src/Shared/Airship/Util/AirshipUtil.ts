export class AirshipUtil {
	/**
	 * Implements `contextbridge.invoke()` as an async function.
	 * @param topic The topic for the .invoke call
	 * @param args The arguments to be passed to the called function
	 * @returns
	 */
	public static async PromisifyBridgeInvoke<BridgeEvent extends Callback>(
		topic: string,
		...args: Parameters<BridgeEvent>
	): Promise<ReturnType<BridgeEvent>> {
		return (await new Promise((resolve: (value: ReturnType<BridgeEvent>) => void) => {
			task.spawn(() => {
				resolve(contextbridge.invoke<BridgeEvent>(topic, LuauContext.Game, ...args));
			});
		})) as ReturnType<BridgeEvent>;
	}
}
