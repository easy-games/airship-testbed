-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local inspect = require("Shared/rbxts_include/node_modules/@easy-games/unity-inspect/inspect")
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local Inventory = require("Shared/TS/Inventory/Inventory").Inventory
local Network = require("Shared/TS/Network").Network
local InventoryService
do
	InventoryService = setmetatable({}, {
		__tostring = function()
			return "InventoryService"
		end,
	})
	InventoryService.__index = InventoryService
	function InventoryService.new(...)
		local self = setmetatable({}, InventoryService)
		return self:constructor(...) or self
	end
	function InventoryService:constructor()
		self.inventories = {}
		self.invIdCounter = 1
	end
	function InventoryService:OnStart()
		Network.ClientToServer.SetHeldSlot.Server:OnClientEvent(function(clientId, slot)
			local entity = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(clientId)
			if not entity then
				return nil
			end
			if not (TS.instanceof(entity, CharacterEntity)) then
				return nil
			end
			entity:GetInventory():SetHeldSlot(slot)
			Network.ServerToClient.SetHeldInventorySlot.Server:FireAllClients(entity.id, slot, true)
		end)
		Network.ClientToServer.Inventory.SwapSlots.Server:OnClientEvent(function(clientId, frommInvId, fromSlot, toInvId, toSlot) end)
		Network.ClientToServer.Inventory.QuickMoveSlot.Server:OnClientEvent(function(clientId, fromInvId, fromSlot, toInvId)
			local fromInv = self:GetInventoryFromId(fromInvId)
			if not fromInv then
				return nil
			end
			local toInv = self:GetInventoryFromId(toInvId)
			if not toInv then
				return nil
			end
			local itemStack = fromInv:GetItem(fromSlot)
			if not itemStack then
				return nil
			end
			if fromSlot < fromInv:GetHotbarSlotCount() then
				-- move to backpack
				local completed = false
				-- armor
				local itemMeta = itemStack:GetMeta()
				if not completed then
					if itemMeta.Armor then
						local armorSlot = fromInv.armorSlots[itemMeta.Armor.ArmorType]
						local existingArmor = fromInv:GetItem(armorSlot)
						if existingArmor == nil then
							self:SwapSlots(fromInv, fromSlot, toInv, armorSlot, {
								clientPredicted = true,
							})
							completed = true
						end
					end
				end
				-- find slots to merge
				do
					local i = fromInv:GetHotbarSlotCount()
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < fromInv:GetMaxSlots()) then
							break
						end
						local otherItemStack = fromInv:GetItem(i)
						local _result = otherItemStack
						if _result ~= nil then
							_result = _result:CanMerge(itemStack)
						end
						if _result then
							if otherItemStack:GetAmount() < otherItemStack:GetMaxStackSize() then
								local delta = math.min(itemStack:GetAmount(), otherItemStack:GetMaxStackSize() - otherItemStack:GetAmount())
								otherItemStack:SetAmount(otherItemStack:GetAmount() + delta, {
									noNetwork = true,
								})
								itemStack:Decrement(delta, {
									noNetwork = true,
								})
								if itemStack:IsDestroyed() then
									completed = true
									break
								end
							end
						end
					end
				end
				if not completed then
					-- find empty slot
					do
						local i = fromInv:GetHotbarSlotCount()
						local _shouldIncrement = false
						while true do
							if _shouldIncrement then
								i += 1
							else
								_shouldIncrement = true
							end
							if not (i < fromInv:GetMaxSlots()) then
								break
							end
							if fromInv:GetItem(i) == nil then
								self:SwapSlots(fromInv, fromSlot, toInv, i, {
									clientPredicted = true,
								})
								completed = true
								break
							end
						end
					end
				end
			else
				-- move to hotbar
				local completed = false
				local itemMeta = itemStack:GetMeta()
				if not completed then
					if itemMeta.Armor then
						local armorSlot = fromInv.armorSlots[itemMeta.Armor.ArmorType]
						local existingArmor = fromInv:GetItem(armorSlot)
						if existingArmor == nil then
							self:SwapSlots(fromInv, fromSlot, toInv, armorSlot, {
								clientPredicted = true,
							})
							completed = true
						end
					end
				end
				-- find slots to merge
				do
					local i = 0
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < fromInv:GetHotbarSlotCount()) then
							break
						end
						local otherItemStack = fromInv:GetItem(i)
						local _result = otherItemStack
						if _result ~= nil then
							_result = _result:CanMerge(itemStack)
						end
						if _result then
							if otherItemStack:GetAmount() < otherItemStack:GetMaxStackSize() then
								local delta = math.max(otherItemStack:GetMaxStackSize() - itemStack:GetAmount(), otherItemStack:GetMaxStackSize() - otherItemStack:GetAmount())
								otherItemStack:SetAmount(otherItemStack:GetAmount() + delta, {
									noNetwork = true,
								})
								itemStack:Decrement(delta, {
									noNetwork = true,
								})
								if itemStack:IsDestroyed() then
									completed = true
									break
								end
							end
						end
					end
				end
				if not completed then
					-- find empty slot
					do
						local i = 0
						local _shouldIncrement = false
						while true do
							if _shouldIncrement then
								i += 1
							else
								_shouldIncrement = true
							end
							if not (i < fromInv:GetHotbarSlotCount()) then
								break
							end
							if fromInv:GetItem(i) == nil then
								self:SwapSlots(fromInv, fromSlot, fromInv, i, {
									clientPredicted = true,
								})
								completed = true
								break
							end
						end
					end
				end
			end
		end)
		Network.ClientToServer.Inventory.CheckOutOfSync.Server:OnClientEvent(function(clientId, invDto)
			local entity = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(clientId)
			if not entity then
				error("Entity not found.")
			end
			local serverInvDto = entity:GetInventory():Encode()
			-- print("----- INV SYNC CHECK -----");
			-- ▼ ReadonlyMap.size ▼
			local _size = 0
			for _ in serverInvDto.items do
				_size += 1
			end
			-- ▲ ReadonlyMap.size ▲
			-- ▼ ReadonlyMap.size ▼
			local _size_1 = 0
			for _ in invDto.items do
				_size_1 += 1
			end
			-- ▲ ReadonlyMap.size ▲
			if _size ~= _size_1 then
			end
			do
				local slot = 0
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						slot += 1
					else
						_shouldIncrement = true
					end
					if not (slot < 45) then
						break
					end
					local _items = serverInvDto.items
					local _slot = slot
					local serverItem = _items[_slot]
					local _items_1 = invDto.items
					local _slot_1 = slot
					local clientItem = _items_1[_slot_1]
					if inspect(serverItem) ~= inspect(clientItem) then
					end
				end
			end
			-- print("----- END -----");
		end)
	end
	function InventoryService:SwapSlots(fromInventory, fromSlot, toInventory, toSlot, config)
		local fromItem = fromInventory:GetItem(fromSlot)
		local toItem = toInventory:GetItem(toSlot)
		local _fn = toInventory
		local _exp = toSlot
		local _object = {}
		local _left = "clientPredicted"
		local _result = config
		if _result ~= nil then
			_result = _result.clientPredicted
		end
		_object[_left] = _result
		_fn:SetItem(_exp, fromItem, _object)
		local _fn_1 = fromInventory
		local _exp_1 = fromSlot
		local _object_1 = {}
		local _left_1 = "clientPredicted"
		local _result_1 = config
		if _result_1 ~= nil then
			_result_1 = _result_1.clientPredicted
		end
		_object_1[_left_1] = _result_1
		_fn_1:SetItem(_exp_1, toItem, _object_1)
	end
	function InventoryService:GetInvEntry(inventory)
		local _inventories = self.inventories
		local _id = inventory.Id
		local found = _inventories[_id]
		if found then
			return found
		end
		local entry = {
			Inv = inventory,
			Viewers = {},
			Owners = {},
		}
		local _inventories_1 = self.inventories
		local _id_1 = inventory.Id
		_inventories_1[_id_1] = entry
		return entry
	end
	function InventoryService:GetInventoryFromId(id)
		local _inventories = self.inventories
		local _id = id
		local _result = _inventories[_id]
		if _result ~= nil then
			_result = _result.Inv
		end
		return _result
	end
	function InventoryService:Subscribe(clientId, inventory, owner)
		local entry = self:GetInvEntry(inventory)
		if owner then
			local _owners = entry.Owners
			local _clientId = clientId
			_owners[_clientId] = true
		else
			local _viewers = entry.Viewers
			local _clientId = clientId
			_viewers[_clientId] = true
		end
	end
	function InventoryService:Unsubscribe(clientId, inventory)
		local entry = self:GetInvEntry(inventory)
		local _owners = entry.Owners
		local _clientId = clientId
		_owners[_clientId] = nil
		local _viewers = entry.Viewers
		local _clientId_1 = clientId
		_viewers[_clientId_1] = nil
	end
	function InventoryService:MakeInventory()
		local inv = Inventory.new(self.invIdCounter)
		self.invIdCounter += 1
		return inv
	end
end
-- (Flamework) InventoryService metadata
Reflect.defineMetadata(InventoryService, "identifier", "Bundles/Server/Services/Global/Inventory/InventoryService@InventoryService")
Reflect.defineMetadata(InventoryService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(InventoryService, "$:flamework@Service", Service, { {} })
return {
	InventoryService = InventoryService,
}
-- ----------------------------------
-- ----------------------------------
