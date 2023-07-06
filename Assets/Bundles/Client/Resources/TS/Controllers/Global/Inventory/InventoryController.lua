-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local Game = require("Shared/TS/Game").Game
local Inventory = require("Shared/TS/Inventory/Inventory").Inventory
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local Network = require("Shared/TS/Network").Network
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local InventoryController
do
	InventoryController = setmetatable({}, {
		__tostring = function()
			return "InventoryController"
		end,
	})
	InventoryController.__index = InventoryController
	function InventoryController.new(...)
		local self = setmetatable({}, InventoryController)
		return self:constructor(...) or self
	end
	function InventoryController:constructor()
		self.inventories = {}
		self.HeldSlotChanged = Signal.new()
		self.LocalInventoryAdded = Signal.new()
	end
	function InventoryController:OnStart()
		Network.ServerToClient.UpdateInventory.Client:OnServerEvent(function(dto)
			local inv = self:GetInventory(dto.id)
			if not inv then
				inv = Inventory.new(dto.id)
				local _inventories = self.inventories
				local _id = dto.id
				local _inv = inv
				_inventories[_id] = _inv
			end
			inv:ProcessDto(dto)
		end)
		Network.ServerToClient.SetInventorySlot.Client:OnServerEvent(function(invId, slot, itemStackDto, clientPredicted)
			local inv = self:GetInventory(invId)
			if not inv then
				return nil
			end
			if self.LocalInventory == inv and clientPredicted then
				return nil
			end
			local itemStack = if itemStackDto ~= nil then ItemStack:Decode(itemStackDto) else nil
			inv:SetItem(slot, itemStack)
		end)
		Network.ServerToClient.UpdateInventorySlot.Client:OnServerEvent(function(invId, slot, itemType, amount)
			local inv = self:GetInventory(invId)
			if not inv then
				return nil
			end
			local itemStack = inv:GetItem(slot)
			if itemStack == nil then
				return nil
			end
			if itemType ~= nil then
				itemStack:SetItemType(itemType)
			end
			if amount ~= nil then
				itemStack:SetAmount(amount)
			end
		end)
		Network.ServerToClient.SetHeldInventorySlot.Client:OnServerEvent(function(invId, slot, clientPredicted)
			local inv = self:GetInventory(invId)
			if not inv then
				return nil
			end
			if self.LocalInventory == inv and clientPredicted then
				return nil
			end
			inv:SetHeldSlot(slot)
		end)
		ClientSignals.EntitySpawn:ConnectWithPriority(0, function(event)
			if TS.instanceof(event.Entity, CharacterEntity) then
				local _inventories = self.inventories
				local _id = event.Entity:GetInventory().Id
				local _arg1 = event.Entity:GetInventory()
				_inventories[_id] = _arg1
				if event.Entity:IsLocalCharacter() then
					self:SetLocalInventory((event.Entity):GetInventory())
				end
			end
		end)
		local keyboard = Keyboard.new()
		local mouse = Mouse.new()
		local hotbarKeys = { 41, 42, 43, 44, 45, 46, 47, 48, 49 }
		keyboard.KeyDown:Connect(function(event)
			local _key = event.Key
			local hotbarIndex = (table.find(hotbarKeys, _key) or 0) - 1
			if hotbarIndex > -1 then
				self:SetHeldSlot(hotbarIndex)
				return nil
			end
			if event.Key == 31 then
				self:DropItemInHand()
				return nil
			end
		end)
		-- Scroll to select held item:
		mouse.Scrolled:Connect(function(delta)
			local _selectedSlot = self.LocalInventory
			if _selectedSlot ~= nil then
				_selectedSlot = _selectedSlot:GetSelectedSlot()
			end
			local selectedSlot = _selectedSlot
			if selectedSlot == nil then
				return nil
			end
			local inc = if delta < 0 then 1 else -1
			local trySlot = selectedSlot
			-- Find the next available item in the hotbar:
			for _ = 1, #hotbarKeys do
				trySlot += inc
				-- Clamp index to hotbar items:
				if inc == 1 and trySlot >= #hotbarKeys then
					trySlot = 0
				elseif inc == -1 and trySlot < 0 then
					trySlot = #hotbarKeys - 1
				end
				-- If the item at the given `trySlot` index exists, set it as the held item:
				local _itemAtSlot = self.LocalInventory
				if _itemAtSlot ~= nil then
					_itemAtSlot = _itemAtSlot:GetItem(trySlot)
				end
				local itemAtSlot = _itemAtSlot
				if itemAtSlot ~= nil then
					self:SetHeldSlot(trySlot)
					break
				end
			end
		end)
	end
	function InventoryController:SwapSlots(fromInventory, fromSlot, toInventory, toSlot, config)
		local fromItem = fromInventory:GetItem(fromSlot)
		local toItem = toInventory:GetItem(toSlot)
		local _fn = toInventory
		local _exp = toSlot
		local _object = {}
		local _left = "clientPredicted"
		local _result = config
		if _result ~= nil then
			_result = _result.noNetwork
		end
		_object[_left] = _result
		_fn:SetItem(_exp, fromItem, _object)
		local _fn_1 = fromInventory
		local _exp_1 = fromSlot
		local _object_1 = {}
		local _left_1 = "clientPredicted"
		local _result_1 = config
		if _result_1 ~= nil then
			_result_1 = _result_1.noNetwork
		end
		_object_1[_left_1] = _result_1
		_fn_1:SetItem(_exp_1, toItem, _object_1)
	end
	function InventoryController:CheckInventoryOutOfSync()
		if not self.LocalInventory then
			error("missing local inventory.")
		end
		Network.ClientToServer.Inventory.CheckOutOfSync.Client:FireServer(self.LocalInventory:Encode())
	end
	function InventoryController:DropItemInHand()
		local _heldItem = self.LocalInventory
		if _heldItem ~= nil then
			_heldItem = _heldItem:GetHeldItem()
		end
		local heldItem = _heldItem
		if heldItem then
			Network.ClientToServer.DropItemInHand.Client:FireServer(1)
		end
	end
	function InventoryController:SetLocalInventory(inventory)
		self.LocalInventory = inventory
		self.LocalInventoryAdded:Fire(inventory)
	end
	function InventoryController:ObserveLocalInventory(callback)
		local bin = Bin.new()
		local cleanup
		if Game.LocalPlayer.Character and TS.instanceof(Game.LocalPlayer.Character, CharacterEntity) then
			cleanup = callback(Game.LocalPlayer.Character:GetInventory())
		end
		bin:Add(Game.LocalPlayer:ObserveCharacter(function(entity)
			local _result = cleanup
			if _result ~= nil then
				_result()
			end
			if entity and TS.instanceof(entity, CharacterEntity) then
				cleanup = callback(entity:GetInventory())
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
	function InventoryController:ObserveLocalHeldItem(callback)
		local bin = Bin.new()
		local cleanup
		local invBin = Bin.new()
		bin:Add(self:ObserveLocalInventory(function(inv)
			invBin:Clean()
			if inv then
				invBin:Add(inv:ObserveHeldItem(function(itemStack)
					local _result = cleanup
					if _result ~= nil then
						_result()
					end
					cleanup = callback(itemStack)
				end))
			else
				cleanup = callback(nil)
			end
		end))
		return bin
	end
	function InventoryController:SetHeldSlot(slot)
		if self.LocalInventory == nil then
			return nil
		end
		self.LocalInventory:SetHeldSlot(slot)
		self.HeldSlotChanged:Fire(slot)
		Network.ClientToServer.SetHeldSlot.Client:FireServer(slot)
	end
	function InventoryController:GetInventory(id)
		local _inventories = self.inventories
		local _id = id
		return _inventories[_id]
	end
	function InventoryController:RegisterInventory(inv)
		local _inventories = self.inventories
		local _id = inv.Id
		local _inv = inv
		_inventories[_id] = _inv
	end
	function InventoryController:QuickMoveSlot(inv, slot)
		local itemStack = inv:GetItem(slot)
		if not itemStack then
			return nil
		end
		if slot < inv:GetHotbarSlotCount() then
			-- move to backpack
			local completed = false
			-- armor
			local itemMeta = itemStack:GetMeta()
			if not completed then
				if itemMeta.Armor then
					local armorSlot = inv.armorSlots[itemMeta.Armor.ArmorType]
					local existingArmor = inv:GetItem(armorSlot)
					if existingArmor == nil then
						self:SwapSlots(inv, slot, inv, armorSlot, {
							noNetwork = true,
						})
						completed = true
					end
				end
			end
			-- find slots to merge
			if not completed then
				do
					local i = inv:GetHotbarSlotCount()
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < inv:GetMaxSlots()) then
							break
						end
						local otherItemStack = inv:GetItem(i)
						local _result = otherItemStack
						if _result ~= nil then
							_result = _result:CanMerge(itemStack)
						end
						if _result then
							if otherItemStack:GetAmount() < otherItemStack:GetMaxStackSize() then
								local delta = math.min(itemStack:GetAmount(), otherItemStack:GetMaxStackSize() - otherItemStack:GetAmount())
								otherItemStack:SetAmount(otherItemStack:GetAmount() + delta)
								itemStack:Decrement(delta)
								if itemStack:IsDestroyed() then
									completed = true
									break
								end
							end
						end
					end
				end
			end
			if not completed then
				-- find empty slot
				do
					local i = inv:GetHotbarSlotCount()
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < inv:GetMaxSlots()) then
							break
						end
						if inv:GetItem(i) == nil then
							self:SwapSlots(inv, slot, inv, i, {
								noNetwork = true,
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
			-- armor
			if not completed then
				if itemMeta.Armor then
					local armorSlot = inv.armorSlots[itemMeta.Armor.ArmorType]
					local existingArmor = inv:GetItem(armorSlot)
					if existingArmor == nil then
						self:SwapSlots(inv, slot, inv, armorSlot, {
							noNetwork = true,
						})
						completed = true
					end
				end
			end
			-- find slots to merge
			if not completed then
				do
					local i = 0
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < inv:GetHotbarSlotCount()) then
							break
						end
						local otherItemStack = inv:GetItem(i)
						local _result = otherItemStack
						if _result ~= nil then
							_result = _result:CanMerge(itemStack)
						end
						if _result then
							if otherItemStack:GetAmount() < otherItemStack:GetMaxStackSize() then
								local delta = math.max(otherItemStack:GetMaxStackSize() - itemStack:GetAmount(), otherItemStack:GetMaxStackSize() - otherItemStack:GetAmount())
								otherItemStack:SetAmount(otherItemStack:GetAmount() + delta)
								itemStack:Decrement(delta)
								if itemStack:IsDestroyed() then
									completed = true
									break
								end
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
						if not (i < inv:GetHotbarSlotCount()) then
							break
						end
						if inv:GetItem(i) == nil then
							self:SwapSlots(inv, slot, inv, i, {
								noNetwork = true,
							})
							completed = true
							break
						end
					end
				end
			end
		end
		Network.ClientToServer.Inventory.QuickMoveSlot.Client:FireServer(inv.Id, slot, inv.Id)
		-- SetTimeout(0.1, () => {
		-- this.CheckInventoryOutOfSync();
		-- });
	end
end
-- (Flamework) InventoryController metadata
Reflect.defineMetadata(InventoryController, "identifier", "Bundles/Client/Controllers/Global/Inventory/InventoryController@InventoryController")
Reflect.defineMetadata(InventoryController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(InventoryController, "$:flamework@Controller", Controller, { {} })
return {
	InventoryController = InventoryController,
}
-- ----------------------------------
-- ----------------------------------
