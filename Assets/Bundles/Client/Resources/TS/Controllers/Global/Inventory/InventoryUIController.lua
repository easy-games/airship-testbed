-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Game = require("Shared/TS/Game").Game
local BedWarsUI = require("Shared/TS/UI/BedWarsUI").BedWarsUI
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local ProgressBarGraphics = require("Shared/TS/UI/ProgressBarGraphics").ProgressBarGraphics
local InventoryUIController
do
	InventoryUIController = setmetatable({}, {
		__tostring = function()
			return "InventoryUIController"
		end,
	})
	InventoryUIController.__index = InventoryUIController
	function InventoryUIController.new(...)
		local self = setmetatable({}, InventoryUIController)
		return self:constructor(...) or self
	end
	function InventoryUIController:constructor(invController)
		self.invController = invController
		self.hotbarSlots = 9
		self.backpackShown = false
		self.showBackpackBin = Bin.new()
		self.mouse = Mouse.new()
		local go = GameObject:Find("Inventory")
		self.canvas = go:GetComponent("Canvas")
		self.canvas.enabled = true
		local refs = go:GetComponent("GameObjectReferences")
		self.hotbarContent = refs:GetValue("UI", "HotbarContentGO").transform
		self.healthBar = ProgressBarGraphics.new(refs:GetValue("UI", "HealthBarTransform"))
	end
	function InventoryUIController:OnStart()
		self:SetupHotbar()
		-- this.SetupBackpack();
		local keyboard = Keyboard.new()
		keyboard.KeyDown:Connect(function(event)
			if event.Key == 19 then
			end
		end)
	end
	function InventoryUIController:SetupHotbar()
		local init = true
		self.invController:ObserveLocalInventory(function(inv)
			local invBin = Bin.new()
			inv.SlotChanged:Connect(function(slot, itemStack)
				if slot < self.hotbarSlots then
					self:UpdateHotbarSlot(slot, itemStack)
				end
				if itemStack then
					invBin:Add(itemStack.AmountChanged:Connect(function(e)
						self:UpdateHotbarSlot(slot, itemStack)
					end))
					invBin:Add(itemStack.ItemTypeChanged:Connect(function(e)
						self:UpdateHotbarSlot(slot, itemStack)
					end))
				end
			end)
			inv.HeldSlotChanged:Connect(function(slot)
				do
					local i = 0
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < self.hotbarSlots) then
							break
						end
						local itemStack = inv:GetItem(i)
						self:UpdateHotbarSlot(i, itemStack)
					end
				end
			end)
			do
				local i = 0
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						i += 1
					else
						_shouldIncrement = true
					end
					if not (i < self.hotbarSlots) then
						break
					end
					local itemStack = inv:GetItem(i)
					self:UpdateHotbarSlot(i, itemStack, init)
				end
			end
			init = false
			return function()
				invBin:Clean()
			end
		end)
		-- Healthbar
		Game.LocalPlayer:ObserveCharacter(function(entity)
			if entity == nil then
				self.healthBar:SetValue(0)
				return nil
			end
			local setFill = function(newHealth)
				local fill = newHealth / entity:GetMaxHealth()
				self.healthBar:SetValue(fill)
			end
			setFill(entity:GetHealth())
			entity.OnHealthChanged:Connect(setFill)
		end)
	end
	function InventoryUIController:UpdateTile(tile, itemStack)
		local refs = tile:GetComponent("GameObjectReferences")
		local image = refs:GetValue("UI", "Image")
		local amount = refs:GetValue("UI", "Amount")
		local name = refs:GetValue("UI", "Name")
		if not itemStack then
			image.enabled = false
			amount.enabled = false
			return nil
		end
		local itemMeta = itemStack:GetItemMeta()
		local imageSrc = string.lower(itemStack:GetItemType()) .. ".png"
		local texture2d = AssetBridge:LoadAssetIfExists("Client/Resources/Assets/ItemRenders/" .. imageSrc)
		if texture2d then
			image.sprite = Bridge:MakeSprite(texture2d)
			image.enabled = true
			name.enabled = false
		else
			name.text = itemMeta.displayName
			name.enabled = true
			image.enabled = false
		end
		amount.enabled = true
		if itemStack:GetAmount() > 1 then
			amount.text = tostring(itemStack:GetAmount()) .. ""
		else
			amount.text = ""
		end
	end
	function InventoryUIController:UpdateHotbarSlot(slot, itemStack, init)
		if init == nil then
			init = false
		end
		local _result = self.invController.LocalInventory
		if _result ~= nil then
			_result = _result:GetSelectedSlot()
		end
		local _condition = _result
		if _condition == nil then
			_condition = -1
		end
		local selectedSlot = _condition
		local go = self.hotbarContent:GetChild(slot).gameObject
		self:UpdateTile(go, itemStack)
		local animator = go:GetComponent("Animator")
		animator:SetBool("Selected", selectedSlot == slot)
		if init then
			local contentGO = go.transform:FindChild("Content").gameObject
			BedWarsUI:SetupButton(contentGO)
			CanvasAPI:OnClickEvent(contentGO, function()
				if self:IsBackpackShown() and self.invController.LocalInventory then
					self.invController:QuickMoveSlot(self.invController.LocalInventory, slot)
				else
					self.invController:SetHeldSlot(slot)
				end
			end)
		end
	end
	function InventoryUIController:ShowBackpack()
		self.backpackShown = true
		-- const root = this.GetBackpackRoot();
		-- UICore.SetDisplayStyle(root, DisplayStyle.Flex);
		local lockerId = self.mouse:AddUnlocker()
		self.showBackpackBin:Add(function()
			self.mouse:RemoveUnlocker(lockerId)
		end)
	end
	function InventoryUIController:HideBackpack()
		self.showBackpackBin:Clean()
		self.backpackShown = false
		-- const root = this.GetBackpackRoot();
		-- UICore.SetDisplayStyle(root, DisplayStyle.None);
	end
	function InventoryUIController:IsBackpackShown()
		return self.backpackShown
	end
end
-- (Flamework) InventoryUIController metadata
Reflect.defineMetadata(InventoryUIController, "identifier", "Bundles/Client/Controllers/Global/Inventory/InventoryUIController@InventoryUIController")
Reflect.defineMetadata(InventoryUIController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Inventory/InventoryController@InventoryController" })
Reflect.defineMetadata(InventoryUIController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(InventoryUIController, "$:flamework@Controller", Controller, { {} })
return {
	InventoryUIController = InventoryUIController,
}
-- ----------------------------------
-- ----------------------------------
