-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local items = require("Shared/TS/Item/ItemDefinitions").items
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local BlockHeldItem = require("Shared/TS/Item/HeldItems/BlockPlacement/BlockHeldItem").BlockHeldItem
local BreakBlockHeldItem = require("Shared/TS/Item/HeldItems/BlockPlacement/BreakBlockHeldItem").BreakBlockHeldItem
local MeleeHeldItem = require("Shared/TS/Item/HeldItems/Damagers/MeleeHeldItem").MeleeHeldItem
local HeldItem = require("Shared/TS/Item/HeldItems/HeldItem").HeldItem
local ProjectileLauncherHeldItem = require("Shared/TS/Item/HeldItems/ProjectileLauncher/ProjectileLauncherHeldItem").ProjectileLauncherHeldItem
local HeldItemState
do
	local _inverse = {}
	HeldItemState = setmetatable({}, {
		__index = _inverse,
	})
	HeldItemState.NONE = -1
	_inverse[-1] = "NONE"
	HeldItemState.CALL_TO_ACTION_START = 0
	_inverse[0] = "CALL_TO_ACTION_START"
	HeldItemState.CALL_TO_ACTION_END = 1
	_inverse[1] = "CALL_TO_ACTION_END"
	HeldItemState.ON_DESTROY = 2
	_inverse[2] = "ON_DESTROY"
end
-- One item manager per entity, calls functionality on currently equipped item for that entity
local HeldItemManager
do
	HeldItemManager = setmetatable({}, {
		__tostring = function()
			return "HeldItemManager"
		end,
	})
	HeldItemManager.__index = HeldItemManager
	function HeldItemManager.new(...)
		local self = setmetatable({}, HeldItemManager)
		return self:constructor(...) or self
	end
	function HeldItemManager:constructor(entity)
		self.heldItemMap = {}
		self.currentItemState = HeldItemState.NONE
		self.entity = entity
		self:Log("Creating Held Items")
		self.currentHeldItem = self:GetOrCreateHeldItem()
		-- Listen for item switches
		self.entity:GetInventory():ObserveHeldItem(function(itemStack)
			local _fn = self
			local _result = itemStack
			if _result ~= nil then
				_result = _result:GetMeta().displayName
			end
			_fn:Log("is equipping anew item: " .. tostring(_result))
			-- UnEquip last item
			if self.currentHeldItem ~= nil then
				self.currentHeldItem:OnUnEquip()
			end
			-- Equip the new item
			self.currentItemState = HeldItemState.NONE
			local _fn_1 = self
			local _result_1 = itemStack
			if _result_1 ~= nil then
				_result_1 = _result_1:GetMeta()
			end
			self.currentHeldItem = _fn_1:GetOrCreateHeldItem(_result_1)
			self.currentHeldItem:OnEquip()
		end)
	end
	function HeldItemManager:GetLabel()
		return self.entity.id
	end
	function HeldItemManager:Log(message)
		return nil
	end
	function HeldItemManager:GetOrCreateHeldItem(meta)
		if meta == nil then
			meta = items[ItemType.DEFAULT]
		end
		local _heldItemMap = self.heldItemMap
		local _itemType = meta.ItemType
		local item = _heldItemMap[_itemType]
		if item == nil then
			-- Create the held item instance
			local itemType = "NONE"
			self:Log("Creating Held Item...")
			if meta.melee then
				itemType = "MELEE"
				item = MeleeHeldItem.new(self.entity, meta)
			elseif meta.block then
				itemType = "BLOCK"
				item = BlockHeldItem.new(self.entity, meta)
			elseif meta.breakBlock then
				itemType = "BREAK BLOCK"
				item = BreakBlockHeldItem.new(self.entity, meta)
			elseif meta.ProjectileLauncher then
				itemType = "PROJECTILE LAUNCHER"
				item = ProjectileLauncherHeldItem.new(self.entity, meta)
			else
				warn("Entity " .. tostring(self.entity.id) .. " " .. meta.displayName .. " resorting to default held item logic")
				item = HeldItem.new(self.entity, meta)
			end
			self:Log("creating Held Item: " .. meta.displayName .. " of type: " .. itemType)
			local _heldItemMap_1 = self.heldItemMap
			local _itemType_1 = meta.ItemType
			local _item = item
			_heldItemMap_1[_itemType_1] = _item
		end
		return item
	end
	function HeldItemManager:TriggerNewState(itemState)
		-- Notify server of new State
		-- Dependency<LocalEntityController>().AddToMoveData("HeldItemState", itemState);
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")):AddToMoveData("HeldItemState", {
			entityId = self.entity.id,
			state = itemState,
		})
		-- Network.ClientToServer.SetHeldItemState.Client.FireServer(this.entity.id, itemState);
		-- Handle the state locally
		self:OnNewState(itemState)
	end
	function HeldItemManager:OnNewState(itemState)
		self:Log("New State: " .. tostring(itemState))
		if self.currentItemState == itemState then
			return nil
		end
		if self.currentHeldItem == nil then
			error("Trying to interact without any held item!")
			return nil
		end
		self.currentItemState = itemState
		repeat
			local _fallthrough = false
			if itemState == (HeldItemState.CALL_TO_ACTION_START) then
				self.currentHeldItem:OnCallToActionStart()
				break
			end
			if itemState == (HeldItemState.CALL_TO_ACTION_END) then
				self.currentHeldItem:OnCallToActionEnd()
				break
			end
			if itemState == (HeldItemState.ON_DESTROY) then
				-- When destroyed un equip so any logic can clean itself up
				self.currentHeldItem:OnUnEquip()
				-- Fill current held item with default item
				self.currentHeldItem = self:GetOrCreateHeldItem()
			end
		until true
	end
end
return {
	HeldItemState = HeldItemState,
	HeldItemManager = HeldItemManager,
}
-- ----------------------------------
-- ----------------------------------
