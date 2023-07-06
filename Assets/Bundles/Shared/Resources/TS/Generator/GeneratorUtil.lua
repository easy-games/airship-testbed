-- Compiled with unity-ts v2.1.0-75
local GENERATOR_PICKUP_RANGE = require("Shared/TS/Generator/GeneratorMeta").GENERATOR_PICKUP_RANGE
-- * Set of utilities pertaining to generators.
local GeneratorUtil
do
	GeneratorUtil = setmetatable({}, {
		__tostring = function()
			return "GeneratorUtil"
		end,
	})
	GeneratorUtil.__index = GeneratorUtil
	function GeneratorUtil.new(...)
		local self = setmetatable({}, GeneratorUtil)
		return self:constructor(...) or self
	end
	function GeneratorUtil:constructor()
	end
	function GeneratorUtil:CanPickupGeneratorStack(generatorStateDto, entityPosition)
		local generatorPosition = generatorStateDto.pos
		local _entityPosition = entityPosition
		local distFromGenerator = (generatorPosition - _entityPosition).magnitude
		return distFromGenerator <= GENERATOR_PICKUP_RANGE
	end
end
return {
	GeneratorUtil = GeneratorUtil,
}
-- ----------------------------------
-- ----------------------------------
