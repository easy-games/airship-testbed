-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local EntitySpawnEvent = require("Server/TS/Signals/EntitySpawnServerEvent").EntitySpawnEvent
local MoveCommandDataEvent = require("Server/TS/Signals/MoveCommandDataEvent").MoveCommandDataEvent
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local Network = require("Shared/TS/Network").Network
local NetworkBridge = require("Shared/TS/NetworkBridge").NetworkBridge
local Task = require("Shared/TS/Util/Task").Task
local EntityPrefabType = require("Shared/TS/Entity/EntityPrefabType").EntityPrefabType
local EntityCommand = require("Server/TS/Services/Global/Entity/EntityCommand").EntityCommand
local EntityService
do
	EntityService = setmetatable({}, {
		__tostring = function()
			return "EntityService"
		end,
	})
	EntityService.__index = EntityService
	function EntityService.new(...)
		local self = setmetatable({}, EntityService)
		return self:constructor(...) or self
	end
	function EntityService:constructor(invService, chatService)
		self.invService = invService
		self.chatService = chatService
		self.idCounter = 1
		self.entities = {}
		self.loadedEntityPrefabs = {}
		self.chatService:RegisterCommand(EntityCommand.new())
		ServerSignals.MapLoad:connect(function(event)
			local pos = event.LoadedMap:GetMapSpawnPlatform()
			if pos then
				Task:Delay(1, function()
					local _fn = self
					local _exp = EntityPrefabType.HUMAN
					local _position = pos.Position
					local _vector3 = Vector3.new(-3, 2, 3)
					_fn:SpawnEntityForPlayer(nil, _exp, _position + _vector3)
				end)
			end
		end)
	end
	function EntityService:OnStart()
		(Flamework.resolveDependency("Bundles/Server/Services/Global/Player/PlayerService@PlayerService")):ObservePlayers(function(player)
			for _, entity in ObjectUtil.values(self.entities) do
				if TS.instanceof(entity, CharacterEntity) then
					local invDto = entity:GetInventory():Encode()
					Network.ServerToClient.UpdateInventory.Server:FireClient(player.clientId, invDto)
				end
			end
			local _exp = ObjectUtil.values(self.entities)
			local _arg0 = function(e)
				return e:Encode()
			end
			-- ▼ ReadonlyArray.map ▼
			local _newValue = table.create(#_exp)
			for _k, _v in _exp do
				_newValue[_k] = _arg0(_v, _k - 1, _exp)
			end
			-- ▲ ReadonlyArray.map ▲
			local dto = _newValue
			Network.ServerToClient.SpawnEntities.Server:FireClient(player.clientId, dto)
			return function()
				if player.Character then
					self:DespawnEntity(player.Character)
				end
			end
		end)
	end
	function EntityService:SpawnEntityForPlayer(player, entityPrefabType, pos, onDestroyed)
		local id = self.idCounter
		self.idCounter += 1
		local beforeEvent = ServerSignals.BeforeEntitySpawn:fire(id, player, pos or Vector3.new(0, 0, 0))
		-- Spawn character game object
		local entityPrefab
		local _loadedEntityPrefabs = self.loadedEntityPrefabs
		local _entityPrefabType = entityPrefabType
		if _loadedEntityPrefabs[_entityPrefabType] ~= nil then
			local _loadedEntityPrefabs_1 = self.loadedEntityPrefabs
			local _entityPrefabType_1 = entityPrefabType
			entityPrefab = _loadedEntityPrefabs_1[_entityPrefabType_1]
		else
			entityPrefab = AssetBridge:LoadAsset(entityPrefabType)
			if not entityPrefab then
				error("failed to find entity prefab: " .. entityPrefabType)
			end
			local _loadedEntityPrefabs_1 = self.loadedEntityPrefabs
			local _entityPrefabType_1 = entityPrefabType
			local _entityPrefab = entityPrefab
			_loadedEntityPrefabs_1[_entityPrefabType_1] = _entityPrefab
		end
		local entityGO = GameObjectBridge:InstantiateAt(entityPrefab, beforeEvent.spawnPosition, Quaternion.identity)
		entityGO.name = "entity_" .. tostring(id)
		local entityModelGO = entityGO.transform:Find("EntityModel")
		local destroyWatcher = entityGO:AddComponent("DestroyWatcher")
		destroyWatcher:OnDestroyedEvent(function()
			if onDestroyed ~= nil then
				onDestroyed()
			end
		end)
		if player then
			NetworkBridge:SpawnWithClientOwnership(entityGO, player.clientId)
		else
			NetworkBridge:Spawn(entityGO)
		end
		local nob = entityGO:GetComponent("NetworkObject")
		local inv = self.invService:MakeInventory()
		if player then
			self.invService:Subscribe(player.clientId, inv, true)
		end
		local _result = player
		if _result ~= nil then
			_result = _result.clientId
		end
		local entity = CharacterEntity.new(id, nob, _result, inv)
		self.entities[id] = entity
		if player then
			player.Character = entity
		end
		-- Spawn character model
		-- entity.SpawnCharacterModel(characterDef);
		local entityDriver = entityGO:GetComponent("EntityDriver")
		-- Custom move command data handling:
		entityDriver:OnDispatchCustomData(function(tick, customData)
			local allData = customData:Decode()
			for _, data in allData do
				local _result_1 = player
				if _result_1 ~= nil then
					_result_1 = _result_1.clientId
				end
				local _condition = _result_1
				if _condition == nil then
					_condition = -1
				end
				local moveEvent = MoveCommandDataEvent.new(_condition, tick, data.key, data.value)
				ServerSignals.CustomMoveCommand:Fire(moveEvent)
			end
		end)
		ServerSignals.EntitySpawn:Fire(EntitySpawnEvent.new(entity))
		Network.ServerToClient.SpawnEntities.Server:FireAllClients({ entity:Encode() })
		Network.ServerToClient.UpdateInventory.Server:FireAllClients(entity:GetInventory():Encode())
		entity:GetInventory():StartNetworkingDiffs()
		return entity
	end
	function EntityService:DespawnEntity(entity)
		ServerSignals.EntityDespawn:Fire(entity)
		entity:Destroy()
		local _entities = self.entities
		local _id = entity.id
		_entities[_id] = nil
	end
	function EntityService:GetEntityById(entityId)
		local _entities = self.entities
		local _entityId = entityId
		return _entities[_entityId]
	end
	function EntityService:GetEntityByClientId(clientId)
		local _exp = ObjectUtil.values(self.entities)
		local _arg0 = function(e)
			return e.ClientId == clientId
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _exp do
			if _arg0(_v, _i - 1, _exp) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		return _result
	end
	function EntityService:GetEntities()
		return ObjectUtil.values(self.entities)
	end
end
-- (Flamework) EntityService metadata
Reflect.defineMetadata(EntityService, "identifier", "Bundles/Server/Services/Global/Entity/EntityService@EntityService")
Reflect.defineMetadata(EntityService, "flamework:parameters", { "Bundles/Server/Services/Global/Inventory/InventoryService@InventoryService", "Bundles/Server/Services/Global/Chat/ChatService@ChatService" })
Reflect.defineMetadata(EntityService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(EntityService, "$:flamework@Service", Service, { {} })
return {
	EntityService = EntityService,
}
-- ----------------------------------
-- ----------------------------------
