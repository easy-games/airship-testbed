-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Game = require("Shared/TS/Game").Game
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local ItemUtil = require("Shared/TS/Item/ItemUtil").ItemUtil
local Network = require("Shared/TS/Network").Network
local _ShopMeta = require("Shared/TS/Shop/ShopMeta")
local DEFAULT_BEDWARS_SHOP = _ShopMeta.DEFAULT_BEDWARS_SHOP
local ShopCategory = _ShopMeta.ShopCategory
local BedWarsUI = require("Shared/TS/UI/BedWarsUI").BedWarsUI
local AppManager = require("Shared/TS/Util/AppManager").AppManager
local Bin = require("Shared/TS/Util/Bin").Bin
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local ItemShopController
do
	ItemShopController = setmetatable({}, {
		__tostring = function()
			return "ItemShopController"
		end,
	})
	ItemShopController.__index = ItemShopController
	function ItemShopController.new(...)
		local self = setmetatable({}, ItemShopController)
		return self:constructor(...) or self
	end
	function ItemShopController:constructor()
		self.selectedItemBin = Bin.new()
		-- Fetch refs.
		local shopGO = GameObject:Find("Shop")
		self.shopCanvas = shopGO:GetComponent("Canvas")
		self.shopCanvas.enabled = false
		self.shopItemPrefab = AssetBridge:LoadAsset("Shared/Resources/Prefabs/GameUI/ShopItem.prefab")
		self.refs = shopGO:GetComponent("GameObjectReferences")
		self.purchaseButton = self.refs:GetValue("SidebarContainer", "PurchaseButton")
		self.purchaseButtonText = self.refs:GetValue("SidebarContainer", "PurchaseButtonText")
	end
	function ItemShopController:OnStart()
		self:Init()
	end
	function ItemShopController:Open()
		local bin = Bin.new()
		if self.selectedItem then
			self:SetSidebarItem(self.selectedItem)
		end
		AppManager:Open(self.shopCanvas, {
			onClose = function()
				bin:Clean()
				self.selectedItemBin:Clean()
			end,
		})
	end
	function ItemShopController:Init()
		local shopItems = DEFAULT_BEDWARS_SHOP.shopItems
		-- Default sidebar to _first_ item in default shop array..
		local defaultItem = shopItems[1]
		self:SetSidebarItem(defaultItem)
		-- Instantiate individual item prefabs underneath relevant category container.
		local _shopItems = DEFAULT_BEDWARS_SHOP.shopItems
		local _arg0 = function(shopItem)
			local container = self:GetCategoryContainer(shopItem.category)
			if container then
				local itemElement = GameObjectBridge:InstantiateIn(self.shopItemPrefab, container.transform)
				local imageElement = itemElement.transform:GetChild(0).gameObject
				CanvasUIBridge:SetSprite(imageElement, ItemUtil:GetItemRenderPath(shopItem.item))
				BedWarsUI:SetupButton(itemElement)
				CanvasAPI:OnClickEvent(itemElement, function()
					self:SetSidebarItem(shopItem)
				end)
			end
		end
		for _k, _v in _shopItems do
			_arg0(_v, _k - 1, _shopItems)
		end
		-- Handle purchase requests.
		local purchaseButton = self.refs:GetValue("SidebarContainer", "PurchaseButton")
		BedWarsUI:SetupButton(purchaseButton)
		CanvasAPI:OnClickEvent(purchaseButton, function()
			self:HandlePurchaseRequest()
		end)
		--[[
			*
			*	CanvasEventAPI.OnHoverEvent(purchaseButton, (hoverState) => {
			*		if (hoverState === HoverState.ENTER) print("Entering button!");
			*		if (hoverState === HoverState.EXIT) print("Exiting button!");
			*	});
		]]
	end
	function ItemShopController:HandlePurchaseRequest()
		if not self.selectedItem then
			return nil
		end
		local result = Network.ClientToServer.Shop.PurchaseRequest.Client:FireServer(self.selectedItem)
		if result then
			SoundUtil:PlayGlobal("ItemShopPurchase.wav")
		end
	end
	function ItemShopController:SetSidebarItem(shopItem)
		self.selectedItemBin:Clean()
		-- TODO: We should probably fetch and cache these references inside of `OnStart` or the constructor.
		self.selectedItem = shopItem
		local selectedItemIcon = self.refs:GetValue("SidebarContainer", "SelectedItemIcon")
		local selectedItemQuantity = self.refs:GetValue("SidebarContainer", "SelectedItemQuantity")
		local selectedItemName = self.refs:GetValue("SidebarContainer", "SelectedItemName")
		local selectedItemCost = self.refs:GetValue("SidebarContainer", "SelectedItemCost")
		CanvasUIBridge:SetSprite(selectedItemIcon, ItemUtil:GetItemRenderPath(shopItem.item))
		local itemMeta = GetItemMeta(shopItem.item)
		selectedItemQuantity.text = "x" .. tostring(shopItem.quantity)
		selectedItemName.text = itemMeta.displayName
		selectedItemCost.text = tostring(shopItem.price) .. (" " .. shopItem.currency)
		local purchaseButtonImage = self.purchaseButton:GetComponent("Image")
		local updateHasEnough = function()
			local _inv = Game.LocalPlayer.Character
			if _inv ~= nil then
				_inv = _inv:GetInventory()
			end
			local inv = _inv
			local _result = inv
			if _result ~= nil then
				_result = _result:HasEnough(shopItem.currency, shopItem.price)
			end
			if _result then
				self.purchaseButtonText.text = "Purchase"
				purchaseButtonImage.color = Color.new(0.5, 0.87, 0.63)
			else
				self.purchaseButtonText.text = "Not Enough"
				purchaseButtonImage.color = Color.new(0.62, 0.2, 0.24)
			end
		end
		updateHasEnough()
		self.selectedItemBin:Add((Flamework.resolveDependency("Bundles/Client/Controllers/Global/Inventory/InventoryController@InventoryController")):ObserveLocalInventory(function(inv)
			self.selectedItemBin:Add(inv.SlotChanged:Connect(function(slot, itemStack)
				if itemStack then
					local _fn = self.selectedItemBin
					local _result = itemStack
					if _result ~= nil then
						_result = _result.Changed:Connect(function()
							updateHasEnough()
						end)
					end
					_fn:Add(_result)
				end
			end))
		end))
	end
	function ItemShopController:GetCategoryContainer(category)
		local container
		repeat
			if category == (ShopCategory.BLOCKS) then
				container = self.refs:GetValue("ContentContainer", "BlockSection")
				break
			end
			if category == (ShopCategory.COMBAT) then
				container = self.refs:GetValue("ContentContainer", "CombatSection")
				break
			end
			if category == (ShopCategory.TOOLS) then
				container = self.refs:GetValue("ContentContainer", "ToolSection")
				break
			end
		until true
		return container
	end
end
-- (Flamework) ItemShopController metadata
Reflect.defineMetadata(ItemShopController, "identifier", "Bundles/Client/Controllers/Global/ItemShop/ItemShopController@ItemShopController")
Reflect.defineMetadata(ItemShopController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ItemShopController, "$:flamework@Controller", Controller, { {} })
return {
	ItemShopController = ItemShopController,
}
-- ----------------------------------
-- ----------------------------------
