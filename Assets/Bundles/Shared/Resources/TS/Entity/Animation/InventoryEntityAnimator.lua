-- Compiled with unity-ts v2.1.0-75
local BundleReferenceManager = require("Shared/TS/Util/BundleReferenceManager").BundleReferenceManager
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local BundleGroupNames = require("Shared/TS/Util/ReferenceManagerResources").BundleGroupNames
local EntityAnimator = require("Shared/TS/Entity/Animation/EntityAnimator").EntityAnimator
local ItemEventKeys
do
	local _inverse = {}
	ItemEventKeys = setmetatable({}, {
		__index = _inverse,
	})
	ItemEventKeys.NONE = -1
	_inverse[-1] = "NONE"
	ItemEventKeys.IDLE = 0
	_inverse[0] = "IDLE"
	ItemEventKeys.EQUIP = 1
	_inverse[1] = "EQUIP"
	ItemEventKeys.UN_EQUIP = 2
	_inverse[2] = "UN_EQUIP"
	ItemEventKeys.USE = 3
	_inverse[3] = "USE"
end
local ItemPlayMode
do
	local _inverse = {}
	ItemPlayMode = setmetatable({}, {
		__index = _inverse,
	})
	ItemPlayMode.DEFAULT = 0
	_inverse[0] = "DEFAULT"
	ItemPlayMode.LOOP = 1
	_inverse[1] = "LOOP"
	ItemPlayMode.HOLD = 2
	_inverse[2] = "HOLD"
end
local InventoryEntityAnimator
do
	local super = EntityAnimator
	InventoryEntityAnimator = setmetatable({}, {
		__tostring = function()
			return "InventoryEntityAnimator"
		end,
		__index = super,
	})
	InventoryEntityAnimator.__index = InventoryEntityAnimator
	function InventoryEntityAnimator.new(...)
		local self = setmetatable({}, InventoryEntityAnimator)
		return self:constructor(...) or self
	end
	function InventoryEntityAnimator:constructor(entity, anim, ref)
		super.constructor(self, entity, anim, ref)
		self.itemLayerIndex = 2
		self.spineClampAngle = 15
		self.neckClampAngle = 35
		self.currentItemClips = {}
		self.bundleIndex = 0
		self.currentBundleName = BundleGroupNames.NONE
		self.currentItemState = ItemEventKeys.NONE
		self.isFirstPerson = false
		self.itemLayer = AnimancerBridge:GetLayer(self.anim, self.itemLayerIndex)
		-- Initial animation setup
		self:LoadNewItemResources(BundleGroupNames.ItemUnarmed)
		self:SetFirstPerson(false)
	end
	function InventoryEntityAnimator:LateUpdate()
		if not self.isFirstPerson then
			self:ForceLookForward()
		end
	end
	function InventoryEntityAnimator:Log(message)
		return nil
	end
	function InventoryEntityAnimator:ForceLookForward()
		self:ClampRotation(self.entityRef.spineBone1, self.spineClampAngle)
		self:ClampRotation(self.entityRef.spineBone2, self.spineClampAngle)
		-- this.ClampRotation(this.entityRef.spineBone3, this.spineClampAngle);
		self:ClampRotation(self.entityRef.neckBone, self.neckClampAngle)
	end
	function InventoryEntityAnimator:ClampRotation(spine, maxAngle)
		-- Take the world look and convert to this spines local space
		local _exp = Quaternion.Inverse(spine.parent.rotation)
		local _rotation = self.entityRef.root.rotation
		local targetLocalRot = _exp * _rotation
		-- Clamp the rotation so the spine doesn't appear broken
		local rotY = MathUtil:ClampAngle(targetLocalRot.eulerAngles.y, -maxAngle, maxAngle)
		spine.localEulerAngles = Vector3.new(spine.localEulerAngles.x, rotY, spine.localEulerAngles.z)
	end
	function InventoryEntityAnimator:SetFirstPerson(isFirstPerson)
		self.isFirstPerson = isFirstPerson
		self.bundleIndex = if isFirstPerson then 0 else 1
		if self.currentBundleName ~= BundleGroupNames.NONE then
			-- First person and third person use different animation bundles
			-- So we need to load the item resources again
			self:LoadNewItemResources(self.currentBundleName)
			self:StartItemIdle()
		end
	end
	function InventoryEntityAnimator:Play(clipKey, onEnd, wrapMode)
		if wrapMode == nil then
			wrapMode = 0
		end
		local clip = self.currentItemClips[clipKey + 1]
		if clip == nil then
			-- No animation for this event
			self.itemLayer:StartFade(0, self.defaultTransitionTime)
			return nil
		end
		self:Log("Playing Item Anim: " .. tostring(clipKey))
		self.itemLayer:StartFade(1, self.defaultTransitionTime)
		local state = self:PlayAnimation(clip, self.itemLayerIndex, wrapMode)
		if onEnd ~= nil then
			state.Events:OnEndTS(onEnd)
		end
	end
	function InventoryEntityAnimator:LoadNewItemResources(nextItemId)
		self:Log("Loading Item: " .. tostring(nextItemId))
		self.currentBundleName = nextItemId
		self.itemLayer:DestroyStates()
		-- Load the animation clips for the new item
		self.currentItemClips = BundleReferenceManager:LoadResources(nextItemId, self.bundleIndex)
	end
	function InventoryEntityAnimator:TriggerEvent(key, index)
		if index == nil then
			index = 0
		end
		self:Log("Trigger State: " .. tostring(key) .. " index: " .. tostring(index))
		self.currentItemState = key
		--[[
			eventData.eventKey = key;
			eventData.eventIndex = index;
			currentItem.OnAnimEvent(eventData);
		]]
	end
	function InventoryEntityAnimator:EquipItem(itemId)
		-- Have to animate out the current item before the new item can be added
		self:StartUnEquipAnim(itemId)
	end
	function InventoryEntityAnimator:StartUnEquipAnim(nextItemId)
		-- Right now we are ignoring unequipped and loading the new item instantly
		self:LoadNewItemResources(nextItemId)
		self:StartItemEquipAnim()
		--[[
			//Play the un-equip animation
			this.TriggerEvent(ItemEventKeys.UN_EQUIP);
			this.Play(ItemEventKeys.UN_EQUIP, () => {
			//Load the resources for the next item
			//this.LoadNewItemResources(nextItemId);
			this.StartItemEquipAnim();
			});
		]]
	end
	function InventoryEntityAnimator:StartItemEquipAnim()
		self:TriggerEvent(ItemEventKeys.EQUIP)
		self:Play(ItemEventKeys.EQUIP, function()
			self:StartItemIdle()
		end)
	end
	function InventoryEntityAnimator:StartItemIdle()
		self:TriggerEvent(ItemEventKeys.IDLE)
		self:Play(ItemEventKeys.IDLE)
	end
	function InventoryEntityAnimator:PlayItemUse(useIndex, itemPlayMode)
		if useIndex == nil then
			useIndex = 0
		end
		if itemPlayMode == nil then
			itemPlayMode = 0
		end
		-- In the animation array use animations are the 3rd index and beyond;
		local i = useIndex + 3
		if i >= 0 and i < #self.currentItemClips then
			self:TriggerEvent(ItemEventKeys.USE, useIndex)
			self:Play(i, function()
				if itemPlayMode == ItemPlayMode.DEFAULT then
					self:StartItemIdle()
				elseif itemPlayMode == ItemPlayMode.LOOP then
					self:PlayItemUse(useIndex, ItemPlayMode.LOOP)
				end
			end)
		else
			warn("Trying to play animation that doesn't exist: use " .. tostring(useIndex))
		end
	end
end
return {
	ItemEventKeys = ItemEventKeys,
	ItemPlayMode = ItemPlayMode,
	InventoryEntityAnimator = InventoryEntityAnimator,
}
-- ----------------------------------
-- ----------------------------------
