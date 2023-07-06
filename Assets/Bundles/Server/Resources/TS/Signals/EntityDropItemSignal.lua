-- Compiled with unity-ts v2.1.0-75
local EntityDropItemSignal
do
	EntityDropItemSignal = setmetatable({}, {
		__tostring = function()
			return "EntityDropItemSignal"
		end,
	})
	EntityDropItemSignal.__index = EntityDropItemSignal
	function EntityDropItemSignal.new(...)
		local self = setmetatable({}, EntityDropItemSignal)
		return self:constructor(...) or self
	end
	function EntityDropItemSignal:constructor(Entity, ItemStack, groundItemGO)
		self.Entity = Entity
		self.ItemStack = ItemStack
		self.groundItemGO = groundItemGO
	end
end
return {
	EntityDropItemSignal = EntityDropItemSignal,
}
-- ----------------------------------
-- ----------------------------------
