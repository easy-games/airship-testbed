-- Compiled with unity-ts v2.1.0-75
local LayerUtil
do
	LayerUtil = setmetatable({}, {
		__tostring = function()
			return "LayerUtil"
		end,
	})
	LayerUtil.__index = LayerUtil
	function LayerUtil.new(...)
		local self = setmetatable({}, LayerUtil)
		return self:constructor(...) or self
	end
	function LayerUtil:constructor()
	end
	function LayerUtil:GetLayerMask(layers)
		local mask = 1
		local _layers = layers
		local _arg0 = function(layerValue)
			mask = bit32.bor(mask, bit32.lshift(1, layerValue))
			return mask
		end
		for _k, _v in _layers do
			_arg0(_v, _k - 1, _layers)
		end
		return mask
	end
	function LayerUtil:LayerIsInMask(layer, layerMask)
		local result = layerMask == (bit32.bor(layerMask, (bit32.lshift(1, layer))))
		return result
	end
end
return {
	LayerUtil = LayerUtil,
}
-- ----------------------------------
-- ----------------------------------
