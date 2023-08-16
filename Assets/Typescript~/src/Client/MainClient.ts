import { Flamework } from "@easy-games/flamework-core";
import { CoreNetwork } from "Imports/Core/Shared/CoreNetwork";
import { InitNet } from "Imports/Core/Shared/Network/NetworkAPI";
import { TimeUtil } from "Imports/Core/Shared/Util/TimeUtil";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Imports/Core/Shared/Util/Timer";
import { SetupWorld } from "Imports/Core/Shared/VoxelWorld/SetupWorld";
import { BedWars } from "./BedWars/BedWars";

function LoadFlamework() {
	Flamework.AddPath("assets/bundles/client/resources/ts/controllers/global", "^.*controller.lua$");
	if (BedWars.IsMatchServer()) {
		Flamework.AddPath("assets/bundles/client/resources/ts/controllers/match", "^.*controller.lua$");
	} else if (BedWars.IsLobbyServer()) {
		Flamework.AddPath("assets/bundles/client/resources/ts/controllers/lobby", "^.*controller.lua$");
	}

	Flamework.Ignite();
	print("sending ready packet!");
	CoreNetwork.ClientToServer.Ready.Client.FireServer();
}

function LoadClient() {
	InitNet();
	SetupWorld();
	LoadFlamework();
}

export function SetupClient() {
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

	// const sceneListener = GameObject.Find("ClientSceneListener").GetComponent<ClientSceneListener>();
	// if (sceneListener.IsGameSceneLoaded) {
	// 	LoadClient();
	// } else {
	// 	sceneListener.OnSceneLoadedEvent((sceneName) => {
	// 		print("loading client...");
	// 		wait();
	// 		LoadClient();
	// 	});
	// }
	print("Loading client...");
	LoadClient();
	print("Finished loading client!");
}
