-- Compiled with unity-ts v2.1.0-75
local EntitySpawnClientEvent
do
	EntitySpawnClientEvent = setmetatable({}, {
		__tostring = function()
			return "EntitySpawnClientEvent"
		end,
	})
	EntitySpawnClientEvent.__index = EntitySpawnClientEvent
	function EntitySpawnClientEvent.new(...)
		local self = setmetatable({}, EntitySpawnClientEvent)
		return self:constructor(...) or self
	end
	function EntitySpawnClientEvent:constructor(Entity)
		self.Entity = Entity
	end
end
return {
	EntitySpawnClientEvent = EntitySpawnClientEvent,
}
-- ----------------------------------
-- ----------------------------------
