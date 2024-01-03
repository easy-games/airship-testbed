/**
 * This is the entrypoint of Core.
 */

import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { AudioManager } from "./Audio/AudioManager";
import { Bootstrap } from "./Bootstrap/Bootstrap";
import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
import { InitNet } from "./Network/NetworkAPI";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { RunUtil } from "./Util/RunUtil";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "./Util/Timer";

Game.context = CoreContext.GAME;

const vars: DynamicVariables[] = [
	AssetBridge.Instance.LoadAsset<DynamicVariables>("@Easy/Core/Shared/Resources/DynamicVariables/Combat.asset"),
	AssetBridge.Instance.LoadAsset<DynamicVariables>("@Easy/Core/Shared/Resources/DynamicVariables/Camera.asset"),
];
for (const dynamicVar of vars) {
	dynamicVar.Register();
}

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

if (RunUtil.IsServer()) {
	const server = require("@Easy/Core/Server/Resources/TS/CoreServerBootstrap") as {
		SetupServer: () => void;
	};
	server.SetupServer();
} else {
	const client = require("@Easy/Core/Client/Resources/TS/CoreClientBootstrap") as {
		SetupClient: (context: CoreContext) => void;
	};
	client.SetupClient(CoreContext.GAME);
}

Bootstrap.PrepareVoxelWorld();
Bootstrap.Prepare();
Bootstrap.FinishedSetup();
