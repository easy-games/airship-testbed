/**
 * This is the entrypoint of Core.
 */

import { Flamework } from "@Easy/Core/Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { CoreRefs } from "./CoreRefs";
import { Game } from "./Game";
import { InitNet } from "./Network/NetworkAPI";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

Game.coreContext = CoreContext.GAME;
CoreRefs.Init();

task.spawn(() => {
	if (Game.IsClient()) {
		Screen.orientation = ScreenOrientation.LandscapeLeft;
	}
});

// const vars: DynamicVariables[] = [
// 	AssetBridge.Instance.LoadAsset<DynamicVariables>("AirshipPackages/@Easy/Core/DynamicVariables/Combat.asset"),
// 	AssetBridge.Instance.LoadAsset<DynamicVariables>("AirshipPackages/@Easy/Core/DynamicVariables/Camera.asset"),
// ];
// for (const dynamicVar of vars) {
// 	dynamicVar.Register();
// }

// Force import of TimeUtil
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();
InitNet();

const fullGo = gameObject as GameObject & {
	OnUpdate(callback: () => void): void;
	OnLateUpdate(callback: () => void): void;
	OnFixedUpdate(callback: () => void): void;
};
// Drive timer:
fullGo.OnUpdate(() => {
	OnUpdate.Fire(Time.deltaTime);
});
fullGo.OnLateUpdate(() => {
	OnLateUpdate.Fire(Time.deltaTime);
});
fullGo.OnFixedUpdate(() => {
	OnFixedUpdate.Fire(Time.fixedDeltaTime);
});

const COREPATH = "@easy/core";

Flamework.AddPath(`${COREPATH}/shared`, "^.*singleton.ts$", ["mainmenu/", "protected/"]);
if (Game.IsClient()) {
	Flamework.AddPath(`${COREPATH}/client/airship`, "^.*controller.ts$");
	Flamework.AddPath(`${COREPATH}/client/controllers`, "^.*controller.ts$", ["protectedcontrollers/"]);
}
if (Game.IsServer()) {
	Flamework.AddPath(`${COREPATH}/server/airship`, "^.*service.ts$");
	Flamework.AddPath(`${COREPATH}/server/services`, "^.*service.ts$");
}
Flamework.Ignite();

if (Game.IsServer()) {
	const serverInfo = contextbridge.invoke<
		() => {
			gameId: string;
			serverId: string;
			organizationId: string;
		}
	>("ServerInfo", LuauContext.Protected);
	Game.serverId = serverInfo.serverId;
	Game.gameId = serverInfo.gameId;
	Game.organizationId = serverInfo.organizationId;
}

// if (Game.IsClient()) {
// 	CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((message, senderPrefix, senderClientId) => {
// 		contextbridge.invoke<
// 			(rawText: string, nameWithPrefix: string | undefined, senderClientId: number | undefined) => void
// 		>("Chat:AddMessage", LuauContext.Protected, message, senderPrefix, senderClientId);
// 	});
// }

// contextbridge.subscribe<(from: LuauContext, sceneName: string, clientId: number, added: boolean) => void>(
// 	"SceneManager:OnClientPresenceChangeStart",
// 	(from, sceneName, clientId, added) => {
// 		SceneManager.onClientPresenceChangeStart.Fire(clientId, sceneName, added);
// 	},
// );
// contextbridge.subscribe<(from: LuauContext, sceneName: string, clientId: number, added: boolean) => void>(
// 	"SceneManager:OnClientPresenceChangeEnd",
// 	(from, sceneName, clientId, added) => {
// 		SceneManager.onClientPresenceChangeEnd.Fire(clientId, sceneName, added);
// 	},
// );
