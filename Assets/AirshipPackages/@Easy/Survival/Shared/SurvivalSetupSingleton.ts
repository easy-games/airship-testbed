import { Controller, OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { BlockDataAPI } from "./VoxelWorld/BlockData/BlockDataAPI";
import { PrefabBlockManager } from "./VoxelWorld/PrefabBlockManager/PrefabBlockManager";
import { World } from "./VoxelWorld/World";

@Controller({})
@Service({})
export class SurvivalSetupSingleton implements OnStart {
    OnStart(): void {
        this.PrepareVoxelWorld();
        this.Prepare();
    }

    /**
     * @internal
     */
    private PrepareVoxelWorld(skybox = World.skybox): void {
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
    private Prepare(): void {
        ItemUtil.Initialize();
    }

}
