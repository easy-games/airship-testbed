-- Compiled with unity-ts v2.1.0-75
local PlayerJoinServerEvent
do
	PlayerJoinServerEvent = setmetatable({}, {
		__tostring = function()
			return "PlayerJoinServerEvent"
		end,
	})
	PlayerJoinServerEvent.__index = PlayerJoinServerEvent
	function PlayerJoinServerEvent.new(...)
		local self = setmetatable({}, PlayerJoinServerEvent)
		return self:constructor(...) or self
	end
	function PlayerJoinServerEvent:constructor(player)
		self.player = player
	end
end
return {
	PlayerJoinServerEvent = PlayerJoinServerEvent,
}
-- ----------------------------------
-- ----------------------------------
