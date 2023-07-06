-- Compiled with unity-ts v2.1.0-75
local _ItemDefinitions = require("Shared/TS/Item/ItemDefinitions")
local GetItemMeta = _ItemDefinitions.GetItemMeta
local GetItemTypeFromBlockId = _ItemDefinitions.GetItemTypeFromBlockId
local Block
do
	Block = setmetatable({}, {
		__tostring = function()
			return "Block"
		end,
	})
	Block.__index = Block
	function Block.new(...)
		local self = setmetatable({}, Block)
		return self:constructor(...) or self
	end
	function Block:constructor(voxel, world)
		self.voxel = voxel
		self.world = world
		self.blockId = VoxelWorld:VoxelDataToBlockId(voxel)
		self.itemType = GetItemTypeFromBlockId(self.blockId)
		if self.itemType then
			self.itemMeta = GetItemMeta(self.itemType)
		end
	end
	function Block:IsAir()
		return self.blockId == 0
	end
	function Block:GetBlockDefinition()
		return self.world:GetBlockDefinition(self.blockId)
	end
	function Block:GetAverageColor()
		return self:GetBlockDefinition().averageColor:GetValue(0)
	end
end
return {
	Block = Block,
}
-- ----------------------------------
-- ----------------------------------
