-- Compiled with unity-ts v2.1.0-75
local BlockPlaceClientSignal
do
	BlockPlaceClientSignal = setmetatable({}, {
		__tostring = function()
			return "BlockPlaceClientSignal"
		end,
	})
	BlockPlaceClientSignal.__index = BlockPlaceClientSignal
	function BlockPlaceClientSignal.new(...)
		local self = setmetatable({}, BlockPlaceClientSignal)
		return self:constructor(...) or self
	end
	function BlockPlaceClientSignal:constructor(pos, block, placer)
		self.pos = pos
		self.block = block
		self.placer = placer
	end
end
return {
	BlockPlaceClientSignal = BlockPlaceClientSignal,
}
-- ----------------------------------
-- ----------------------------------
