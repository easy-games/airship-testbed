-- Compiled with unity-ts v2.1.0-75
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local TpsCommand
do
	local super = ChatCommand
	TpsCommand = setmetatable({}, {
		__tostring = function()
			return "TpsCommand"
		end,
		__index = super,
	})
	TpsCommand.__index = TpsCommand
	function TpsCommand.new(...)
		local self = setmetatable({}, TpsCommand)
		return self:constructor(...) or self
	end
	function TpsCommand:constructor()
		super.constructor(self, "tps")
	end
	function TpsCommand:Execute(player, args)
		local avg = Bridge:GetAverageFPS()
		local current = Bridge:GetCurrentFPS()
		player:SendMessage("----------------")
		player:SendMessage("Current TPS: " .. tostring(current))
		player:SendMessage("Avg TPS: " .. tostring(avg))
		player:SendMessage("----------------")
	end
end
return {
	TpsCommand = TpsCommand,
}
-- ----------------------------------
-- ----------------------------------
