/**
 * Entry point for the Protected Context while in-game.
 * This is ran on both server and client.
 */

import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import { Flamework } from "@Easy/Core/Shared/Flamework";
import { AudioManager } from "./Audio/AudioManager";
import { CoreContext } from "./CoreClientContext";
import { CoreRefs } from "./CoreRefs";
import { Game } from "./Game";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

const coreCamera = GameObject.Find("CoreCamera");
Object.Destroy(coreCamera);

Game.coreContext = CoreContext.GAME;
CoreRefs.Init();

TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();
AvatarUtil.Initialize();

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

Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts/mainmenu", "^.*singleton.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/protectedcontrollers", "^.*controller.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/client/resources/ts/protectedcontrollers", "^.*singleton.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts/player/playerssingleton", "^.*singleton.lua$");
Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts/input/airshipinputsingleton", "^.*singleton.lua$");

if (Game.IsServer()) {
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/protectedservices", "^.*service.lua$");
}

Flamework.Ignite();

if (Game.IsServer()) {
	const autoShutdownBridge = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>()!;
	if (autoShutdownBridge) {
		autoShutdownBridge.SetBundlesLoaded(true);
	}

	const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
	Game.gameId = serverBootstrap.gameId;
	Game.serverId = serverBootstrap.serverId;
	Game.organizationId = serverBootstrap.organizationId;

	contextbridge.callback<
		(fromContext: LuauContext) => {
			gameId: string;
			serverId: string;
			organizationId: string;
		}
	>("ServerInfo", (from) => {
		return {
			gameId: Game.gameId,
			serverId: Game.serverId,
			organizationId: Game.organizationId,
		};
	});

	serverBootstrap.FinishedSetup();
}
