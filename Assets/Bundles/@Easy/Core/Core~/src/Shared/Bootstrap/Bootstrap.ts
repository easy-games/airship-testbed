import { CharacterItemManager } from "Shared/Item/HeldItems/CharacterItemManager";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { World } from "Shared/VoxelWorld/World";

/**
 * @deprecated This should be used by Core only.
 */
export class Bootstrap {
	public static PrepareVoxelWorld(skybox = World.skybox): void {
		// Setup Managers
		BlockDataAPI.Init();
		PrefabBlockManager.Get();
	}

	/**
	 * This is the final prepare method.
	 * Call once you have done the following:
	 * - Register all ItemTypes and ItemHandlers
	 * - Called {@link Bootstrap.PrepareVoxelWorld}
	 */
	public static Prepare(): void {
		ItemUtil.Initialize();
	}

	/**
	 * Call this once your game has completed all setup.
	 */
	public static FinishedSetup(): void {
		if (RunUtil.IsServer()) {
			const autoShutdownBridgeGO = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>()!;
			autoShutdownBridgeGO.SetBundlesLoaded(true);

			const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>()!;
			serverBootstrap.FinishedSetup();
		}
		if (RunUtil.IsClient()) {
			// while (!InstanceFinder.ClientManager.Connection.Authenticated) {
			// 	print("waiting for client to start.");
			// 	task.wait();
			// }
			// CoreNetwork.ClientToServer.Ready.client.FireServer();
		}
	}
}
