import { Flamework } from "@easy-games/flamework-core";
import { SetupWorld } from "Imports/Core/Shared/VoxelWorld/SetupWorld";
import { BedWars } from "./BedWars/BedWars";

print("MainServer!");

function LoadFlamework() {
	Flamework.AddPath("assets/bundles/server/resources/ts/services/global", "^.*service.lua$");
	if (BedWars.IsMatchServer()) {
		print("[BW]: Starting Match Server...");
		Flamework.AddPath("assets/bundles/server/resources/ts/services/match", "^.*service.lua$");
	} else if (BedWars.IsLobbyServer()) {
		print("[BW]: Starting Lobby Server...");
		Flamework.AddPath("assets/bundles/server/resources/ts/services/lobby", "^.*service.lua$");
	}

	Flamework.Ignite();
}

function LoadServer() {
	SetupWorld();
	LoadFlamework();

	const autoShutdownBridgeGO = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>();
	autoShutdownBridgeGO.SetBundlesLoaded(true);

	const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
	serverBootstrap.FinishedSetup();
}

export function SetupServer() {
	LoadServer();
}
