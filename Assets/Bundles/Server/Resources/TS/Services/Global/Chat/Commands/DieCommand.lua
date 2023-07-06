-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local DieCommand
do
	local super = ChatCommand
	DieCommand = setmetatable({}, {
		__tostring = function()
			return "DieCommand"
		end,
		__index = super,
	})
	DieCommand.__index = DieCommand
	function DieCommand.new(...)
		local self = setmetatable({}, DieCommand)
		return self:constructor(...) or self
	end
	function DieCommand:constructor()
		super.constructor(self, "die")
	end
	function DieCommand:Execute(player, args)
		-- Fetch target entity.
		local target = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(player.clientId)
		-- Handle invalid entity.
		if target == nil then
			player:SendMessage("invalid target")
			return nil
		end
		-- Kill entity.
		(Flamework.resolveDependency("Bundles/Server/Services/Global/Damage/DamageService@DamageService")):InflictDamage(target, math.huge, {
			ignoreCancelled = true,
		})
	end
end
return {
	DieCommand = DieCommand,
}
-- ----------------------------------
-- ----------------------------------
