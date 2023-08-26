import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { RunUtil } from "./Util/RunUtil";
import { TimeUtil } from "./Util/TimeUtil";

print("Core main");
Game.Context = CoreContext.GAME;

const vars: DynamicVariables[] = [
	AssetBridge.LoadAsset<DynamicVariables>("Imports/Core/Shared/Resources/DynamicVariables/Combat.asset"),
	AssetBridge.LoadAsset<DynamicVariables>("Imports/Core/Shared/Resources/DynamicVariables/Camera.asset"),
];
for (const dynamicVar of vars) {
	dynamicVar.Register();
}
print("loaded vars.");

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
