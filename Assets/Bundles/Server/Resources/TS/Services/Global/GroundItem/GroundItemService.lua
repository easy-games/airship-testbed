-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local BeforeEntityDropItemSignal = require("Server/TS/Signals/BeforeEntityDropItemSignal").BeforeEntityDropItemSignal
local EntityDropItemSignal = require("Server/TS/Signals/EntityDropItemSignal").EntityDropItemSignal
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local GroundItemUtil = require("Shared/TS/GroundItem/GroundItemUtil").GroundItemUtil
local Network = require("Shared/TS/Network").Network
local NetworkBridge = require("Shared/TS/NetworkBridge").NetworkBridge
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local GroundItemService
do
	GroundItemService = setmetatable({}, {
		__tostring = function()
			return "GroundItemService"
		end,
	})
	GroundItemService.__index = GroundItemService
	function GroundItemService.new(...)
		local self = setmetatable({}, GroundItemService)
		return self:constructor(...) or self
	end
	function GroundItemService:constructor(entityService)
		self.entityService = entityService
		self.groundItems = {}
		self.groundItemPrefab = AssetBridge:LoadAsset("Shared/Resources/Prefabs/GroundItem.prefab")
	end
	function GroundItemService:OnStart()
		Network.ClientToServer.DropItemInHand.Server:OnClientEvent(function(clientId, amount)
			local entity = self.entityService:GetEntityByClientId(clientId)
			local _result = entity
			if _result ~= nil then
				_result = _result:IsAlive()
			end
			local _condition = _result
			if _condition then
				_condition = TS.instanceof(entity, CharacterEntity)
			end
			if _condition then
				local item = entity:GetInventory():GetHeldItem()
				if not item then
					return nil
				end
				local transform = entity.networkObject.gameObject.transform
				local _position = transform.position
				local _vector3 = Vector3.new(0, 1.8, 0)
				local _arg0 = transform.forward * 0.6
				local position = _position + _vector3 + _arg0
				local _forward = transform.forward
				local _vector3_1 = Vector3.new(0, 0.4, 0)
				local force = (_forward + _vector3_1) * 2.9
				local beforeEvent = ServerSignals.BeforeEntityDropItem:Fire(BeforeEntityDropItemSignal.new(entity, item, force))
				if beforeEvent:IsCancelled() then
					return nil
				end
				item:Decrement(1)
				local newItem = item:Clone()
				newItem:SetAmount(1)
				local groundItemGO = self:SpawnGroundItem(newItem, position, force)
				ServerSignals.EntityDropItem:Fire(EntityDropItemSignal.new(entity, item, groundItemGO))
			end
		end)
		Network.ClientToServer.PickupGroundItem.Server:OnClientEvent(function(clientId, groundItemId)
			local _groundItems = self.groundItems
			local _groundItemId = groundItemId
			local groundItemEntry = _groundItems[_groundItemId]
			if not groundItemEntry then
				return nil
			end
			local entity = self.entityService:GetEntityByClientId(clientId)
			local _result = entity
			if _result ~= nil then
				_result = _result:IsAlive()
			end
			if not _result then
				return nil
			end
			if not GroundItemUtil:CanPickupGroundItem(groundItemEntry.itemStack, groundItemEntry.nob, entity.networkObject.gameObject.transform.position) then
				return nil
			end
			local groundObjectAttributes = groundItemEntry.nob.gameObject:GetComponent("EasyAttributes")
			local generatorId = groundObjectAttributes:GetString("generatorId")
			if generatorId ~= "" and generatorId then
				ServerSignals.GeneratorItemPickedUp:Fire({
					pickupEntity = entity,
					generatorId = generatorId,
				})
			end
			ServerSignals.EntityPickupItem:Fire({
				entity = entity,
				itemStack = groundItemEntry.itemStack,
				groundItemGO = groundItemEntry.nob.gameObject,
			})
			local _groundItems_1 = self.groundItems
			local _objectId = groundItemEntry.nob.ObjectId
			_groundItems_1[_objectId] = nil
			NetworkBridge:Despawn(groundItemEntry.nob.gameObject)
			if TS.instanceof(entity, CharacterEntity) then
				entity:GetInventory():AddItem(groundItemEntry.itemStack)
			end
			Network.ServerToClient.EntityPickedUpGroundItem.Server:FireAllClients(entity.id, groundItemEntry.itemStack:GetItemType())
		end);
		(Flamework.resolveDependency("Bundles/Server/Services/Global/Player/PlayerService@PlayerService")):ObservePlayers(function(player)
			print("GroundItemService")
			for _k, _v in self.groundItems do
				local pair = { _k, _v }
				Network.ServerToClient.AddGroundItem.Server:FireClient(player.clientId, pair[1], pair[2].itemStack:Encode())
			end
		end)
	end
	function GroundItemService:SpawnGroundItem(itemStack, pos, impulse, generatorId)
		if impulse == nil then
			impulse = Vector3.new(0, 1, 0)
		end
		local groundItemGO = GameObjectBridge:InstantiateAt(self.groundItemPrefab, pos, Quaternion.identity)
		local nob = groundItemGO:GetComponent("NetworkObject")
		local attributes = groundItemGO:GetComponent("EasyAttributes")
		if not (generatorId ~= "" and generatorId) then
			attributes:SetAttribute("pickupTime", TimeUtil:GetServerTime() + 1.5)
		else
			attributes:SetAttribute("generatorId", generatorId)
		end
		NetworkBridge:Spawn(groundItemGO)
		local _groundItems = self.groundItems
		local _objectId = nob.ObjectId
		local _arg1 = {
			nob = nob,
			itemStack = itemStack,
		}
		_groundItems[_objectId] = _arg1;
		-- enable for server
		(groundItemGO:GetComponent("MeshRenderer")).enabled = true
		local rb = groundItemGO:GetComponent("Rigidbody")
		rb:AddForce(impulse, 1)
		Network.ServerToClient.AddGroundItem.Server:FireAllClients(nob.ObjectId, itemStack:Encode())
		return groundItemGO
	end
end
-- (Flamework) GroundItemService metadata
Reflect.defineMetadata(GroundItemService, "identifier", "Bundles/Server/Services/Global/GroundItem/GroundItemService@GroundItemService")
Reflect.defineMetadata(GroundItemService, "flamework:parameters", { "Bundles/Server/Services/Global/Entity/EntityService@EntityService" })
Reflect.defineMetadata(GroundItemService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(GroundItemService, "$:flamework@Service", Service, { {} })
return {
	GroundItemService = GroundItemService,
}
-- ----------------------------------
-- ----------------------------------
