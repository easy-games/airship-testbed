/**
 * Entry point for the Protected Context while in-game.
 * This is ran on both server and client.
 */

import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
Game.coreContext = CoreContext.GAME;

import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import { Flamework } from "@Easy/Core/Shared/Flamework";
import { GameDto } from "../Client/Components/HomePage/API/GamesAPI";
import { AudioManager } from "./Audio/AudioManager";
import { CoreRefs } from "./CoreRefs";
import { InitNet } from "./Network/NetworkAPI";
import { NetworkFunction } from "./Network/NetworkFunction";
import { AirshipUrl } from "./Util/AirshipUrl";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";

CoreRefs.Init();

TimeUtil.GetLifetimeSeconds();
CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();
AvatarUtil.Initialize();
InitNet();

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

Flamework.AddPath("@easy/core/shared/mainmenu", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*controller.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/controllers/airship/user/airshipusercontroller", "^.*controller.ts$");
Flamework.AddPath("@easy/core/shared/player/playerssingleton", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/shared/input/airshipinputsingleton", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/shared/protected", "^.*singleton.ts");

if (Game.IsServer()) {
	Flamework.AddPath("@easy/core/server/protectedservices", "^.*service.ts$");
}

Flamework.Ignite();

const serverInfoRemoteFunction = new NetworkFunction<[], [gameId: string, serverId: string, orgId: string]>(
	"Protected_CoreServerInfo",
);

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

if (Game.IsClient()) {
	// This is not working atm. Waiting on stephen to fix remotes in protected context.
	task.spawn(() => {
		const [gameId, serverId, orgId] = serverInfoRemoteFunction.client.FireServer();
		Game.gameId = gameId;
		Game.serverId = serverId;
		Game.organizationId = orgId;
	});

	// This is out temp workaround since above is not working.
	// Protected server -> Game server -> Game client -> Protected client
	contextbridge.subscribe("ProtectedGetServerInfo_Temp", (from, gameId: string, serverId: string, orgId: string) => {
		Game.gameId = gameId;
		Game.serverId = serverId;
		Game.organizationId = orgId;
	});
}

task.spawn(() => {
	while (Game.gameId === undefined) {
		task.wait();
		continue;
	}
	const res = InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games/game-id/" + Game.gameId);
	if (res.success) {
		const gameData = json.decode(res.data) as GameDto;
		Game.gameData = gameData;
		Game.onGameDataLoaded.Fire(Game.gameData);
	} else {
		return undefined;
	}
});
