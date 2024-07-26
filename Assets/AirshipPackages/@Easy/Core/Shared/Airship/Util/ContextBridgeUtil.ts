export class ContextBridgeUtil {
	/**
	 * Implements `contextbridge.invoke()` as an async function.
	 * @param topic The topic for the .invoke call
	 * @param toContext The context where the target callback lives
	 * @param args The arguments to be passed to the called function
	 * @returns
	 */
	public static async PromisifyBridgeInvoke<BridgeEvent extends (...args: T[]) => unknown, T = any>(
		topic: string,
		toContext: LuauContext,
		...args: Parameters<BridgeEvent>
	): Promise<ReturnType<BridgeEvent>> {
		const res = contextbridge.invoke<BridgeEvent>(topic, toContext, ...args);
		return res;
	}
}
