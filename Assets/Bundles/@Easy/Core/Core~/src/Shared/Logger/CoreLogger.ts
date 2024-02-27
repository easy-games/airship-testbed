import { RunUtil } from "../Util/RunUtil";

export class CoreLogger {
	public static LogInternal(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.Log(msg);
		}
	}

	public static WarnInternal(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.LogWarning(msg);
		}
	}

	public static ErrorInternal(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.LogError(msg);
		}
	}
}
