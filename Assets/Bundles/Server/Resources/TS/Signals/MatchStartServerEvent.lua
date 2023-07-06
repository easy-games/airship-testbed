-- Compiled with unity-ts v2.1.0-75
local MatchStartServerEvent
do
	MatchStartServerEvent = setmetatable({}, {
		__tostring = function()
			return "MatchStartServerEvent"
		end,
	})
	MatchStartServerEvent.__index = MatchStartServerEvent
	function MatchStartServerEvent.new(...)
		local self = setmetatable({}, MatchStartServerEvent)
		return self:constructor(...) or self
	end
	function MatchStartServerEvent:constructor()
	end
end
return {
	MatchStartServerEvent = MatchStartServerEvent,
}
-- ----------------------------------
-- ----------------------------------
