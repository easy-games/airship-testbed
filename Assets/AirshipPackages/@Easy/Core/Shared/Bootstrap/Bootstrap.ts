import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { BlockDataAPI } from "@Easy/Survival/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "@Easy/Survival/Shared/VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { World } from "@Easy/Survival/Shared/VoxelWorld/World";

/**
 * @internal
 */
export class Bootstrap {
	public static PrepareVoxelWorld(skybox = World.skybox): void {
		// Setup Managers
		BlockDataAPI.Init();
		PrefabBlockManager.Get();
		VoxelWorld.chunkSize;
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
}
