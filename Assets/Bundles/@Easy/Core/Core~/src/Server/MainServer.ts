import { Flamework } from "@easy-games/flamework-core";

const autoShutdownBridge = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>();
if (autoShutdownBridge) {
	autoShutdownBridge.SetBundlesLoaded(true);
}

function LoadFlamework() {
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/services", "^.*service.lua$");
	Flamework.Ignite();
}

export function SetupServer() {
	LoadFlamework();
}
