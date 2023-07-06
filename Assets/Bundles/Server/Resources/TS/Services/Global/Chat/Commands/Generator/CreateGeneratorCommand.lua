-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
-- * Default generator item type.
local DEFAULT_ITEM_TYPE = ItemType.COBBLESTONE
-- * Default generator spawn rate.
local DEFAULT_SPAWN_RATE = 2
-- * Default generator stack limit.
local DEFAULT_GENERATOR_STACK_LIMIT = 50
local CreateGeneratorCommand
do
	local super = ChatCommand
	CreateGeneratorCommand = setmetatable({}, {
		__tostring = function()
			return "CreateGeneratorCommand"
		end,
		__index = super,
	})
	CreateGeneratorCommand.__index = CreateGeneratorCommand
	function CreateGeneratorCommand.new(...)
		local self = setmetatable({}, CreateGeneratorCommand)
		return self:constructor(...) or self
	end
	function CreateGeneratorCommand:constructor()
		super.constructor(self, "createGenerator")
	end
	function CreateGeneratorCommand:Execute(player, args)
		local itemType
		local spawnRate
		-- If no arguments are provided fallback to defaults.
		if #args == 0 then
			itemType = DEFAULT_ITEM_TYPE
			spawnRate = DEFAULT_SPAWN_RATE
		end
		-- ItemType argument provided, fallback to default spawn rate.
		if #args == 1 then
			itemType = args[1]
			spawnRate = DEFAULT_SPAWN_RATE
		end
		-- ItemType and spawn rate arguments provided.
		if #args == 2 then
			itemType = args[1]
			spawnRate = tonumber(args[2])
		end
		-- If no ItemType or spawn rate, return.
		if itemType == nil or spawnRate == nil then
			player:SendMessage("Invalid arguments")
			return nil
		end
		-- Spawn generator underneath command executor.
		local executorEntity = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(player.clientId)
		if not executorEntity then
			return nil
		end
		local generatorPosition = executorEntity.gameObject.transform.position;
		(Flamework.resolveDependency("Bundles/Server/Services/Global/Generator/GeneratorService@GeneratorService")):CreateGenerator(generatorPosition, {
			item = itemType,
			spawnRate = spawnRate,
			stackLimit = DEFAULT_GENERATOR_STACK_LIMIT,
			label = true,
		})
	end
end
return {
	CreateGeneratorCommand = CreateGeneratorCommand,
}
-- ----------------------------------
-- ----------------------------------
