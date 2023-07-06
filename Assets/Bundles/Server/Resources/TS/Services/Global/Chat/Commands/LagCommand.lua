-- Compiled with unity-ts v2.1.0-75
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local LagCommand
do
	local super = ChatCommand
	LagCommand = setmetatable({}, {
		__tostring = function()
			return "LagCommand"
		end,
		__index = super,
	})
	LagCommand.__index = LagCommand
	function LagCommand.new(...)
		local self = setmetatable({}, LagCommand)
		return self:constructor(...) or self
	end
	function LagCommand:constructor()
		super.constructor(self, "lag")
	end
	function LagCommand:Execute(player, args)
		local transportManager = GameObject:Find("Network"):GetComponent("TransportManager")
		if transportManager.LatencySimulator:GetEnabled() and (#args == 0 or string.lower(args[1]) == "off") then
			transportManager.LatencySimulator:SetEnabled(false)
			player:SendMessage("Disabled lag sim.")
			return nil
		end
		local latency = 90
		if #args > 0 then
			local num = tonumber(args[1])
			if num ~= nil then
				latency = num
			end
		end
		player:SendMessage("Enabled lag sim of " .. (tostring(latency) .. "ms"))
		transportManager.LatencySimulator:SetLatency(latency)
		transportManager.LatencySimulator:SetEnabled(true)
	end
end
return {
	LagCommand = LagCommand,
}
-- ----------------------------------
-- ----------------------------------
