-- Compiled with unity-ts v2.1.0-75
--[[
	*
	* Set of utilities for working with `Array` types.
]]
local ArrayUtil
do
	ArrayUtil = setmetatable({}, {
		__tostring = function()
			return "ArrayUtil"
		end,
	})
	ArrayUtil.__index = ArrayUtil
	function ArrayUtil.new(...)
		local self = setmetatable({}, ArrayUtil)
		return self:constructor(...) or self
	end
	function ArrayUtil:constructor()
	end
	function ArrayUtil:Combine(arrayA, arrayB)
		local _arrayB = arrayB
		local _arg0 = function(value)
			local _arrayA = arrayA
			local _value = value
			table.insert(_arrayA, _value)
		end
		for _k, _v in _arrayB do
			_arg0(_v, _k - 1, _arrayB)
		end
		return arrayA
	end
end
return {
	ArrayUtil = ArrayUtil,
}
-- ----------------------------------
-- ----------------------------------
