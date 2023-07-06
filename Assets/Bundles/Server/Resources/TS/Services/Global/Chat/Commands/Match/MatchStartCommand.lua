-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local Game = require("Shared/TS/Game").Game
local ColorUtil = require("Shared/TS/Util/ColorUtil").ColorUtil
local Task = require("Shared/TS/Util/Task").Task
local Theme = require("Shared/TS/Util/Theme").Theme
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local StartMatchCommand
do
	local super = ChatCommand
	StartMatchCommand = setmetatable({}, {
		__tostring = function()
			return "StartMatchCommand"
		end,
		__index = super,
	})
	StartMatchCommand.__index = StartMatchCommand
	function StartMatchCommand.new(...)
		local self = setmetatable({}, StartMatchCommand)
		return self:constructor(...) or self
	end
	function StartMatchCommand:constructor()
		super.constructor(self, "start")
	end
	function StartMatchCommand:Execute(player, args)
		-- Start match when match is ready.
		Task:Spawn(function()
			(Flamework.resolveDependency("Bundles/Server/Services/Match/MatchService@MatchService")):WaitForMatchReady();
			(Flamework.resolveDependency("Bundles/Server/Services/Match/MatchService@MatchService")):StartMatch()
			Game:BroadcastMessage(ColorUtil:ColoredText(player.username, Theme.Aqua) .. " started the match!")
		end)
	end
end
return {
	StartMatchCommand = StartMatchCommand,
}
-- ----------------------------------
-- ----------------------------------
