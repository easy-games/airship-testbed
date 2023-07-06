-- Compiled with unity-ts v2.1.0-75
local PlayerLeaveServerEvent
do
	PlayerLeaveServerEvent = setmetatable({}, {
		__tostring = function()
			return "PlayerLeaveServerEvent"
		end,
	})
	PlayerLeaveServerEvent.__index = PlayerLeaveServerEvent
	function PlayerLeaveServerEvent.new(...)
		local self = setmetatable({}, PlayerLeaveServerEvent)
		return self:constructor(...) or self
	end
	function PlayerLeaveServerEvent:constructor(player)
		self.player = player
	end
end
return {
	PlayerLeaveServerEvent = PlayerLeaveServerEvent,
}
-- ----------------------------------
-- ----------------------------------
