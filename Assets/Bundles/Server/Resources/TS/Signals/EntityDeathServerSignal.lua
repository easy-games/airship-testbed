-- Compiled with unity-ts v2.1.0-75
local EntityDeathServerSignal
do
	EntityDeathServerSignal = setmetatable({}, {
		__tostring = function()
			return "EntityDeathServerSignal"
		end,
	})
	EntityDeathServerSignal.__index = EntityDeathServerSignal
	function EntityDeathServerSignal.new(...)
		local self = setmetatable({}, EntityDeathServerSignal)
		return self:constructor(...) or self
	end
	function EntityDeathServerSignal:constructor(entity, killer, damageEvent, respawnTime)
		self.entity = entity
		self.killer = killer
		self.damageEvent = damageEvent
		self.respawnTime = respawnTime
	end
end
return {
	EntityDeathServerSignal = EntityDeathServerSignal,
}
-- ----------------------------------
-- ----------------------------------
