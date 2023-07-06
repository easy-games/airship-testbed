-- Compiled with unity-ts v2.1.0-75
local Cancellable = require("Shared/TS/Util/Cancellable").Cancellable
local BeforeEntityDropItemSignal
do
	local super = Cancellable
	BeforeEntityDropItemSignal = setmetatable({}, {
		__tostring = function()
			return "BeforeEntityDropItemSignal"
		end,
		__index = super,
	})
	BeforeEntityDropItemSignal.__index = BeforeEntityDropItemSignal
	function BeforeEntityDropItemSignal.new(...)
		local self = setmetatable({}, BeforeEntityDropItemSignal)
		return self:constructor(...) or self
	end
	function BeforeEntityDropItemSignal:constructor(Entity, ItemStack, Force)
		super.constructor(self)
		self.Entity = Entity
		self.ItemStack = ItemStack
		self.Force = Force
	end
end
return {
	BeforeEntityDropItemSignal = BeforeEntityDropItemSignal,
}
-- ----------------------------------
-- ----------------------------------
