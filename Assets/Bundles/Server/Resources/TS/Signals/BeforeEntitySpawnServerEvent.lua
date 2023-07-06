-- Compiled with unity-ts v2.1.0-75
local BeforeEntitySpawnServerEvent
do
	BeforeEntitySpawnServerEvent = setmetatable({}, {
		__tostring = function()
			return "BeforeEntitySpawnServerEvent"
		end,
	})
	BeforeEntitySpawnServerEvent.__index = BeforeEntitySpawnServerEvent
	function BeforeEntitySpawnServerEvent.new(...)
		local self = setmetatable({}, BeforeEntitySpawnServerEvent)
		return self:constructor(...) or self
	end
	function BeforeEntitySpawnServerEvent:constructor(entityId, player, spawnPosition)
		self.entityId = entityId
		self.player = player
		self.spawnPosition = spawnPosition
	end
end
return {
	BeforeEntitySpawnServerEvent = BeforeEntitySpawnServerEvent,
}
-- ----------------------------------
-- ----------------------------------
