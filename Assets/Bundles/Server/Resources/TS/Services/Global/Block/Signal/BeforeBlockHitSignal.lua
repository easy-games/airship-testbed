-- Compiled with unity-ts v2.1.0-75
local Cancellable = require("Shared/TS/Util/Cancellable").Cancellable
local BeforeBlockHitSignal
do
	local super = Cancellable
	BeforeBlockHitSignal = setmetatable({}, {
		__tostring = function()
			return "BeforeBlockHitSignal"
		end,
		__index = super,
	})
	BeforeBlockHitSignal.__index = BeforeBlockHitSignal
	function BeforeBlockHitSignal.new(...)
		local self = setmetatable({}, BeforeBlockHitSignal)
		return self:constructor(...) or self
	end
	function BeforeBlockHitSignal:constructor(BlockPos, Player, Damage, ItemInHand)
		super.constructor(self)
		self.BlockPos = BlockPos
		self.Player = Player
		self.Damage = Damage
		self.ItemInHand = ItemInHand
	end
end
return {
	BeforeBlockHitSignal = BeforeBlockHitSignal,
}
-- ----------------------------------
-- ----------------------------------
