-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local EntityPrefabType = require("Shared/TS/Entity/EntityPrefabType").EntityPrefabType
local MatchState = require("Shared/TS/Match/MatchState").MatchState
local Task = require("Shared/TS/Util/Task").Task
-- * How high above center of map spawn platform should spawn.
local SPAWN_PLATFORM_HEIGHT_OFFSET = Vector3.new(0, 80, 0)
local PreGameService
do
	PreGameService = setmetatable({}, {
		__tostring = function()
			return "PreGameService"
		end,
	})
	PreGameService.__index = PreGameService
	function PreGameService.new(...)
		local self = setmetatable({}, PreGameService)
		return self:constructor(...) or self
	end
	function PreGameService:constructor(matchService)
		self.matchService = matchService
		self.mapCenter = Vector3.new(0, 0, 0)
	end
	function PreGameService:OnStart()
		Task:Spawn(function()
			self.loadedMap = (Flamework.resolveDependency("Bundles/Server/Services/Match/Map/MapService@MapService")):WaitForMapLoaded()
			self.spawnPosition = self.loadedMap:GetMapSpawnPlatform()
			local _result = self.loadedMap:GetMapCenter()
			if _result ~= nil then
				_result = _result.Position
			end
			local _condition = _result
			if _condition == nil then
				_condition = Vector3.new(0, 0, 0)
			end
			self.mapCenter = _condition
			self:CreateSpawnPlatform(self.spawnPosition)
		end)
		ServerSignals.EntityDeath:Connect(function(event)
			Task:Delay(0, function()
				if self.matchService:GetState() == MatchState.PRE and event.entity.player then
					(Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):SpawnEntityForPlayer(event.entity.player, EntityPrefabType.HUMAN)
				end
			end)
		end)
		ServerSignals.BeforeEntitySpawn:connect(function(event)
			if self.matchService:GetState() == MatchState.PRE and event.player then
				local _result = self.loadedMap
				if _result ~= nil then
					_result = _result:GetMapSpawnPlatform()
					if _result ~= nil then
						local _position = _result.Position
						local _vector3 = Vector3.new(0, 0.2, 0)
						_result = _position + _vector3
					end
				end
				local _condition = _result
				if _condition == nil then
					_condition = Vector3.new(0, 20, 0)
				end
				event.spawnPosition = _condition
			end
		end)
	end
	function PreGameService:CreateSpawnPlatform(spawnPlatformPosition)
		local camera = Camera.main
		if not camera then
			return nil
		end
		local pos = Vector3.new(50, 50, 50)
		if spawnPlatformPosition then
			local _position = spawnPlatformPosition.Position
			local _vector3 = Vector3.new(-20, 20, -20)
			pos = _position + _vector3
			camera.transform.position = pos
			camera.transform:LookAt(self.mapCenter)
		end
	end
end
-- (Flamework) PreGameService metadata
Reflect.defineMetadata(PreGameService, "identifier", "Bundles/Server/Services/Match/PreGameService@PreGameService")
Reflect.defineMetadata(PreGameService, "flamework:parameters", { "Bundles/Server/Services/Match/MatchService@MatchService" })
Reflect.defineMetadata(PreGameService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(PreGameService, "$:flamework@Service", Service, { {} })
return {
	PreGameService = PreGameService,
}
-- ----------------------------------
-- ----------------------------------
