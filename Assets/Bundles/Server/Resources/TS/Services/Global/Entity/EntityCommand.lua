-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local EntityPrefabType = require("Shared/TS/Entity/EntityPrefabType").EntityPrefabType
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local EntityCommand
do
	local super = ChatCommand
	EntityCommand = setmetatable({}, {
		__tostring = function()
			return "EntityCommand"
		end,
		__index = super,
	})
	EntityCommand.__index = EntityCommand
	function EntityCommand.new(...)
		local self = setmetatable({}, EntityCommand)
		return self:constructor(...) or self
	end
	function EntityCommand:constructor()
		super.constructor(self, "entity", { "e" })
	end
	function EntityCommand:Execute(player, args)
		local entityService = Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")
		if not player.Character then
			return nil
		end
		local pos = player.Character.gameObject.transform.position
		entityService:SpawnEntityForPlayer(nil, EntityPrefabType.HUMAN, pos)
	end
end
return {
	EntityCommand = EntityCommand,
}
-- ----------------------------------
-- ----------------------------------
