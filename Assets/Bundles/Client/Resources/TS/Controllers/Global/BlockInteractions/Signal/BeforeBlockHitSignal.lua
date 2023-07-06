-- Compiled with unity-ts v2.1.0-75
local BeforeBlockHitSignal
do
	BeforeBlockHitSignal = setmetatable({}, {
		__tostring = function()
			return "BeforeBlockHitSignal"
		end,
	})
	BeforeBlockHitSignal.__index = BeforeBlockHitSignal
	function BeforeBlockHitSignal.new(...)
		local self = setmetatable({}, BeforeBlockHitSignal)
		return self:constructor(...) or self
	end
	function BeforeBlockHitSignal:constructor(blockPos, block)
		self.blockPos = blockPos
		self.block = block
	end
end
return {
	BeforeBlockHitSignal = BeforeBlockHitSignal,
}
-- ----------------------------------
-- ----------------------------------
