-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local DamageCommand
do
	local super = ChatCommand
	DamageCommand = setmetatable({}, {
		__tostring = function()
			return "DamageCommand"
		end,
		__index = super,
	})
	DamageCommand.__index = DamageCommand
	function DamageCommand.new(...)
		local self = setmetatable({}, DamageCommand)
		return self:constructor(...) or self
	end
	function DamageCommand:constructor()
		super.constructor(self, "damage")
	end
	function DamageCommand:Execute(player, args)
		local amount
		local target
		if #args == 1 then
			amount = tonumber(args[1])
			target = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(player.clientId)
		end
		if amount == nil then
			player:SendMessage("invalid amount: " .. tostring(amount))
			return nil
		end
		if target == nil then
			player:SendMessage("invalid target")
			return nil
		end
		(Flamework.resolveDependency("Bundles/Server/Services/Global/Damage/DamageService@DamageService")):InflictDamage(target, amount, {
			ignoreCancelled = true,
		})
		player:SendMessage("Inflicted " .. (tostring(amount) .. (" dmg to " .. tostring(target.id))))
	end
end
return {
	DamageCommand = DamageCommand,
}
-- ----------------------------------
-- ----------------------------------
