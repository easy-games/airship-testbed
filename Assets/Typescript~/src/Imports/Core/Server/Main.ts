print(`CoreServer.Main.ts()`);

const autoShutdownBridgeGO = GameObject.Find("AutoShutdownBridge");

if (autoShutdownBridgeGO) {
	const autoShutdownBridge = autoShutdownBridgeGO.GetComponent<AutoShutdownBridge>();

	if (autoShutdownBridge) {
		autoShutdownBridge.SetBundlesLoaded(true);
	}
}
