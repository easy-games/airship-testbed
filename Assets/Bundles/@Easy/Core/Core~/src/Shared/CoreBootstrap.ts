/**
 * This is the entrypoint of Core.
 */

import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { Flamework } from "Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { Bootstrap } from "./Bootstrap/Bootstrap";
import { CoreContext } from "./CoreClientContext";
import { CoreRefs } from "./CoreRefs";
import { Game } from "./Game";
import { InitNet } from "./Network/NetworkAPI";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { RunUtil } from "./Util/RunUtil";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "./Util/Timer";

CoreRefs.Init();

Game.coreContext = CoreContext.GAME;

task.spawn(() => {
	if (Game.IsClient()) {
		Screen.orientation = ScreenOrientation.LandscapeLeft;
	}
});

// const vars: DynamicVariables[] = [
// 	AssetBridge.Instance.LoadAsset<DynamicVariables>("@Easy/Core/Shared/Resources/DynamicVariables/Combat.asset"),
// 	AssetBridge.Instance.LoadAsset<DynamicVariables>("@Easy/Core/Shared/Resources/DynamicVariables/Camera.asset"),
// ];
// for (const dynamicVar of vars) {
// 	dynamicVar.Register();
// }

// Force import of TimeUtil
TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();
AvatarUtil.Initialize();
InitNet();

const coreCamera = GameObject.Find("CoreCamera");
Object.Destroy(coreCamera);

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

Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts", "^.*singleton.lua$");
if (RunUtil.IsClient()) {
	Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/airship", "^.*controller.lua$");
	Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/controllers", "^.*controller.lua$");
	// Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*controller.lua$");
	// Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*singleton.lua$");
}
if (RunUtil.IsServer()) {
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/airship", "^.*service.lua$");
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/services", "^.*service.lua$");
}
Flamework.Ignite();

if (RunUtil.IsServer()) {
	const server = require("@Easy/Core/Server/Resources/TS/CoreServerBootstrap") as {
		SetupServer: () => void;
	};
	server.SetupServer();
}

Bootstrap.PrepareVoxelWorld();
Bootstrap.Prepare();
Bootstrap.FinishedSetup();
