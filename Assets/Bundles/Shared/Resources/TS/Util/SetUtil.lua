-- Compiled with unity-ts v2.1.0-75
-- eslint-disable @typescript-eslint/no-explicit-any
-- * Set of utilities for modifying and traversing sets.
local SetUtil
do
	SetUtil = setmetatable({}, {
		__tostring = function()
			return "SetUtil"
		end,
	})
	SetUtil.__index = SetUtil
	function SetUtil.new(...)
		local self = setmetatable({}, SetUtil)
		return self:constructor(...) or self
	end
	function SetUtil:constructor()
	end
	function SetUtil:ToArray(set)
		local array = {}
		local _set = set
		local _arg0 = function(value)
			local _value = value
			table.insert(array, _value)
			return #array
		end
		for _v in _set do
			_arg0(_v, _v, _set)
		end
		return array
	end
end
return {
	SetUtil = SetUtil,
}
-- ----------------------------------
-- ----------------------------------
