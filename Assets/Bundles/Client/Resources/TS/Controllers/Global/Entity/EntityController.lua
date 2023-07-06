-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local EntitySpawnClientEvent = require("Client/TS/Signals/EntitySpawnClientEvent").EntitySpawnClientEvent
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local Entity = require("Shared/TS/Entity/Entity").Entity
local EntitySerializer = require("Shared/TS/Entity/EntitySerializer").EntitySerializer
local Inventory = require("Shared/TS/Inventory/Inventory").Inventory
local Network = require("Shared/TS/Network").Network
local WaitForNobId = require("Shared/TS/Util/NetworkUtil").WaitForNobId
local Task = require("Shared/TS/Util/Task").Task
local EntityController
do
	EntityController = setmetatable({}, {
		__tostring = function()
			return "EntityController"
		end,
	})
	EntityController.__index = EntityController
	function EntityController.new(...)
		local self = setmetatable({}, EntityController)
		return self:constructor(...) or self
	end
	function EntityController:constructor(invController, playerController)
		self.invController = invController
		self.playerController = playerController
		self.entities = {}
	end
	function EntityController:OnStart()
		Network.ServerToClient.SpawnEntities.Client:OnServerEvent(function(entityDtos)
			local _entityDtos = entityDtos
			local _arg0 = function(entityDto)
				TS.try(function()
					self:AddEntity(entityDto)
				end, function(err)
					error("[FATAL]: Failed to add entity:" .. tostring(err))
				end)
			end
			for _k, _v in _entityDtos do
				_arg0(_v, _k - 1, _entityDtos)
			end
			print("finished adding entities.")
		end)
		Network.ServerToClient.DespawnEntity.Client:OnServerEvent(function(entityId)
			local entity = self:GetEntityById(entityId)
			if entity then
				self:DespawnEntity(entity)
			end
		end)
		Network.ServerToClient.PlayEntityItemAnimation.Client:OnServerEvent(function(entityId, animationId, playMode)
			local entity = self:GetEntityById(entityId)
			if not entity then
				return nil
			end
			local _result = entity.anim
			if _result ~= nil then
				_result:PlayItemUse(animationId, playMode)
			end
		end)
		Network.ServerToClient.Entity.SetHealth.Client:OnServerEvent(function(entityId, health)
			local entity = self:GetEntityById(entityId)
			if entity then
				entity:SetHealth(health)
			end
		end)
	end
	function EntityController:DespawnEntity(entity)
		entity:Destroy()
		ClientSignals.EntityDespawn:Fire(entity)
		local _entities = self.entities
		local _id = entity.id
		_entities[_id] = nil
		if entity then
			for _, player in self.playerController:GetPlayers() do
				if player.Character == entity then
					player:SetCharacter(nil)
				end
			end
		end
	end
	function EntityController:AddEntity(entityDto)
		local nob = WaitForNobId(entityDto.gameObjectId)
		nob.gameObject.name = "entity_" .. tostring(entityDto.id)
		local entity
		if entityDto.serializer == EntitySerializer.DEFAULT then
			entity = Entity.new(entityDto.id, nob, entityDto.clientId)
		elseif entityDto.serializer == EntitySerializer.CHARACTER then
			local characterEntityDto = entityDto
			local inv = self.invController:GetInventory(characterEntityDto.invId)
			if not inv then
				--[[
					*
					* Inventory hasn't been received by server yet, so we create one on client that will
					* be used in further updates.
				]]
				inv = Inventory.new(characterEntityDto.invId)
				self.invController:RegisterInventory(inv)
			end
			entity = CharacterEntity.new(entityDto.id, nob, entityDto.clientId, inv)
		else
			error("Unable to find entity serializer for dto: " .. tostring(entityDto))
		end
		entity:SetHealth(entityDto.health)
		entity:SetMaxHealth(entityDto.maxHealth)
		local _entities = self.entities
		local _id = entity.id
		local _entity = entity
		_entities[_id] = _entity
		if entity.player then
			if TS.instanceof(entity, CharacterEntity) then
				entity.player:SetCharacter(entity)
			else
				print("Failed to set player character because it wasn't a CharacterEntity.")
			end
		end
		ClientSignals.EntitySpawn:Fire(EntitySpawnClientEvent.new(entity))
		return entity
	end
	function EntityController:GetEntityById(entityId)
		local _entities = self.entities
		local _entityId = entityId
		return _entities[_entityId]
	end
	function EntityController:GetEntityByClientId(clientId)
		local _exp = Object.values(self.entities)
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
	function EntityController:GetEntityByPlayerId(playerId)
		local _exp = Object.values(self.entities)
		local _arg0 = function(e)
			return e.ClientId == playerId
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
	function EntityController:WaitForEntityByPlayerId(playerId)
		local _exp = Object.values(self.entities)
		local _arg0 = function(e)
			return e.ClientId == playerId
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
		local entity = _result
		if entity then
			return entity
		end
		while not entity do
			Task:Wait(0.1)
			local _exp_1 = Object.values(self.entities)
			local _arg0_1 = function(e)
				return e.ClientId == playerId
			end
			-- ▼ ReadonlyArray.find ▼
			local _result_1
			for _i, _v in _exp_1 do
				if _arg0_1(_v, _i - 1, _exp_1) == true then
					_result_1 = _v
					break
				end
			end
			-- ▲ ReadonlyArray.find ▲
			entity = _result_1
		end
		return entity
	end
	function EntityController:GetEntities()
		return Object.values(self.entities)
	end
end
-- (Flamework) EntityController metadata
Reflect.defineMetadata(EntityController, "identifier", "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController")
Reflect.defineMetadata(EntityController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Inventory/InventoryController@InventoryController", "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController" })
Reflect.defineMetadata(EntityController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(EntityController, "$:flamework@Controller", Controller, { {} })
return {
	EntityController = EntityController,
}
-- ----------------------------------
-- ----------------------------------
