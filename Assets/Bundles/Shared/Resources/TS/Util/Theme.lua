-- Compiled with unity-ts v2.1.0-75
local Theme
do
	Theme = setmetatable({}, {
		__tostring = function()
			return "Theme"
		end,
	})
	Theme.__index = Theme
	function Theme.new(...)
		local self = setmetatable({}, Theme)
		return self:constructor(...) or self
	end
	function Theme:constructor()
	end
	Theme.Green = Color.new(0.5, 1, 0.5, 1)
	Theme.Red = Color.new(1, 85 / 255, 85 / 255, 1)
	Theme.Blue = Color.new(0.6, 0.6, 1, 1)
	Theme.Yellow = Color.new(1, 1, 0.39)
	Theme.White = Color.new(1, 1, 1, 1)
	Theme.Black = Color.new(0, 0, 0, 0)
	Theme.Gray = Color.new(0.63, 0.63, 0.63)
	Theme.Aqua = Color.new(86 / 255, 255 / 255, 255 / 255)
end
return {
	Theme = Theme,
}
-- ----------------------------------
-- ----------------------------------
