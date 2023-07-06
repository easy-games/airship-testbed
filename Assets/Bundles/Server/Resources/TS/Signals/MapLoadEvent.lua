-- Compiled with unity-ts v2.1.0-75
local MapLoadEvent
do
	MapLoadEvent = setmetatable({}, {
		__tostring = function()
			return "MapLoadEvent"
		end,
	})
	MapLoadEvent.__index = MapLoadEvent
	function MapLoadEvent.new(...)
		local self = setmetatable({}, MapLoadEvent)
		return self:constructor(...) or self
	end
	function MapLoadEvent:constructor(LoadedMap)
		self.LoadedMap = LoadedMap
	end
end
return {
	MapLoadEvent = MapLoadEvent,
}
-- ----------------------------------
-- ----------------------------------
