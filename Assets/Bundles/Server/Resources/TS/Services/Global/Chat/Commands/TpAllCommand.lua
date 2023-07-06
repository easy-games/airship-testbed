-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local TpAllCommand
do
	local super = ChatCommand
	TpAllCommand = setmetatable({}, {
		__tostring = function()
			return "TpAllCommand"
		end,
		__index = super,
	})
	TpAllCommand.__index = TpAllCommand
	function TpAllCommand.new(...)
		local self = setmetatable({}, TpAllCommand)
		return self:constructor(...) or self
	end
	function TpAllCommand:constructor()
		super.constructor(self, "tpAll")
	end
	function TpAllCommand:Execute(player, args)
		local _pos = player.Character
		if _pos ~= nil then
			_pos = _pos.gameObject.transform.position
		end
		local pos = _pos
		if not pos then
			return nil
		end
		for _, p in (Flamework.resolveDependency("Bundles/Server/Services/Global/Player/PlayerService@PlayerService")):GetPlayers() do
			if p ~= player then
				if p.Character then
					local humanoid = p.Character.gameObject:GetComponent("EntityDriver")
					humanoid:Teleport(pos)
				end
			end
		end
	end
end
return {
	TpAllCommand = TpAllCommand,
}
-- ----------------------------------
-- ----------------------------------
