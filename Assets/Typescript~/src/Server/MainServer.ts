import { Flamework } from "@easy-games/flamework-core";
import { InitNet } from "Imports/Core/Shared/Network/NetworkAPI";
import { TimeUtil } from "Imports/Core/Shared/Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Imports/Core/Shared/Util/Timer";
import { SetupWorld } from "Imports/Core/Shared/VoxelWorld/SetupWorld";
import { BedWars } from "./BedWars/BedWars";

print("MainServer!");

function LoadFlamework() {
	Flamework.addPath("assets/bundles/server/resources/ts/services/global", "^.*service.lua$");
	if (BedWars.IsMatchServer()) {
		Flamework.addPath("assets/bundles/server/resources/ts/services/match", "^.*service.lua$");
	} else if (BedWars.IsLobbyServer()) {
		Flamework.addPath("assets/bundles/server/resources/ts/services/lobby", "^.*service.lua$");
	}

	Flamework.ignite();
}

function LoadServer() {
	InitNet();
	SetupWorld();
	LoadFlamework();

	const autoShutdownBridgeGO = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>();
	autoShutdownBridgeGO.SetBundlesLoaded(true);

	const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
	serverBootstrap.FinishedSetup();
}

export function SetupServer() {
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
	InstanceFinder.TimeManager.OnOnTick(() => {
		OnTick.Fire();
	});

	LoadServer();
}
