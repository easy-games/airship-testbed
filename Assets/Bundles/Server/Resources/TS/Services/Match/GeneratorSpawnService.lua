-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local Task = require("Shared/TS/Util/Task").Task
-- * Generator deny region size.
local DENY_REGION_SIZE = Vector3.new(2, 3, 2)
local GeneratorSpawnService
do
	GeneratorSpawnService = setmetatable({}, {
		__tostring = function()
			return "GeneratorSpawnService"
		end,
	})
	GeneratorSpawnService.__index = GeneratorSpawnService
	function GeneratorSpawnService.new(...)
		local self = setmetatable({}, GeneratorSpawnService)
		return self:constructor(...) or self
	end
	function GeneratorSpawnService:constructor(mapService, generatorService, teamService, denyRegionService)
		self.mapService = mapService
		self.generatorService = generatorService
		self.teamService = teamService
		self.denyRegionService = denyRegionService
		self.teamMap = {}
	end
	function GeneratorSpawnService:OnStart()
		Task:Spawn(function()
			-- Wait map and match started before creating generators.
			self.loadedMap = self.mapService:WaitForMapLoaded()
			ServerSignals.MatchStart:connect(function()
				return self:CreateMapGenerators()
			end)
		end)
	end
	function GeneratorSpawnService:CreateMapGenerators()
		-- Team generators.
		local ironGenerators = self.loadedMap:GetTeamGenerators()
		local _exp = ObjectUtil.keys(ironGenerators)
		local _arg0 = function(teamId)
			local generator = ironGenerators[teamId]
			if not generator then
				return nil
			end
			local generatorId = self.generatorService:CreateGenerator(generator.Position, {
				item = ItemType.IRON,
				spawnRate = 1,
				stackLimit = 100,
				label = false,
				split = {
					splitRange = 30,
				},
			})
			-- Create deny region on generator.
			self.denyRegionService:CreateDenyRegion(MathUtil:FloorVec(generator.Position), DENY_REGION_SIZE)
			-- Add to team map.
			local team = self.teamService:GetTeamById(teamId)
			if not team then
				return nil
			end
			local teamGenerators = self.teamMap[team]
			if teamGenerators then
				table.insert(teamGenerators, generatorId)
			else
				local _teamMap = self.teamMap
				local _arg1 = { generatorId }
				_teamMap[team] = _arg1
			end
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
		-- Map generators.
		local diamondGenerators = self.loadedMap:GetMapDiamondGenerators()
		if diamondGenerators then
			local _arg0_1 = function(mapPosition)
				self.generatorService:CreateGenerator(mapPosition.Position, {
					item = ItemType.DIAMOND,
					spawnRate = 25,
					stackLimit = 6,
					label = true,
				})
				-- Create deny region on generator.
				self.denyRegionService:CreateDenyRegion(MathUtil:FloorVec(mapPosition.Position), DENY_REGION_SIZE)
			end
			for _k, _v in diamondGenerators do
				_arg0_1(_v, _k - 1, diamondGenerators)
			end
		end
		local emeraldGenerators = self.loadedMap:GetMapEmeraldGenerators()
		if emeraldGenerators then
			local _arg0_1 = function(mapPosition)
				self.generatorService:CreateGenerator(mapPosition.Position, {
					item = ItemType.EMERALD,
					spawnRate = 45,
					stackLimit = 3,
					label = true,
				})
				-- Create deny region on generator.
				self.denyRegionService:CreateDenyRegion(MathUtil:FloorVec(mapPosition.Position), DENY_REGION_SIZE)
			end
			for _k, _v in emeraldGenerators do
				_arg0_1(_v, _k - 1, emeraldGenerators)
			end
		end
	end
	function GeneratorSpawnService:RegisterNewGeneratorForTeam(team, generatorId)
		local teamGenerators = self:GetTeamGenerators(team)
		local generator = self.generatorService:GetGeneratorById(generatorId)
		if not generator then
			return nil
		end
		if not teamGenerators then
			local _teamMap = self.teamMap
			local _team = team
			local _arg1 = { generatorId }
			_teamMap[_team] = _arg1
		else
			local _teamMap = self.teamMap
			local _team = team
			local _result = _teamMap[_team]
			if _result ~= nil then
				local _generatorId = generatorId
				table.insert(_result, _generatorId)
			end
		end
	end
	function GeneratorSpawnService:GetTeamGenerators(team)
		local _teamMap = self.teamMap
		local _team = team
		local _result = _teamMap[_team]
		if _result ~= nil then
			local _arg0 = function(id)
				return self.generatorService:GetGeneratorById(id)
			end
			-- ▼ ReadonlyArray.mapFiltered ▼
			local _newValue = {}
			local _length = 0
			for _k, _v in _result do
				local _result_1 = _arg0(_v, _k - 1, _result)
				if _result_1 ~= nil then
					_length += 1
					_newValue[_length] = _result_1
				end
			end
			-- ▲ ReadonlyArray.mapFiltered ▲
			_result = _newValue
		end
		return _result
	end
	function GeneratorSpawnService:GetTeamGeneratorByType(team, generatorDropType)
		local _teamMap = self.teamMap
		local _team = team
		local teamGeneratorsIds = _teamMap[_team]
		if not teamGeneratorsIds then
			return nil
		end
		local _arg0 = function(id)
			return self.generatorService:GetGeneratorById(id)
		end
		-- ▼ ReadonlyArray.mapFiltered ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in teamGeneratorsIds do
			local _result = _arg0(_v, _k - 1, teamGeneratorsIds)
			if _result ~= nil then
				_length += 1
				_newValue[_length] = _result
			end
		end
		-- ▲ ReadonlyArray.mapFiltered ▲
		local _arg0_1 = function(generatorState)
			return generatorState.dto.item == generatorDropType
		end
		-- ▼ ReadonlyArray.filter ▼
		local _newValue_1 = {}
		local _length_1 = 0
		for _k, _v in _newValue do
			if _arg0_1(_v, _k - 1, _newValue) == true then
				_length_1 += 1
				_newValue_1[_length_1] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		local generators = _newValue_1
		return generators
	end
end
-- (Flamework) GeneratorSpawnService metadata
Reflect.defineMetadata(GeneratorSpawnService, "identifier", "Bundles/Server/Services/Match/GeneratorSpawnService@GeneratorSpawnService")
Reflect.defineMetadata(GeneratorSpawnService, "flamework:parameters", { "Bundles/Server/Services/Match/Map/MapService@MapService", "Bundles/Server/Services/Global/Generator/GeneratorService@GeneratorService", "Bundles/Server/Services/Global/Team/TeamService@TeamService", "Bundles/Server/Services/Global/Block/DenyRegionService@DenyRegionService" })
Reflect.defineMetadata(GeneratorSpawnService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(GeneratorSpawnService, "$:flamework@Service", Service, { {} })
return {
	GeneratorSpawnService = GeneratorSpawnService,
}
-- ----------------------------------
-- ----------------------------------
