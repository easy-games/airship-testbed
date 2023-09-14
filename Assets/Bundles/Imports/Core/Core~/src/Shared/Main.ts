import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { RunUtil } from "./Util/RunUtil";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "./Util/Timer";

Game.Context = CoreContext.GAME;

const vars: DynamicVariables[] = [
	AssetBridge.Instance.LoadAsset<DynamicVariables>("Imports/Core/Shared/Resources/DynamicVariables/Combat.asset"),
	AssetBridge.Instance.LoadAsset<DynamicVariables>("Imports/Core/Shared/Resources/DynamicVariables/Camera.asset"),
];
for (const dynamicVar of vars) {
	dynamicVar.Register();
}

// Force import of TimeUtil
TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();

const coreCamera = GameObject.Find("CoreCamera");
Object.Destroy(coreCamera);

if (RunUtil.IsServer()) {
	const server = require("Imports/Core/Server/Resources/TS/MainServer") as {
		SetupServer: () => void;
	};
	server.SetupServer();
} else {
	const client = require("Imports/Core/Client/Resources/TS/MainClient") as {
		SetupClient: (context: CoreContext) => void;
	};
	client.SetupClient(CoreContext.GAME);
}

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