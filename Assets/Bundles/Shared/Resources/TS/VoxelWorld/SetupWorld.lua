-- Compiled with unity-ts v2.1.0-75
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local EntityItemManager = require("Shared/TS/Item/HeldItems/EntityItemManager").EntityItemManager
local PrefabBlockManager = require("Shared/TS/VoxelWorld/PrefabBlockManager/PrefabBlockManager").PrefabBlockManager
local World = require("Shared/TS/VoxelWorld/World").World
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local function SetupWorld()
	if RunCore:IsClient() then
		local blockDefines = AssetBridge:LoadAsset("Shared/Resources/VoxelWorld/BlockDefines.xml")
		WorldAPI:GetMainWorld():LoadEmptyWorld(blockDefines, World.SKYBOX)
	end
	-- Setup Managers
	VoxelDataAPI:Init()
	PrefabBlockManager:Get()
	EntityItemManager:Get()
	-- const world = WorldService.GetWorld();
	-- const registry = world.BlockRegistry;
	-- let blockCounter = 0;
	-- for (const itemType of Object.values(ItemType)) {
	-- const itemMeta = GetItemMeta(itemType);
	-- if (!itemMeta.Block) {
	-- continue;
	-- }
	-- // print("Adding block " + itemMeta.ID + " (" + itemMeta.ItemType + ")");
	-- registry.AddBlock(
	-- BlockMeta.Make(
	-- itemMeta.ID,
	-- itemMeta.Block.TextureSide,
	-- itemMeta.Block.TextureTop ?? itemMeta.Block.TextureTopBottom ?? itemMeta.Block.TextureSide,
	-- itemMeta.Block.TextureBottom ?? itemMeta.Block.TextureTopBottom ?? itemMeta.Block.TextureSide,
	-- "cube",
	-- "",
	-- ),
	-- );
	-- blockCounter++;
	-- }
	-- print(`Registered ${blockCounter} blocks.`);
	-- WorldService.GetWorld().SetReadyToRender(1);
end
return {
	SetupWorld = SetupWorld,
}
-- ----------------------------------
-- ----------------------------------
