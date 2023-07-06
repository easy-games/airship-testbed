-- Compiled with unity-ts v2.1.0-75
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local TeamCommand
do
	local super = ChatCommand
	TeamCommand = setmetatable({}, {
		__tostring = function()
			return "TeamCommand"
		end,
		__index = super,
	})
	TeamCommand.__index = TeamCommand
	function TeamCommand.new(...)
		local self = setmetatable({}, TeamCommand)
		return self:constructor(...) or self
	end
	function TeamCommand:constructor()
		super.constructor(self, "team")
	end
	function TeamCommand:Execute(player, args)
		local team = player:GetTeam()
		if not team then
			player:SendMessage("You are not on a team.")
			return nil
		end
		player:SendMessage("You are on Team [" .. (team.id .. "]"))
	end
end
return {
	TeamCommand = TeamCommand,
}
-- ----------------------------------
-- ----------------------------------
