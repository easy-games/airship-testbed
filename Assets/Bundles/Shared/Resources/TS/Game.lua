-- Compiled with unity-ts v2.1.0-75
local Network = require("Shared/TS/Network").Network
local Player = require("Shared/TS/Player/Player").Player
local Game
do
	Game = setmetatable({}, {
		__tostring = function()
			return "Game"
		end,
	})
	Game.__index = Game
	function Game.new(...)
		local self = setmetatable({}, Game)
		return self:constructor(...) or self
	end
	function Game:constructor()
	end
	function Game:BroadcastMessage(message)
		if RunCore:IsServer() then
			Network.ServerToClient.ChatMessage.Server:FireAllClients(message)
		else
			Game.LocalPlayer:SendMessage(message)
		end
	end
	Game.LocalPlayer = Player.new(nil, -1, "LocalPlayer", "LocalPlayer", "null")
end
return {
	Game = Game,
}
-- ----------------------------------
-- ----------------------------------
