-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local SetTeamCommand
do
	local super = ChatCommand
	SetTeamCommand = setmetatable({}, {
		__tostring = function()
			return "SetTeamCommand"
		end,
		__index = super,
	})
	SetTeamCommand.__index = SetTeamCommand
	function SetTeamCommand.new(...)
		local self = setmetatable({}, SetTeamCommand)
		return self:constructor(...) or self
	end
	function SetTeamCommand:constructor()
		super.constructor(self, "setTeam")
	end
	function SetTeamCommand:Execute(player, args)
		if #args < 1 then
			player:SendMessage("Invalid arguments.")
		end
		local username = args[1]
		local teamName = args[2]
		-- Validate target player.
		local targetPlayer = (Flamework.resolveDependency("Bundles/Server/Services/Global/Player/PlayerService@PlayerService")):GetPlayerFromUsername(username)
		if not targetPlayer then
			player:SendMessage("Invalid username: " .. username)
			return nil
		end
		-- Validate team.
		local targetTeam = (Flamework.resolveDependency("Bundles/Server/Services/Global/Team/TeamService@TeamService")):GetTeamByName(teamName)
		if not targetTeam then
			player:SendMessage("Invalid team name: " .. teamName)
			return nil
		end
		-- Assign to team.
		targetTeam:AddPlayer(targetPlayer)
	end
end
return {
	SetTeamCommand = SetTeamCommand,
}
-- ----------------------------------
-- ----------------------------------
