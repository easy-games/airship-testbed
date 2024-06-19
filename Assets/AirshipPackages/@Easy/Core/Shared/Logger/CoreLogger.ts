import { RunUtil } from "../Util/RunUtil";

export class CoreLogger {
	public static Log(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.Log(`[Internal] ${msg}`);
		}
	}

	public static Warn(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.LogWarning(`[Internal] ${msg}`);
		}
	}

	public static Error(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.LogError(`[Internal] ${msg}`);
		}
	}
}
