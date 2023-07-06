-- Compiled with unity-ts v2.1.0-75
local MoveCommandDataEvent
do
	MoveCommandDataEvent = setmetatable({}, {
		__tostring = function()
			return "MoveCommandDataEvent"
		end,
	})
	MoveCommandDataEvent.__index = MoveCommandDataEvent
	function MoveCommandDataEvent.new(...)
		local self = setmetatable({}, MoveCommandDataEvent)
		return self:constructor(...) or self
	end
	function MoveCommandDataEvent:constructor(clientId, tick, key, value)
		self.clientId = clientId
		self.tick = tick
		self.key = key
		self.value = value
	end
	function MoveCommandDataEvent:is(key)
		return key == (self.key)
	end
end
return {
	MoveCommandDataEvent = MoveCommandDataEvent,
}
-- ----------------------------------
-- ----------------------------------
