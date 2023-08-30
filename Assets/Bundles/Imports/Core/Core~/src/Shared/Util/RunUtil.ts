const isClient = RunCore.IsClient();
const isServer = RunCore.IsServer();
const isEditor = RunCore.IsEditor();
const isClone = RunCore.IsClone();

const platform = Application.platform;

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
