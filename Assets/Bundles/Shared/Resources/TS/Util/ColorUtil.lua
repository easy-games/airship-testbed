-- Compiled with unity-ts v2.1.0-75
local ColorUtil
do
	ColorUtil = setmetatable({}, {
		__tostring = function()
			return "ColorUtil"
		end,
	})
	ColorUtil.__index = ColorUtil
	function ColorUtil.new(...)
		local self = setmetatable({}, ColorUtil)
		return self:constructor(...) or self
	end
	function ColorUtil:constructor()
	end
	function ColorUtil:ColorToHex(color)
		return string.format("#%X%X%X", math.floor(color.r * 255), math.floor(color.g * 255), math.floor(color.b * 255))
	end
	function ColorUtil:ColoredText(text, color)
		return "<color=" .. (self:ColorToHex(color) .. (">" .. (text .. "</color>")))
	end
end
return {
	ColorUtil = ColorUtil,
}
-- ----------------------------------
-- ----------------------------------
