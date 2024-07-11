const isClient = RunCore.IsClient();
const isServer = RunCore.IsServer();
const isEditor = RunCore.IsEditor();
const isClone = RunCore.IsClone();
const isInternal = RunCore.IsInternal();

const platform = Application.platform;

/**
 * @deprecated use "Game" instead.
 * @internal
 */
export class RunUtil {
	public static IsClient(): boolean {
		return isClient;
	}

	public static IsServer(): boolean {
		return isServer;
	}

	public static IsEditor(): boolean {
		return isEditor;
	}

	/**
	 * @internal
	 */
	public static IsInternal(): boolean {
		return isInternal;
	}

	/**
	 * Shortcut for checking if both IsClient() and IsServer() is true.
	 */
	public static IsHosting(): boolean {
		return isClient && isServer;
	}

	public static IsClone(): boolean {
		return isClone;
	}

	public static IsWindows(): boolean {
		return platform === RuntimePlatform.WindowsPlayer || platform === RuntimePlatform.WindowsEditor;
	}

	public static IsMac(): boolean {
		return platform === RuntimePlatform.OSXPlayer || platform === RuntimePlatform.OSXEditor;
	}
}
