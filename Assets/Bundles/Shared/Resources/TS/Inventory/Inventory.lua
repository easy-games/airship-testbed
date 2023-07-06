-- Compiled with unity-ts v2.1.0-75
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ArmorType = require("Shared/TS/Item/ArmorType").ArmorType
local Network = require("Shared/TS/Network").Network
local Bin = require("Shared/TS/Util/Bin").Bin
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local Inventory
do
	Inventory = setmetatable({}, {
		__tostring = function()
			return "Inventory"
		end,
	})
	Inventory.__index = Inventory
	function Inventory.new(...)
		local self = setmetatable({}, Inventory)
		return self:constructor(...) or self
	end
	function Inventory:constructor(id)
		self.items = {}
		self.heldSlot = 0
		self.maxSlots = 46
		self.hotbarSlots = 9
		self.armorSlots = {
			[ArmorType.CHESTPLATE] = 45,
			[ArmorType.HELMET] = 46,
			[ArmorType.BOOTS] = 47,
		}
		self.SlotChanged = Signal.new()
		self.HeldSlotChanged = Signal.new()
		self.Changed = Signal.new()
		self.finishedInitialReplication = false
		self.slotConnections = {}
		self.Id = id
	end
	function Inventory:GetItem(slot)
		local _items = self.items
		local _slot = slot
		return _items[_slot]
	end
	function Inventory:GetSlot(itemStack)
		for _k, _v in self.items do
			local pair = { _k, _v }
			if pair[2] == itemStack then
				return pair[1]
			end
		end
		return nil
	end
	function Inventory:ObserveHeldItem(callback)
		local bin = Bin.new()
		local _items = self.items
		local _heldSlot = self.heldSlot
		local currentItemStack = _items[_heldSlot]
		local cleanup = callback(currentItemStack)
		bin:Add(self.HeldSlotChanged:Connect(function(newSlot)
			local _items_1 = self.items
			local _newSlot = newSlot
			local selected = _items_1[_newSlot]
			local _result = selected
			if _result ~= nil then
				_result = _result:GetItemType()
			end
			local _result_1 = currentItemStack
			if _result_1 ~= nil then
				_result_1 = _result_1:GetItemType()
			end
			if _result == _result_1 then
				return nil
			end
			if cleanup ~= nil then
				cleanup()
			end
			currentItemStack = selected
			cleanup = callback(selected)
		end))
		bin:Add(self.SlotChanged:Connect(function(slot, itemStack)
			if slot == self.heldSlot then
				local _result = itemStack
				if _result ~= nil then
					_result = _result:GetItemType()
				end
				local _result_1 = currentItemStack
				if _result_1 ~= nil then
					_result_1 = _result_1:GetItemType()
				end
				if _result == _result_1 then
					return nil
				end
				if cleanup ~= nil then
					cleanup()
				end
				currentItemStack = itemStack
				cleanup = callback(itemStack)
			end
		end))
		bin:Add(function()
			local _result = cleanup
			if _result ~= nil then
				_result()
			end
		end)
		return bin
	end
	function Inventory:SetItem(slot, itemStack, config)
		local _slotConnections = self.slotConnections
		local _slot = slot
		local _result = _slotConnections[_slot]
		if _result ~= nil then
			_result:Clean()
		end
		local _slotConnections_1 = self.slotConnections
		local _slot_1 = slot
		_slotConnections_1[_slot_1] = nil
		if itemStack then
			local _items = self.items
			local _slot_2 = slot
			local _itemStack = itemStack
			_items[_slot_2] = _itemStack
		else
			local _items = self.items
			local _slot_2 = slot
			_items[_slot_2] = nil
		end
		if itemStack then
			local bin = Bin.new()
			bin:Add(itemStack.Destroyed:Connect(function()
				self:SetItem(slot, nil)
				self.Changed:Fire()
			end))
			bin:Add(itemStack.Changed:Connect(function()
				self.Changed:Fire()
			end))
			local _slotConnections_2 = self.slotConnections
			local _slot_2 = slot
			_slotConnections_2[_slot_2] = bin
			if RunUtil:IsServer() then
				bin:Add(itemStack.AmountChanged:Connect(function(e)
					if e.NoNetwork then
						return nil
					end
					Network.ServerToClient.UpdateInventorySlot.Server:FireAllClients(self.Id, slot, nil, e.Amount)
				end))
				bin:Add(itemStack.ItemTypeChanged:Connect(function(e)
					if e.NoNetwork then
						return nil
					end
					Network.ServerToClient.UpdateInventorySlot.Server:FireAllClients(self.Id, slot, e.ItemType, nil)
				end))
			end
		end
		self.SlotChanged:Fire(slot, itemStack)
		self.Changed:Fire()
		if RunUtil:IsServer() and self.finishedInitialReplication then
			-- todo: figure out which clients to include
			local _fn = Network.ServerToClient.SetInventorySlot.Server
			local _exp = self.Id
			local _exp_1 = slot
			local _result_1 = itemStack
			if _result_1 ~= nil then
				_result_1 = _result_1:Encode()
			end
			local _result_2 = config
			if _result_2 ~= nil then
				_result_2 = _result_2.clientPredicted
			end
			local _condition = _result_2
			if _condition == nil then
				_condition = false
			end
			_fn:FireAllClients(_exp, _exp_1, _result_1, _condition)
		end
	end
	function Inventory:Decrement(itemType, amount)
		local counter = 0
		for slot, itemStack in self.items do
			if itemStack:GetItemType() == itemType then
				local remaining = amount - counter
				if itemStack:GetAmount() > remaining then
					itemStack:SetAmount(itemStack:GetAmount() - remaining)
					break
				else
					counter += itemStack:GetAmount()
					itemStack:Destroy()
				end
			end
		end
	end
	function Inventory:StartNetworkingDiffs()
		self.finishedInitialReplication = true
	end
	function Inventory:AddItem(itemStack)
		-- Merge with existing
		for otherId, otherItem in self.items do
			if itemStack:CanMerge(otherItem) then
				otherItem:SetAmount(otherItem:GetAmount() + itemStack:GetAmount())
				itemStack:Destroy()
				return true
			end
		end
		local openSlot = self:GetFirstOpenSlot()
		if openSlot == -1 then
			return false
		end
		self:SetItem(openSlot, itemStack)
		return true
	end
	function Inventory:GetFirstOpenSlot()
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < self.maxSlots) then
					break
				end
				local _items = self.items
				local _i = i
				if not (_items[_i] ~= nil) then
					return i
				end
			end
		end
		return -1
	end
	function Inventory:GetHeldItem()
		return self:GetItem(self.heldSlot)
	end
	function Inventory:GetSelectedSlot()
		return self.heldSlot
	end
	function Inventory:SetHeldSlot(slot)
		self.heldSlot = slot
		self.HeldSlotChanged:Fire(slot)
		local itemStack = self:GetHeldItem()
	end
	function Inventory:Encode()
		local mappedItems = {}
		for _k, _v in self.items do
			local item = { _k, _v }
			local _mappedItems = mappedItems
			local _arg0 = item[1]
			local _arg1 = item[2]:Encode()
			_mappedItems[_arg0] = _arg1
		end
		return {
			id = self.Id,
			items = mappedItems,
			heldSlot = self.heldSlot,
		}
	end
	function Inventory:ProcessDto(dto)
		for _k, _v in dto.items do
			local pair = { _k, _v }
			self:SetItem(pair[1], ItemStack:Decode(pair[2]))
		end
		self:SetHeldSlot(dto.heldSlot)
	end
	function Inventory:HasEnough(itemType, amount)
		local total = 0
		for _, itemStack in Object.values(self.items) do
			if itemStack:GetItemType() == itemType then
				total += itemStack:GetAmount()
			end
		end
		return total >= amount
	end
	function Inventory:HasItemType(itemType)
		return self:HasEnough(itemType, 1)
	end
	function Inventory:GetPairs()
		return Object.entries(self.items)
	end
	function Inventory:GetMaxSlots()
		return self.maxSlots
	end
	function Inventory:GetBackpackTileCount()
		return self.maxSlots - 9
	end
	function Inventory:GetHotbarSlotCount()
		return self.hotbarSlots
	end
end
return {
	Inventory = Inventory,
}
-- ----------------------------------
-- ----------------------------------
