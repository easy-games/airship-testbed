-- Compiled with unity-ts v2.1.0-75
--[[
	*
	* Set of utilities for working with `CSArray` types.
]]
local CSArrayUtil
do
	CSArrayUtil = setmetatable({}, {
		__tostring = function()
			return "CSArrayUtil"
		end,
	})
	CSArrayUtil.__index = CSArrayUtil
	function CSArrayUtil.new(...)
		local self = setmetatable({}, CSArrayUtil)
		return self:constructor(...) or self
	end
	function CSArrayUtil:constructor()
	end
	function CSArrayUtil:CSArrayToTSArray(array)
		local newArray = {}
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < array.Length) then
					break
				end
				local value = array:GetValue(i)
				table.insert(newArray, value)
			end
		end
		return newArray
	end
end
return {
	CSArrayUtil = CSArrayUtil,
}
-- ----------------------------------
-- ----------------------------------
