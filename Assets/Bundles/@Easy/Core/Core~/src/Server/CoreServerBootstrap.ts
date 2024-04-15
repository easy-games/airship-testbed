import { Game } from "Shared/Game";

const autoShutdownBridge = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>()!;
if (autoShutdownBridge) {
	autoShutdownBridge.SetBundlesLoaded(true);
}

const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
Game.gameId = serverBootstrap.gameId;
Game.serverId = serverBootstrap.serverId;
Game.organizationId = serverBootstrap.organizationId;

export function SetupServer() {}
