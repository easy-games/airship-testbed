-- Compiled with unity-ts v2.1.0-75
local MapPosition
do
	MapPosition = setmetatable({}, {
		__tostring = function()
			return "MapPosition"
		end,
	})
	MapPosition.__index = MapPosition
	function MapPosition.new(...)
		local self = setmetatable({}, MapPosition)
		return self:constructor(...) or self
	end
	function MapPosition:constructor(Position, Rotation)
		self.Position = Position
		self.Rotation = Rotation
	end
end
return {
	MapPosition = MapPosition,
}
-- ----------------------------------
-- ----------------------------------
