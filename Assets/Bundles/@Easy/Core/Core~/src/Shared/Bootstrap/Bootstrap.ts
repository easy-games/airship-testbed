import { CoreNetwork } from "Shared/CoreNetwork";
import { EntityItemManager } from "Shared/Item/HeldItems/EntityItemManager";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { RunUtil } from "Shared/Util/RunUtil";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { World } from "Shared/VoxelWorld/World";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

/**
 * @deprecated This should be used by Core only.
 */
export class Bootstrap {
	public static PrepareVoxelWorld(skybox = World.skybox): void {
		if (RunCore.IsClient()) {
			WorldAPI.GetMainWorld()?.LoadEmptyWorld(skybox);
		}

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
		EntityItemManager.Get();
		ItemUtil.Initialize();
	}

	/**
	 * Call this once your game has completed all setup.
	 */
	public static FinishedSetup(): void {
		if (RunUtil.IsServer()) {
			const autoShutdownBridgeGO = GameObject.Find("AutoShutdownBridge").GetComponent<AutoShutdownBridge>();
			autoShutdownBridgeGO.SetBundlesLoaded(true);

			const serverBootstrap = GameObject.Find("ServerBootstrap").GetComponent<ServerBootstrap>();
			serverBootstrap.FinishedSetup();
		} else if (RunUtil.IsClient()) {
			CoreNetwork.ClientToServer.Ready.client.FireServer();
		}
	}
}
