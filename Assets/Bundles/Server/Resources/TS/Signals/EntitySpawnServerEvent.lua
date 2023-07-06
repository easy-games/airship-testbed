-- Compiled with unity-ts v2.1.0-75
local EntitySpawnEvent
do
	EntitySpawnEvent = setmetatable({}, {
		__tostring = function()
			return "EntitySpawnEvent"
		end,
	})
	EntitySpawnEvent.__index = EntitySpawnEvent
	function EntitySpawnEvent.new(...)
		local self = setmetatable({}, EntitySpawnEvent)
		return self:constructor(...) or self
	end
	function EntitySpawnEvent:constructor(Entity)
		self.Entity = Entity
	end
end
return {
	EntitySpawnEvent = EntitySpawnEvent,
}
-- ----------------------------------
-- ----------------------------------
