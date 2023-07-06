-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local ArmorType = require("Shared/TS/Item/ArmorType").ArmorType
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Bin = require("Shared/TS/Util/Bin").Bin
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local EntityAccessoryController
do
	EntityAccessoryController = setmetatable({}, {
		__tostring = function()
			return "EntityAccessoryController"
		end,
	})
	EntityAccessoryController.__index = EntityAccessoryController
	function EntityAccessoryController.new(...)
		local self = setmetatable({}, EntityAccessoryController)
		return self:constructor(...) or self
	end
	function EntityAccessoryController:constructor(localController)
		self.localController = localController
		self.DefaultKitPath = "Shared/Resources/Accessories/Kits/Whim/WhimKit.asset"
		self.itemAccessories = {}
		self.isFirstPerson = false
		self.missingItemAccessory = AssetBridge:LoadAsset("Shared/Resources/Accessories/missing_item.asset")
		for _, itemTypeStr in Object.keys(ItemType) do
			local itemType = itemTypeStr
			local itemMeta = GetItemMeta(itemType)
			local accessoryNames = { itemTypeStr }
			if itemMeta.AccessoryNames then
				accessoryNames = itemMeta.AccessoryNames
			else
				local _result = itemMeta.block
				if _result ~= nil then
					_result = _result.blockId
				end
				if _result ~= 0 and (_result == _result and _result) then
					accessoryNames = { "block" }
				end
			end
			if #accessoryNames > 0 then
				local accessories = {}
				self.itemAccessories[itemType] = accessories
				for _1, accessoryName in accessoryNames do
					local accNameLower = string.lower(accessoryName)
					local accessory = AssetBridge:LoadAssetIfExists("Shared/Resources/Accessories/" .. (accNameLower .. ".asset"))
					if not accessory then
						warn("Couldn't find: " .. accNameLower)
						continue
					end
					-- this.itemAccessories.set(itemType, accessory);
					local _accessory = accessory
					table.insert(accessories, _accessory)
				end
			end
			self.defaultKitAccessory = AssetBridge:LoadAssetIfExists(self.DefaultKitPath)
		end
	end
	function EntityAccessoryController:GetFirstAccessoryForItemType(itemType)
		local _itemAccessories = self.itemAccessories
		local _itemType = itemType
		local accessories = _itemAccessories[_itemType]
		if accessories then
			return accessories[1]
		end
		return self.missingItemAccessory
	end
	function EntityAccessoryController:GetAccessoriesForItemType(itemType)
		local _itemAccessories = self.itemAccessories
		local _itemType = itemType
		local accessories = _itemAccessories[_itemType]
		if accessories then
			return accessories
		end
		return { self.missingItemAccessory }
	end
	function EntityAccessoryController:AutoEquipArmor()
		ClientSignals.EntitySpawn:Connect(function(event)
			if TS.instanceof(event.Entity, CharacterEntity) then
				local inventory = event.Entity:GetInventory()
				local accessoryBuilder = event.Entity.gameObject:GetComponent("AccessoryBuilder")
				local bin = Bin.new()
				local currentArmor
				local onArmorSlotChanged = function(itemStack)
					if itemStack then
						local itemType = itemStack:GetItemType()
						local armorAccessories = self:GetAccessoriesForItemType(itemType)
						if currentArmor then
							-- Remove accessory slots from previous armor that aren't on the new armor:
							local _currentArmor = currentArmor
							local _arg0 = function(acc)
								return acc.AccessorySlot
							end
							-- ▼ ReadonlyArray.map ▼
							local _newValue = table.create(#_currentArmor)
							for _k, _v in _currentArmor do
								_newValue[_k] = _arg0(_v, _k - 1, _currentArmor)
							end
							-- ▲ ReadonlyArray.map ▲
							local currentSlots = _newValue
							local _arg0_1 = function(acc)
								return acc.AccessorySlot
							end
							-- ▼ ReadonlyArray.map ▼
							local _newValue_1 = table.create(#armorAccessories)
							for _k, _v in armorAccessories do
								_newValue_1[_k] = _arg0_1(_v, _k - 1, armorAccessories)
							end
							-- ▲ ReadonlyArray.map ▲
							local newSlots = _newValue_1
							local _arg0_2 = function(slot)
								local _slot = slot
								return not (table.find(newSlots, _slot) ~= nil)
							end
							-- ▼ ReadonlyArray.filter ▼
							local _newValue_2 = {}
							local _length = 0
							for _k, _v in currentSlots do
								if _arg0_2(_v, _k - 1, currentSlots) == true then
									_length += 1
									_newValue_2[_length] = _v
								end
							end
							-- ▲ ReadonlyArray.filter ▲
							local slotsToRemove = _newValue_2
							for _, slot in slotsToRemove do
								accessoryBuilder:RemoveAccessorySlot(slot)
							end
						end
						for _, acc in armorAccessories do
							accessoryBuilder:SetAccessory(acc)
						end
						currentArmor = armorAccessories
					else
						if currentArmor then
							-- Clear armor:
							for _, acc in currentArmor do
								accessoryBuilder:RemoveAccessorySlot(acc.AccessorySlot)
							end
							currentArmor = nil
						end
					end
				end
				onArmorSlotChanged(inventory:GetItem(inventory.armorSlots[ArmorType.CHESTPLATE]))
				bin:Connect(inventory.SlotChanged, function(slotIndex, itemStack)
					if slotIndex == inventory.armorSlots[ArmorType.CHESTPLATE] then
						onArmorSlotChanged(itemStack)
					end
				end)
				event.Entity.OnDespawn:Once(function()
					bin:Clean()
				end)
			end
		end)
	end
	function EntityAccessoryController:OnStart()
		self:AutoEquipArmor()
		ClientSignals.EntitySpawn:Connect(function(event)
			if TS.instanceof(event.Entity, CharacterEntity) then
				local accessoryBuilder = event.Entity.accessoryBuilder
				-- Add Kit Accessory
				if self.defaultKitAccessory then
					accessoryBuilder:SetAccessoryKit(self.defaultKitAccessory)
				end
				local bin = Bin.new()
				bin:Add(event.Entity:GetInventory():ObserveHeldItem(function(itemStack)
					if itemStack == nil then
						accessoryBuilder:RemoveAccessorySlot(2)
						return nil
					end
					local accessories = self:GetAccessoriesForItemType(itemStack:GetItemType())
					for _, accessory in accessories do
						accessoryBuilder:SetAccessory(accessory)
					end
					local itemMeta = itemStack:GetItemMeta()
					if itemMeta.block and itemMeta.AccessoryNames == nil then
						local blockDefinition = WorldAPI:GetMainWorld():GetBlockDefinition(itemMeta.block.blockId)
						local blockGO = MeshProcessor:ProduceSingleBlock(itemMeta.block.blockId, WorldAPI:GetMainWorld().voxelWorld)
						local gameObjects = accessoryBuilder:GetAccessories(2)
						blockGO.transform:SetParent(gameObjects:GetValue(0).transform)
						blockGO.transform.localPosition = Vector3.new(0, 0, 0)
						local scale = 1
						blockGO.transform.localScale = Vector3.new(scale, scale, scale)
						blockGO.transform.localRotation = Quaternion.identity
						blockGO.transform:Rotate(Vector3.new(90, 90, 0))
					end
					if event.Entity:IsLocalCharacter() then
						self:SetFirstPersonLayer(accessoryBuilder)
					end
				end))
				if event.Entity:IsLocalCharacter() then
					bin:Add(self.localController:ObserveFirstPerson(function(isFirstPerson)
						self.isFirstPerson = isFirstPerson
						self:SetFirstPersonLayer(accessoryBuilder)
					end))
				end
				event.Entity.OnDespawn:Once(function()
					bin:Clean()
				end)
			end
		end)
	end
	function EntityAccessoryController:SetFirstPersonLayer(accessoryBuilder)
		-- Accessories with first person mesh variants need to be on layer FPS
		-- Turn off root accessories unless they are on the first person layer
		local rootItems = accessoryBuilder:GetAccessoryMeshes(5)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < rootItems.Length) then
					break
				end
				local item = rootItems:GetValue(i)
				item.enabled = (not self.isFirstPerson and item.gameObject.layer ~= 10) or (self.isFirstPerson and item.gameObject.layer == 10)
			end
		end
		-- Set hand items to render in the first person camera
		local rightHandItems = accessoryBuilder:GetAccessoryMeshes(2)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < rightHandItems.Length) then
					break
				end
				rightHandItems:GetValue(i).gameObject.layer = if self.isFirstPerson then 10 else 3
			end
		end
		local leftHandItems = accessoryBuilder:GetAccessoryMeshes(3)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < leftHandItems.Length) then
					break
				end
				leftHandItems:GetValue(i).gameObject.layer = if self.isFirstPerson then 10 else 3
			end
		end
	end
end
-- (Flamework) EntityAccessoryController metadata
Reflect.defineMetadata(EntityAccessoryController, "identifier", "Bundles/Client/Controllers/Global/Accessory/EntityAccessoryController@EntityAccessoryController")
Reflect.defineMetadata(EntityAccessoryController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController" })
Reflect.defineMetadata(EntityAccessoryController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(EntityAccessoryController, "$:flamework@Controller", Controller, { {} })
return {
	EntityAccessoryController = EntityAccessoryController,
}
-- ----------------------------------
-- ----------------------------------
