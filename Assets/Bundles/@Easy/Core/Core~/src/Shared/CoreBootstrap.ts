/**
 * This is the entrypoint of Core.
 */

import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { Flamework } from "Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { Bootstrap } from "./Bootstrap/Bootstrap";
import { CoreContext } from "./CoreClientContext";
import { CoreNetwork } from "./CoreNetwork";
import { CoreRefs } from "./CoreRefs";
import { Game } from "./Game";
import { InitNet } from "./Network/NetworkAPI";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "./Util/Timer";

Game.coreContext = CoreContext.GAME;
CoreRefs.Init();

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

Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts", "^.*singleton.lua$", "mainmenu/");
if (Game.IsClient()) {
	Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/airship", "^.*controller.lua$");
	Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/controllers", "^.*controller.lua$", "mainmenu/");
	// Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*controller.lua$");
	// Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/mainmenucontrollers", "^.*singleton.lua$");
}
if (Game.IsServer()) {
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/airship", "^.*service.lua$");
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/services", "^.*service.lua$");
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

if (Game.IsClient()) {
	CoreNetwork.ServerToClient.ChatMessage.client.OnServerEvent((message, senderPrefix, senderClientId) => {
		contextbridge.invoke<
			(rawText: string, nameWithPrefix: string | undefined, senderClientId: number | undefined) => void
		>("Chat:AddMessage", LuauContext.Protected, message, senderPrefix, senderClientId);
	});
}

Bootstrap.PrepareVoxelWorld();
Bootstrap.Prepare();
