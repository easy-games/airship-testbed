import { Flamework } from "@easy-games/flamework-core";
import { CoreContext } from "Shared/CoreClientContext";
import { InitNet } from "Shared/Network/NetworkAPI";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Shared/Util/Timer";

print("Core.MainClient");

function LoadFlamework(context: CoreContext) {
	if (context === CoreContext.GAME) {
		Flamework.AddPath("assets/bundles/imports/core/client/resources/ts/controllers", "^.*controller.lua$");
	}
	Flamework.AddPath("assets/bundles/imports/core/client/resources/ts/mainmenucontrollers", "^.*controller.lua$");
	Flamework.Ignite();
}

export function SetupClient(context: CoreContext) {
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
	if (InstanceFinder.TimeManager !== undefined) {
		InstanceFinder.TimeManager.OnOnTick(() => {
			OnTick.Fire();
		});
	}

    InitNet();
	LoadFlamework(context);
}
