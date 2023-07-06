-- Compiled with unity-ts v2.1.0-75
local AnimationLayer
do
	AnimationLayer = setmetatable({}, {
		__tostring = function()
			return "AnimationLayer"
		end,
	})
	AnimationLayer.__index = AnimationLayer
	function AnimationLayer.new(...)
		local self = setmetatable({}, AnimationLayer)
		return self:constructor(...) or self
	end
	function AnimationLayer:constructor()
	end
	function AnimationLayer:AllocateLayer()
		local layer = self.layerCounter
		self.layerCounter += 1
		return layer
	end
	AnimationLayer.layerCounter = 10
end
return {
	AnimationLayer = AnimationLayer,
}
-- ----------------------------------
-- ----------------------------------
