-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local Network = require("Shared/TS/Network").Network
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local _HeldItemManager = require("Shared/TS/Item/HeldItems/HeldItemManager")
local HeldItemManager = _HeldItemManager.HeldItemManager
local HeldItemState = _HeldItemManager.HeldItemState
local EntityItemManager
do
	EntityItemManager = setmetatable({}, {
		__tostring = function()
			return "EntityItemManager"
		end,
	})
	EntityItemManager.__index = EntityItemManager
	function EntityItemManager.new(...)
		local self = setmetatable({}, EntityItemManager)
		return self:constructor(...) or self
	end
	function EntityItemManager:constructor()
		self.entityItems = {}
		self.mouseIsDown = false
		TS.try(function()
			if RunUtil:IsClient() then
				self:InitializeClient()
			elseif RunUtil:IsServer() then
				self:InitializeServer()
			end
		end, function(e)
			error("EntityItemManager ERROR: " .. tostring(e))
		end)
	end
	function EntityItemManager:Get()
		if self.instance == nil then
			self.instance = EntityItemManager.new()
		end
		return self.instance
	end
	function EntityItemManager:Log(message)
		return nil
	end
	function EntityItemManager:InitializeClient()
		-- Listen to mouse inputs
		local _promise = TS.Promise.new(function(resolve)
			resolve(require("Shared/TS/UserInput/init"))
		end)
		local _arg0 = function(userInputRef)
			self:Log("UserInput")
			-- Process Inputs locally
			local mouse = userInputRef.Mouse.new()
			mouse.LeftDown:Connect(function()
				self:Log("LeftDown")
				if CanvasAPI:IsPointerOverUI() then
					return nil
				end
				if self.localEntity then
					self.mouseIsDown = true
					local items = self:GetOrCreateItemManager(self.localEntity)
					items:TriggerNewState(HeldItemState.CALL_TO_ACTION_START)
				end
			end)
			mouse.LeftUp:Connect(function()
				self:Log("LeftUp")
				if not self.mouseIsDown then
					return nil
				end
				self.mouseIsDown = false
				if self.localEntity then
					local items = self:GetOrCreateItemManager(self.localEntity)
					items:TriggerNewState(HeldItemState.CALL_TO_ACTION_END)
				end
			end)
		end
		_promise:andThen(_arg0)
		local _promise_1 = TS.Promise.new(function(resolve)
			resolve(require("Client/TS/ClientSignals"))
		end)
		local _arg0_1 = function(clientSignalRef)
			self:Log("ClientSignals")
			-- Listen to new entities
			clientSignalRef.ClientSignals.EntitySpawn:Connect(function(event)
				self:Log("EntitySpawn: " .. tostring(event.Entity.id))
				if TS.instanceof(event.Entity, CharacterEntity) and event.Entity.id ~= nil then
					-- Create the Item Manager on the Client
					self:GetOrCreateItemManager(event.Entity)
					-- Local Events
					if event.Entity:IsLocalCharacter() then
						self.localEntity = event.Entity
					end
				end
			end)
			-- Clean up destroyed entities
			clientSignalRef.ClientSignals.EntityDespawn:Connect(function(entity)
				self:Log("EntityDespawn: " .. tostring(entity.id))
				if TS.instanceof(entity, CharacterEntity) then
					self:DestroyItemManager(entity)
				end
			end)
			-- Server Events
			Network.ServerToClient.HeldItemStateChanged.Client:OnServerEvent(function(entityId, newState)
				local _entityItems = self.entityItems
				local _entityId = entityId
				local heldItem = _entityItems[_entityId]
				if heldItem then
					heldItem:OnNewState(newState)
				end
			end)
		end
		_promise_1:andThen(_arg0_1)
	end
	function EntityItemManager:InitializeServer()
		self:Log("InitializeServer")
		local _promise = TS.Promise.new(function(resolve)
			resolve(require("Server/TS/ServerSignals"))
		end)
		local _arg0 = function(serverSignalsRef)
			self:Log("serverSignalsRef")
			-- Listen to new entity spawns
			serverSignalsRef.ServerSignals.EntitySpawn:Connect(function(event)
				self:Log("EntitySpawn: " .. tostring(event.Entity.id))
				if (event.Entity) and event.Entity.id ~= nil then
					-- Create the Item Manager on the Server
					self:GetOrCreateItemManager(event.Entity)
				end
			end)
			-- Clean up destroyed entities
			serverSignalsRef.ServerSignals.EntityDespawn:Connect(function(entity)
				self:Log("EntityDespawn: " .. tostring(entity.id))
				if TS.instanceof(entity, CharacterEntity) then
					self:DestroyItemManager(entity)
				end
			end)
			-- Listen to state changes triggered by client
			serverSignalsRef.ServerSignals.CustomMoveCommand:Connect(function(event)
				if event:is("HeldItemState") then
					self:Log("NewState: " .. tostring(event.value.state))
					local _entityItems = self.entityItems
					local _entityId = event.value.entityId
					local heldItem = _entityItems[_entityId]
					if heldItem then
						heldItem:OnNewState(event.value.state)
						Network.ServerToClient.HeldItemStateChanged.Server:FireExcept(event.clientId, event.value.entityId, event.value.state)
					else
						error("Reading custom move command from entity without held items???")
					end
				end
			end)
		end
		_promise:andThen(_arg0)
	end
	function EntityItemManager:GetOrCreateItemManager(entity)
		self:Log("GetOrCreateItemManager: " .. tostring(entity.id))
		local _entityItems = self.entityItems
		local _condition = entity.id
		if _condition == nil then
			_condition = 0
		end
		local items = _entityItems[_condition]
		if items == nil then
			self:Log("New Item: " .. tostring(entity.id))
			items = HeldItemManager.new(entity)
			local _entityItems_1 = self.entityItems
			local _condition_1 = entity.id
			if _condition_1 == nil then
				_condition_1 = 0
			end
			local _items = items
			_entityItems_1[_condition_1] = _items
		end
		self:Log("Returning Item: " .. tostring(items:GetLabel()))
		return items
	end
	function EntityItemManager:DestroyItemManager(entity)
		local _condition = entity.id
		if _condition == nil then
			_condition = 0
		end
		local entityId = _condition
		local _entityItems = self.entityItems
		local _entityId = entityId
		local items = _entityItems[_entityId]
		if items then
			items:OnNewState(HeldItemState.ON_DESTROY)
			local _entityItems_1 = self.entityItems
			local _entityId_1 = entityId
			_entityItems_1[_entityId_1] = nil
		end
	end
end
return {
	EntityItemManager = EntityItemManager,
}
-- ----------------------------------
-- ----------------------------------
