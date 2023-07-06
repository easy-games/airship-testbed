-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Entity = require("Shared/TS/Entity/Entity").Entity
local Game = require("Shared/TS/Game").Game
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local GroundItemUtil = require("Shared/TS/GroundItem/GroundItemUtil").GroundItemUtil
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Network = require("Shared/TS/Network").Network
local Bin = require("Shared/TS/Util/Bin").Bin
local WaitForNobId = require("Shared/TS/Util/NetworkUtil").WaitForNobId
local _Timer = require("Shared/TS/Util/Timer")
local OnUpdate = _Timer.OnUpdate
local SetInterval = _Timer.SetInterval
local GroundItemController
do
	GroundItemController = setmetatable({}, {
		__tostring = function()
			return "GroundItemController"
		end,
	})
	GroundItemController.__index = GroundItemController
	function GroundItemController.new(...)
		local self = setmetatable({}, GroundItemController)
		return self:constructor(...) or self
	end
	function GroundItemController:constructor(playerController, entityAccessoryController)
		self.playerController = playerController
		self.entityAccessoryController = entityAccessoryController
		self.groundItems = {}
		self.itemTypeToDisplayObjMap = {}
		self.fallbackDisplayObj = AssetBridge:LoadAsset("Shared/Resources/Prefabs/GroundItems/_fallback.prefab")
		for _, itemType in Object.values(ItemType) do
			local obj = AssetBridge:LoadAssetIfExists("Shared/Resources/Prefabs/GroundItems/" .. (string.lower(itemType) .. ".prefab"))
			if obj then
				self.itemTypeToDisplayObjMap[itemType] = obj
			end
		end
	end
	function GroundItemController:CreateDisplayGO(itemStack, parent)
		local _itemTypeToDisplayObjMap = self.itemTypeToDisplayObjMap
		local _arg0 = itemStack:GetItemType()
		local obj = _itemTypeToDisplayObjMap[_arg0]
		if not obj then
			local accessory = self.entityAccessoryController:GetFirstAccessoryForItemType(itemStack:GetItemType())
			obj = accessory.Prefab
		end
		local displayGO = GameObjectBridge:InstantiateIn(obj, parent)
		-- displayGO.transform.localScale = new Vector3(0.5, 0.5, 0.5);
		displayGO.transform.localPosition = Vector3.new(0, 0.5, 0)
		return displayGO
	end
	function GroundItemController:OnStart()
		Network.ServerToClient.AddGroundItem.Client:OnServerEvent(function(groundItemGOID, itemStackDto)
			local itemStack = ItemStack:Decode(itemStackDto)
			local groundItemNob = WaitForNobId(groundItemGOID)
			local _groundItems = self.groundItems
			local _groundItemGOID = groundItemGOID
			local _arg1 = {
				nob = groundItemNob,
				itemStack = itemStack,
			}
			_groundItems[_groundItemGOID] = _arg1
			local displayGO = self:CreateDisplayGO(itemStack, groundItemNob.transform:GetChild(0))
			local bin = Bin.new()
			bin:Add(OnUpdate:Connect(function(dt)
				local _fn = displayGO.transform
				local _vector3 = Vector3.new(0, 360, 0)
				local _arg0 = dt * 0.3
				_fn:Rotate(_vector3 * _arg0)
			end));
			(groundItemNob:GetComponent("DestroyWatcher")):OnDestroyedEvent(function()
				local _groundItems_1 = self.groundItems
				local _groundItemGOID_1 = groundItemGOID
				_groundItems_1[_groundItemGOID_1] = nil
				bin:Clean()
			end)
		end)
		-- Pickup when nearbys
		SetInterval(0.1, function()
			local _pawnPos = Game.LocalPlayer.Character
			if _pawnPos ~= nil then
				_pawnPos = _pawnPos.gameObject.transform.position
			end
			local pawnPos = _pawnPos
			if not pawnPos then
				return nil
			end
			local toPickup = {}
			for _k, _v in self.groundItems do
				local pair = { _k, _v }
				if not GroundItemUtil:CanPickupGroundItem(pair[2].itemStack, pair[2].nob, pawnPos) then
					continue
				end
				local _toPickup = toPickup
				local _arg0 = pair[2]
				table.insert(_toPickup, _arg0)
			end
			local _toPickup = toPickup
			local _arg0 = function(a, b)
				return a.nob.gameObject.transform.position:Distance(pawnPos) < b.nob.gameObject.transform.position:Distance(pawnPos)
			end
			table.sort(_toPickup, _arg0)
			toPickup = _toPickup
			for _, entry in toPickup do
				Network.ClientToServer.PickupGroundItem.Client:FireServer(entry.nob.ObjectId)
			end
		end)
		Network.ServerToClient.EntityPickedUpGroundItem.Client:OnServerEvent(function(entityId, itemType)
			local entity = Entity:FindById(entityId)
			if entity then
				ClientSignals.EntityPickupItem:Fire({
					entity = entity,
					itemType = itemType,
				})
			end
		end)
	end
end
-- (Flamework) GroundItemController metadata
Reflect.defineMetadata(GroundItemController, "identifier", "Bundles/Client/Controllers/Global/GroundItem/GroundItemController@GroundItemController")
Reflect.defineMetadata(GroundItemController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController", "Bundles/Client/Controllers/Global/Accessory/EntityAccessoryController@EntityAccessoryController" })
Reflect.defineMetadata(GroundItemController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(GroundItemController, "$:flamework@Controller", Controller, { {} })
return {
	GroundItemController = GroundItemController,
}
-- ----------------------------------
-- ----------------------------------
