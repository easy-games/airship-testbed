-- Compiled with unity-ts v2.1.0-75
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local BlockPlaceSignal
do
	BlockPlaceSignal = setmetatable({}, {
		__tostring = function()
			return "BlockPlaceSignal"
		end,
	})
	BlockPlaceSignal.__index = BlockPlaceSignal
	function BlockPlaceSignal.new(...)
		local self = setmetatable({}, BlockPlaceSignal)
		return self:constructor(...) or self
	end
	function BlockPlaceSignal:constructor(pos, itemType, voxel, entity)
		self.pos = pos
		self.itemType = itemType
		self.voxel = voxel
		self.entity = entity
		self.itemMeta = GetItemMeta(itemType)
	end
end
return {
	BlockPlaceSignal = BlockPlaceSignal,
}
-- ----------------------------------
-- ----------------------------------
