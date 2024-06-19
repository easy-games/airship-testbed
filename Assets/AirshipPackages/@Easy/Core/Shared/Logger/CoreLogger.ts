import { RunUtil } from "../Util/RunUtil";

export class CoreLogger {
	public static Log(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.Log(`<b>[Internal]</b> ${msg}`);
		}
	}

	public static Warn(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.LogWarning(`<b>[Internal]</b> ${msg}`);
		}
	}

	public static Error(msg: unknown): void {
		if (RunUtil.IsInternal()) {
			Debug.LogError(`<b>[Internal]</b> ${msg}`);
		}
	}
}
