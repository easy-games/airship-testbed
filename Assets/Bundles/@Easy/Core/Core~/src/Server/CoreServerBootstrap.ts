import { Flamework } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";

const autoShutdownBridge = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>();
if (autoShutdownBridge) {
	autoShutdownBridge.SetBundlesLoaded(true);
}

const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
Game.gameId = serverBootstrap.gameId;
Game.serverId = serverBootstrap.serverId;
Game.organizationId = serverBootstrap.organizationId;

function LoadFlamework() {
	Flamework.AddPath("assets/bundles/@Easy/Core/server/resources/ts/services", "^.*service.lua$");
	Flamework.AddPath("assets/bundles/@Easy/Core/shared/resources/ts/strollers", "^.*.lua$");
	Flamework.Ignite();
}

export function SetupServer() {
	LoadFlamework();
}
