import { AudioManager } from "Imports/Core/Shared/Audio/AudioManager";
import { AppManager } from "Imports/Core/Shared/Util/AppManager";
import { CanvasAPI } from "Imports/Core/Shared/Util/CanvasAPI";
import { RunUtil } from "Imports/Core/Shared/Util/RunUtil";
import { TimeUtil } from "Imports/Core/Shared/Util/TimeUtil";

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
