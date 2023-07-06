-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local CollectionManager = require("Shared/TS/Util/CollectionManager").CollectionManager
local ProximityPrompt = require("Client/TS/Controllers/Global/ProximityPrompt/ProximityPrompt").ProximityPrompt
-- * Proximity prompt offset.
local PROXIMITY_PROMPT_OFFSET = Vector3.new(0, 1.5, 0)
local ShopkeeperController
do
	ShopkeeperController = setmetatable({}, {
		__tostring = function()
			return "ShopkeeperController"
		end,
	})
	ShopkeeperController.__index = ShopkeeperController
	function ShopkeeperController.new(...)
		local self = setmetatable({}, ShopkeeperController)
		return self:constructor(...) or self
	end
	function ShopkeeperController:constructor(teamUpgradeController, itemShopController)
		self.teamUpgradeController = teamUpgradeController
		self.itemShopController = itemShopController
	end
	function ShopkeeperController:OnStart()
		-- Listen for shopkeeper creation and create proximity prompts accordingly.
		CollectionManager:WatchCollectionTag("item_shop_shopkeeper", function(gameObject)
			local prompt = ProximityPrompt.new({
				promptPosition = gameObject.transform.position + PROXIMITY_PROMPT_OFFSET,
				activationKey = 20,
				activationKeyString = "F",
				activationRange = 3.5,
				bottomText = "Item Shop",
				topText = "Open",
			})
			-- Open shop UI on prompt activation.
			prompt.OnActivated:Connect(function()
				self.itemShopController:Open()
			end)
		end)
		CollectionManager:WatchCollectionTag("team_upgrades_shopkeeper", function(gameObject)
			local prompt = ProximityPrompt.new({
				promptPosition = gameObject.transform.position + PROXIMITY_PROMPT_OFFSET,
				activationKey = 20,
				activationKeyString = "F",
				activationRange = 3.5,
				bottomText = "Upgrades",
				topText = "Open",
			})
			-- Open team upgrade UI on prompt activation.
			prompt.OnActivated:Connect(function()
				self.teamUpgradeController:Open()
			end)
		end)
	end
end
-- (Flamework) ShopkeeperController metadata
Reflect.defineMetadata(ShopkeeperController, "identifier", "Bundles/Client/Controllers/Match/ShopkeeperController@ShopkeeperController")
Reflect.defineMetadata(ShopkeeperController, "flamework:parameters", { "Bundles/Client/Controllers/Global/TeamUpgrade/TeamUpgradeController@TeamUpgradeController", "Bundles/Client/Controllers/Global/ItemShop/ItemShopController@ItemShopController" })
Reflect.defineMetadata(ShopkeeperController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ShopkeeperController, "$:flamework@Controller", Controller, { {} })
return {
	ShopkeeperController = ShopkeeperController,
}
-- ----------------------------------
-- ----------------------------------
