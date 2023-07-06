-- Compiled with unity-ts v2.1.0-75
local CancellableEvent = require("Shared/rbxts_include/node_modules/@easy-games/unity-sync-event/out/init").CancellableEvent
local BeforeBlockPlacedSignal
do
	local super = CancellableEvent
	BeforeBlockPlacedSignal = setmetatable({}, {
		__tostring = function()
			return "BeforeBlockPlacedSignal"
		end,
		__index = super,
	})
	BeforeBlockPlacedSignal.__index = BeforeBlockPlacedSignal
	function BeforeBlockPlacedSignal.new(...)
		local self = setmetatable({}, BeforeBlockPlacedSignal)
		return self:constructor(...) or self
	end
	function BeforeBlockPlacedSignal:constructor(pos, itemType, voxel, entity)
		super.constructor(self)
		self.pos = pos
		self.itemType = itemType
		self.voxel = voxel
		self.entity = entity
	end
end
return {
	BeforeBlockPlacedSignal = BeforeBlockPlacedSignal,
}
-- ----------------------------------
-- ----------------------------------
