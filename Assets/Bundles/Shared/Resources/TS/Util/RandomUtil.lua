-- Compiled with unity-ts v2.1.0-75
local RandomUtil
do
	RandomUtil = setmetatable({}, {
		__tostring = function()
			return "RandomUtil"
		end,
	})
	RandomUtil.__index = RandomUtil
	function RandomUtil.new(...)
		local self = setmetatable({}, RandomUtil)
		return self:constructor(...) or self
	end
	function RandomUtil:constructor()
	end
	function RandomUtil:FromArray(array)
		local index = math.random(0, #array - 1)
		return array[index + 1]
	end
end
return {
	RandomUtil = RandomUtil,
}
-- ----------------------------------
-- ----------------------------------
