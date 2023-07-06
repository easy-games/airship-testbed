-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local RandomUtil = require("Shared/TS/Util/RandomUtil").RandomUtil
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local PICKUP_ITEM_DEFAULT_SOUND = { "Pickup_Item" }
local GroundItemPickupSoundsController
do
	GroundItemPickupSoundsController = setmetatable({}, {
		__tostring = function()
			return "GroundItemPickupSoundsController"
		end,
	})
	GroundItemPickupSoundsController.__index = GroundItemPickupSoundsController
	function GroundItemPickupSoundsController.new(...)
		local self = setmetatable({}, GroundItemPickupSoundsController)
		return self:constructor(...) or self
	end
	function GroundItemPickupSoundsController:constructor()
	end
	function GroundItemPickupSoundsController:OnStart()
		ClientSignals.EntityPickupItem:Connect(function(event)
			if not event.entity:IsLocalCharacter() then
				return nil
			end
			local itemMeta = GetItemMeta(event.itemType)
			local pickupSound = RandomUtil:FromArray(itemMeta.PickupSound or PICKUP_ITEM_DEFAULT_SOUND)
			SoundUtil:PlayGlobal(pickupSound, {
				volumeScale = 0.6,
			})
			-- Extra sound layers
			if event.itemType == ItemType.EMERALD then
				SoundUtil:PlayGlobal("PickupItemLayer_Emerald")
			elseif event.itemType == ItemType.DIAMOND then
				SoundUtil:PlayGlobal("PickupItemLayer_Diamond")
			end
		end)
	end
end
-- (Flamework) GroundItemPickupSoundsController metadata
Reflect.defineMetadata(GroundItemPickupSoundsController, "identifier", "Bundles/Client/Controllers/Global/GroundItem/GroundItemPickupSoundsController@GroundItemPickupSoundsController")
Reflect.defineMetadata(GroundItemPickupSoundsController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(GroundItemPickupSoundsController, "$:flamework@Controller", Controller, { {} })
return {
	GroundItemPickupSoundsController = GroundItemPickupSoundsController,
}
-- ----------------------------------
-- ----------------------------------
