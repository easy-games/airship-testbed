-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
-- * Default generator spawn rate.
local DEFAULT_SPAWN_RATE = 2
local SetGeneratorSpawnRateCommand
do
	local super = ChatCommand
	SetGeneratorSpawnRateCommand = setmetatable({}, {
		__tostring = function()
			return "SetGeneratorSpawnRateCommand"
		end,
		__index = super,
	})
	SetGeneratorSpawnRateCommand.__index = SetGeneratorSpawnRateCommand
	function SetGeneratorSpawnRateCommand.new(...)
		local self = setmetatable({}, SetGeneratorSpawnRateCommand)
		return self:constructor(...) or self
	end
	function SetGeneratorSpawnRateCommand:constructor()
		super.constructor(self, "setGeneratorSpawnRate")
	end
	function SetGeneratorSpawnRateCommand:Execute(player, args)
		local spawnRate
		local generatorId
		-- If no arguments are provided fallback to defaults.
		if #args == 0 then
			player:SendMessage("Invalid arguments")
			return nil
		end
		-- generator id argument provided, fallback to default spawn rate.
		if #args == 1 then
			generatorId = "generator_" .. args[1]
			spawnRate = DEFAULT_SPAWN_RATE
		end
		-- generator id and spawn rate arguments provided
		if #args == 2 then
			generatorId = "generator_" .. args[1]
			spawnRate = tonumber(args[2])
		end
		if spawnRate == nil or generatorId == nil then
			player:SendMessage("Invalid arguments")
			return nil
		end
		-- Update spawn rate.
		(Flamework.resolveDependency("Bundles/Server/Services/Global/Generator/GeneratorService@GeneratorService")):UpdateGeneratorSpawnRateById(generatorId, spawnRate)
	end
end
return {
	SetGeneratorSpawnRateCommand = SetGeneratorSpawnRateCommand,
}
-- ----------------------------------
-- ----------------------------------
