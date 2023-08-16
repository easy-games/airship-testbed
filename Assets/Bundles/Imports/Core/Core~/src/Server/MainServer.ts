import { Flamework } from "@easy-games/flamework-core";
import { InitNet } from "Shared/Network/NetworkAPI";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Shared/Util/Timer";

print("Core.MainServer");

const autoShutdownBridge = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>();
if (autoShutdownBridge) {
	autoShutdownBridge.SetBundlesLoaded(true);
}

function LoadFlamework() {
	Flamework.AddPath("assets/bundles/imports/core/server/resources/ts/services", "^.*service.lua$");
	Flamework.Ignite();
}

export function SetupServer() {
	// Drive timer:
	gameObject.OnUpdate(() => {
		OnUpdate.Fire(TimeUtil.GetDeltaTime());
	});
	gameObject.OnLateUpdate(() => {
		OnLateUpdate.Fire(TimeUtil.GetDeltaTime());
	});
	gameObject.OnFixedUpdate(() => {
		OnFixedUpdate.Fire(TimeUtil.GetFixedDeltaTime());
	});
	InstanceFinder.TimeManager.OnOnTick(() => {
		OnTick.Fire();
	});

	InitNet();
	LoadFlamework();
	print("[Core]: Finished setting up server.");
}
