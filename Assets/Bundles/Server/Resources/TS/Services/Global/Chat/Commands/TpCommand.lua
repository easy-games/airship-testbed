-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local TpCommand
do
	local super = ChatCommand
	TpCommand = setmetatable({}, {
		__tostring = function()
			return "TpCommand"
		end,
		__index = super,
	})
	TpCommand.__index = TpCommand
	function TpCommand.new(...)
		local self = setmetatable({}, TpCommand)
		return self:constructor(...) or self
	end
	function TpCommand:constructor()
		super.constructor(self, "tp")
	end
	function TpCommand:Execute(player, args)
		if #args ~= 1 then
			player:SendMessage("Invalid usage. /tp <Player>")
			return nil
		end
		local targetPlayer = (Flamework.resolveDependency("Bundles/Server/Services/Global/Player/PlayerService@PlayerService")):GetPlayerFromUsername(args[1])
		if not targetPlayer then
			player:SendMessage("Unable to find player: " .. args[1])
			return nil
		end
		local _pos = targetPlayer.Character
		if _pos ~= nil then
			_pos = _pos.gameObject.transform.position
		end
		local pos = _pos
		if not pos then
			player:SendMessage("Error: " .. targetPlayer.username .. " isn't alive.")
			return nil
		end
		if not player.Character then
			return nil
		end
		local humanoid = player.Character.gameObject:GetComponent("EntityDriver")
		humanoid:Teleport(pos)
	end
end
return {
	TpCommand = TpCommand,
}
-- ----------------------------------
-- ----------------------------------
