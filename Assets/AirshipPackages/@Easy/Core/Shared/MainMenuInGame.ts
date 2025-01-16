/**
 * Entry point for the Protected Context while in-game.
 * This is ran on both server and client.
 */

import { CoreContext } from "./CoreClientContext";
import { Game } from "./Game";
Game.coreContext = CoreContext.GAME;

import { Flamework } from "@Easy/Core/Shared/Flamework";
import { GameDto } from "../Client/Components/HomePage/API/GamesAPI";
import { AudioManager } from "./Audio/AudioManager";
import { CoreRefs } from "./CoreRefs";
import { InitNet } from "./Network/NetworkAPI";
import { NetworkFunction } from "./Network/NetworkFunction";
import { AirshipUrl } from "./Util/AirshipUrl";
import { AppManager } from "./Util/AppManager";
import { CanvasAPI } from "./Util/CanvasAPI";
import { OnFixedUpdate, OnLateUpdate, OnUpdate } from "./Util/Timer";
import { RetryHttp } from "./Http/HttpRetry";

CoreRefs.Init();

CanvasAPI.Init();
AppManager.Init();
AudioManager.Init();
InitNet();

// Drive timer:
const fullGo = gameObject as GameObject & {
	OnUpdate(callback: () => void): void;
	OnLateUpdate(callback: () => void): void;
	OnFixedUpdate(callback: () => void): void;
};
fullGo.OnUpdate(() => {
	OnUpdate.Fire(Time.deltaTime);
});
fullGo.OnLateUpdate(() => {
	OnLateUpdate.Fire(Time.deltaTime);
});
fullGo.OnFixedUpdate(() => {
	OnFixedUpdate.Fire(Time.fixedDeltaTime);
});

Flamework.AddPath("@easy/core/shared/mainmenu", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*controller.ts$");
Flamework.AddPath("@easy/core/client/protectedcontrollers", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/client/controllers/airship/user/airshipusercontroller", "^.*controller.ts$");
Flamework.AddPath("@easy/core/shared/player/airshipplayerssingleton", "^.*singleton.ts$");
Flamework.AddPath("@easy/core/shared/avatar/airshipavatarsingleton", "^.*singleton.ts$");
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

task.spawn(async () => {
	while (Game.gameId === undefined) {
		task.wait();
		continue;
	}
	const res = await RetryHttp(
		() => InternalHttpManager.GetAsync(AirshipUrl.ContentService + "/games/game-id/" + Game.gameId),
		{ retryKey: "get/content-service/games/game-id/:gameId" }
	);
	if (res.success) {
		// note: this can be undefined but right now we do not handle that case so the type system does not allow it
		const gameData = json.decode<{ game: GameDto /* | undefined */ }>(res.data).game;
		// todo: we should do something here if the game data does not exist
		Game.gameData = gameData;
		Game.onGameDataLoaded.Fire(Game.gameData);
	} else {
		return undefined;
	}
});
