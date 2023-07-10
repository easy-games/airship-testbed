import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { RunUtil } from "./Util/RunUtil";
import { AudioManager } from "./Audio/AudioManager";
import { TimeUtil } from "./Util/TimeUtil";

print(`Shared.Main.ts()`);

// Force import of TimeUtil
TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();

const coreCamera = GameObject.Find("CoreCamera");
Object.Destroy(coreCamera);

if (RunUtil.IsServer()) {
	const server = require("Server/TS/MainServer") as {
		SetupServer: () => void;
	};
	server.SetupServer();
} else {
	const client = require("Client/TS/MainClient") as {
		SetupClient: () => void;
	};
	client.SetupClient();
}
