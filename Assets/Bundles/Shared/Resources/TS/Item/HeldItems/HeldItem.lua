-- Compiled with unity-ts v2.1.0-75
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local _ReferenceManagerResources = require("Shared/TS/Util/ReferenceManagerResources")
local BundleGroupNames = _ReferenceManagerResources.BundleGroupNames
local ReferenceManagerAssets = _ReferenceManagerResources.ReferenceManagerAssets
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local HeldItem
do
	HeldItem = setmetatable({}, {
		__tostring = function()
			return "HeldItem"
		end,
	})
	HeldItem.__index = HeldItem
	function HeldItem.new(...)
		local self = setmetatable({}, HeldItem)
		return self:constructor(...) or self
	end
	function HeldItem:constructor(entity, newMeta)
		self.serverOffsetMargin = 0.025
		self.lastUsedTime = 0
		self.chargeStartTime = 0
		self.isCharging = false
		self.entity = entity
		self.meta = newMeta
		-- Load the asset references
		local _result = self.meta.itemAssets
		if _result ~= nil then
			_result = _result.assetBundleId
		end
		if _result ~= 0 and (_result == _result and _result) then
			local _bundleGroups = ReferenceManagerAssets.bundleGroups
			local _assetBundleId = self.meta.itemAssets.assetBundleId
			self.bundles = _bundleGroups[_assetBundleId]
		end
	end
	function HeldItem:Log(message, isError)
		if isError == nil then
			isError = false
		end
		return nil
	end
	function HeldItem:OnEquip()
		self:Log("OnEquip")
		-- Load that items animations and play equip animation
		local _result = self.entity.anim
		if _result ~= nil then
			local _result_1 = self.meta.itemAssets
			if _result_1 ~= nil then
				_result_1 = _result_1.assetBundleId
			end
			local _condition = _result_1
			if _condition == nil then
				_condition = BundleGroupNames.ItemUnarmed
			end
			_result:EquipItem(_condition)
		end
	end
	function HeldItem:OnUnEquip()
		self:Log("OnUnEquip")
	end
	function HeldItem:OnCallToActionStart()
		self:Log("OnCallToActionStart")
		if self:HasChargeTime() then
			self:OnChargeStart()
		else
			self:TryUse()
		end
	end
	function HeldItem:OnCallToActionEnd()
		self:Log("OnCallToActionEnd")
		if self.isCharging then
			self:TryChargeUse()
		end
	end
	function HeldItem:OnChargeStart()
		self:Log("OnChargeStart")
		self.isCharging = true
		self.chargeStartTime = TimeUtil:GetServerTime()
	end
	function HeldItem:TryUse()
		self:Log("TryUse IsCooledDown: " .. tostring(self:IsCooledDown()))
		if self:IsCooledDown() then
			self:TriggerUse(0)
			return true
		end
		return false
	end
	function HeldItem:TryChargeUse()
		self:Log("TryChargeUse IsChargedUp: " .. tostring(self:IsChargedUp()))
		if self:IsChargedUp() then
			self:TriggerUse(1)
			return true
		end
		return false
	end
	function HeldItem:TriggerUse(useIndex)
		self:Log("TriggerUse")
		-- Play the use locally
		if RunUtil:IsClient() then
			self:OnUseClient(useIndex)
		elseif RunUtil:IsServer() then
			self:OnUseServer(useIndex)
		end
	end
	function HeldItem:OnUseClient(useIndex)
		self:Log("OnUse Client")
		self.lastUsedTime = TimeUtil:GetServerTime()
		self.isCharging = false
		-- Play the use locally
		local _result = self.entity.anim
		if _result ~= nil then
			_result:PlayItemUse(useIndex)
		end
		local _result_1 = self.meta.itemAssets
		if _result_1 ~= nil then
			_result_1 = _result_1.onUseSoundId
		end
		if _result_1 ~= "" and _result_1 then
			if self.entity:IsLocalCharacter() then
				local _fn = SoundUtil
				local _exp = self.meta.itemAssets.onUseSoundId
				local _object = {}
				local _left = "volumeScale"
				local _condition = self.meta.itemAssets.onUseSoundVolume
				if _condition == nil then
					_condition = 1
				end
				_object[_left] = _condition
				_fn:PlayGlobal(_exp, _object)
			else
				local _fn = SoundUtil
				local _exp = self.meta.itemAssets.onUseSoundId
				local _exp_1 = self.entity.model.transform.position
				local _object = {}
				local _left = "volumeScale"
				local _condition = self.meta.itemAssets.onUseSoundVolume
				if _condition == nil then
					_condition = 1
				end
				_object[_left] = _condition
				_fn:PlayAtPosition(_exp, _exp_1, _object)
			end
		end
	end
	function HeldItem:OnUseServer(useIndex)
		self:Log("OnUse Server")
		-- Update visual state to match client
		self:OnUseClient(useIndex)
	end
	function HeldItem:IsCooledDown()
		local cooldown = self.meta.itemMechanics.cooldownSeconds
		self:Log("Cooldown: " .. tostring(cooldown) .. " Time: " .. tostring(TimeUtil:GetServerTime()) .. " LastUsedTime: " .. tostring(self.lastUsedTime))
		-- no cooldown no startup
		if cooldown <= 0 then
			return true
		end
		-- If the cooldown is down
		return TimeUtil:GetServerTime() > self.lastUsedTime + cooldown - self.serverOffsetMargin
	end
	function HeldItem:IsChargedUp()
		local chargeUpMin = self.meta.itemMechanics.minChargeSeconds
		self:Log("chargeUpMin: " .. tostring(chargeUpMin))
		-- no charge up
		if chargeUpMin <= 0 then
			return true
		end
		-- If we've charged up enough
		return TimeUtil:GetServerTime() - self.chargeStartTime - self.serverOffsetMargin > chargeUpMin
	end
	function HeldItem:HasChargeTime()
		return self.meta.itemMechanics.minChargeSeconds > 0
	end
end
return {
	HeldItem = HeldItem,
}
-- ----------------------------------
-- ----------------------------------
