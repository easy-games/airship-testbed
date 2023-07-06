-- Compiled with unity-ts v2.1.0-75
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local JoinCodeCommand
do
	local super = ChatCommand
	JoinCodeCommand = setmetatable({}, {
		__tostring = function()
			return "JoinCodeCommand"
		end,
		__index = super,
	})
	JoinCodeCommand.__index = JoinCodeCommand
	function JoinCodeCommand.new(...)
		local self = setmetatable({}, JoinCodeCommand)
		return self:constructor(...) or self
	end
	function JoinCodeCommand:constructor()
		super.constructor(self, "joinCode", { "jc" })
	end
	function JoinCodeCommand:Execute(player, args)
		local serverBootstrap = GameObject:Find("ServerBootstrap"):GetComponent("ServerBootstrap")
		local joinCode = serverBootstrap:GetJoinCode()
		player:SendMessage("Join Code: " .. joinCode)
	end
end
return {
	JoinCodeCommand = JoinCodeCommand,
}
-- ----------------------------------
-- ----------------------------------
