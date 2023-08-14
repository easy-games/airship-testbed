import { Flamework } from "@easy-games/flamework-core";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Shared/Util/Timer";

print("Core.MainClient");

function LoadFlamework() {
	Flamework.AddPath("assets/bundles/imports/core/client/resources/ts/controllers", "^.*controller.lua$");
	Flamework.Ignite();
}

export function SetupClient() {
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

	LoadFlamework();
}
