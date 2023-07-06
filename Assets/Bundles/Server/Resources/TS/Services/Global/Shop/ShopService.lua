-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local Network = require("Shared/TS/Network").Network
local DEFAULT_BEDWARS_SHOP = require("Shared/TS/Shop/ShopMeta").DEFAULT_BEDWARS_SHOP
local ShopService
do
	ShopService = setmetatable({}, {
		__tostring = function()
			return "ShopService"
		end,
	})
	ShopService.__index = ShopService
	function ShopService.new(...)
		local self = setmetatable({}, ShopService)
		return self:constructor(...) or self
	end
	function ShopService:constructor(entityService)
		self.entityService = entityService
	end
	function ShopService:OnStart()
		-- Handle incoming purchase requests.
		Network.ClientToServer.Shop.PurchaseRequest.Server:SetCallback(function(clientId, shopItem)
			return self:HandleIncomingPurchaseRequest(clientId, shopItem)
		end)
	end
	function ShopService:HandleIncomingPurchaseRequest(clientId, item)
		-- Validate that entity exists.
		local requestEntity = self.entityService:GetEntityByClientId(clientId)
		if not requestEntity then
			return false
		end
		-- Valide that entity has an inventory.
		if not (TS.instanceof(requestEntity, CharacterEntity)) then
			return false
		end
		-- Validate that shop item.
		local _shopItems = DEFAULT_BEDWARS_SHOP.shopItems
		local _arg0 = function(shopItem)
			return shopItem.item == item.item
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _shopItems do
			if _arg0(_v, _i - 1, _shopItems) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		local shopItem = _result
		if not shopItem then
			return false
		end
		-- Validate user can afford item.
		local entityInv = requestEntity:GetInventory()
		local canAfford = entityInv:HasEnough(shopItem.currency, shopItem.price)
		if not canAfford then
			return false
		end
		-- Fulfill purchase.
		entityInv:Decrement(shopItem.currency, shopItem.price)
		entityInv:AddItem(ItemStack.new(shopItem.item, shopItem.quantity))
		return true
	end
end
-- (Flamework) ShopService metadata
Reflect.defineMetadata(ShopService, "identifier", "Bundles/Server/Services/Global/Shop/ShopService@ShopService")
Reflect.defineMetadata(ShopService, "flamework:parameters", { "Bundles/Server/Services/Global/Entity/EntityService@EntityService" })
Reflect.defineMetadata(ShopService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ShopService, "$:flamework@Service", Service, { {} })
return {
	ShopService = ShopService,
}
-- ----------------------------------
-- ----------------------------------
