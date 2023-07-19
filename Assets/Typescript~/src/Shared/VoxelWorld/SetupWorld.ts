import { VoxelDataAPI } from "Shared/VoxelWorld/VoxelData/VoxelDataAPI";
import { EntityItemManager } from "../Item/HeldItems/EntityItemManager";
import { PrefabBlockManager } from "./PrefabBlockManager/PrefabBlockManager";
import { World } from "./World";
import { WorldAPI } from "./WorldAPI";
import { ItemUtil } from "../Item/ItemUtil";

export function SetupWorld() {
	if (RunCore.IsClient()) {
		const blockDefines = AssetBridge.LoadAsset<TextAsset>("Shared/Resources/VoxelWorld/BlockDefines.xml");
		WorldAPI.GetMainWorld().LoadEmptyWorld(blockDefines, World.SKYBOX);
	}

	// Setup Managers
	VoxelDataAPI.Init();
	PrefabBlockManager.Get();
	EntityItemManager.Get();
	ItemUtil.Initialize();

	// const world = WorldService.GetWorld();
	// const registry = world.BlockRegistry;

	// let blockCounter = 0;
	// for (const itemType of Object.values(ItemType)) {
	// 	const itemMeta = GetItemMeta(itemType);
	// 	if (!itemMeta.Block) {
	// 		continue;
	// 	}

	// 	// print("Adding block " + itemMeta.ID + " (" + itemMeta.ItemType + ")");
	// 	registry.AddBlock(
	// 		BlockMeta.Make(
	// 			itemMeta.ID,
	// 			itemMeta.Block.TextureSide,
	// 			itemMeta.Block.TextureTop ?? itemMeta.Block.TextureTopBottom ?? itemMeta.Block.TextureSide,
	// 			itemMeta.Block.TextureBottom ?? itemMeta.Block.TextureTopBottom ?? itemMeta.Block.TextureSide,
	// 			"cube",
	// 			"",
	// 		),
	// 	);
	// 	blockCounter++;
	// }
	// print(`Registered ${blockCounter} blocks.`);
	// WorldService.GetWorld().SetReadyToRender(1);
}
