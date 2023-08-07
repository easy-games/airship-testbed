import { Flamework } from "@easy-games/flamework-core";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Shared/Util/Timer";
import { ServerModTest } from "TestMod/Server/ServerMod";
import { BedWars } from "./BedWars/BedWars";
import { InitNet } from "./Network/NetworkAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { SetupWorld } from "./VoxelWorld/SetupWorld";

print("MainServer!");

const test = new ServerModTest();

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
