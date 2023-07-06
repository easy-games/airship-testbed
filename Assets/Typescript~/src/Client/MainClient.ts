import { Flamework } from "@easy-games/flamework-core";
import { OnFixedUpdate, OnLateUpdate, OnTick, OnUpdate } from "Shared/Util/Timer";
import { BedWars } from "./BedWars/BedWars";
import { Network } from "./Network";
import { InitNet } from "./Network/NetworkAPI";
import { TimeUtil } from "./Util/TimeUtil";
import { SetupWorld } from "./VoxelWorld/SetupWorld";

function LoadFlamework() {
	Flamework.addPath("assets/game/bedwars/bundles/client/resources/ts/controllers/global", "^.*controller.lua$");
	if (BedWars.IsMatchServer()) {
		Flamework.addPath("assets/game/bedwars/bundles/client/resources/ts/controllers/match", "^.*controller.lua$");
	} else if (BedWars.IsLobbyServer()) {
		Flamework.addPath("assets/game/bedwars/bundles/client/resources/ts/controllers/lobby", "^.*controller.lua$");
	}

	Flamework.ignite();
	print("sending ready packet!");
	Network.ClientToServer.Ready.Client.FireServer();
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
