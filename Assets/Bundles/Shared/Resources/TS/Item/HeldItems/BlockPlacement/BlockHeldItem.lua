-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local HeldItem = require("Shared/TS/Item/HeldItems/HeldItem").HeldItem
-- Dependencies
local BlockHeldItem
do
	local super = HeldItem
	BlockHeldItem = setmetatable({}, {
		__tostring = function()
			return "BlockHeldItem"
		end,
		__index = super,
	})
	BlockHeldItem.__index = BlockHeldItem
	function BlockHeldItem.new(...)
		local self = setmetatable({}, BlockHeldItem)
		return self:constructor(...) or self
	end
	function BlockHeldItem:constructor(...)
		super.constructor(self, ...)
		self.characterLayerMask = LayerMask:GetMask("Character")
	end
	function BlockHeldItem:OnEquip()
		super.OnEquip(self)
		if self.entity:IsLocalCharacter() then
			(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")):Enable()
		end
	end
	function BlockHeldItem:OnUnEquip()
		super.OnUnEquip(self)
		if self.entity:IsLocalCharacter() then
			(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")):Disable()
		end
	end
	function BlockHeldItem:OnUseClient(useIndex)
		-- Only run for local player
		if self.entity:IsLocalCharacter() then
			-- Try to place a block
			if self:TryPlaceBlock() then
				-- Only play use animations if we actually think we can place a block
				super.OnUseClient(self, useIndex)
			end
		end
	end
	function BlockHeldItem:TryPlaceBlock()
		if not self.meta.block then
			return false
		end
		local blockSelectController = Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")
		local placePosition = blockSelectController.PlaceBlockPosition
		local isVoidPlacement = blockSelectController.IsVoidPlacement
		if not placePosition then
			return false
		end
		-- Make sure this position is valid within the playable area
		if (Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/DenyRegionController@DenyRegionController")):InDenyRegion(placePosition) then
			return false
		end
		-- Prevent placing in an entity's head
		-- const collider = this.entity.references.characterCollider;
		-- const bounds = collider.bounds;
		-- const size = bounds.size;
		local _fn = Physics
		local _vector3 = Vector3.new(0.5, 0.5, 0.5)
		local colliders = _fn:OverlapBox(placePosition + _vector3, Vector3.new(0.5, 0.5, 0.5), Quaternion.identity, self.characterLayerMask)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < colliders.Length) then
					break
				end
				local collider = colliders:GetValue(i)
				local center = collider.bounds.center
				if placePosition.y + 0.5 > center.y then
					return false
				end
			end
		end
		-- Write the voxel at the predicted position
		WorldAPI:GetMainWorld():PlaceBlockById(placePosition, self.meta.block.blockId, {
			placedByEntityId = self.entity.id,
		});
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")):AddToMoveData("PlaceBlock", {
			pos = placePosition,
			itemType = self.meta.ItemType,
		})
		if isVoidPlacement then
			blockSelectController:PlacedVoidBridgeBlock()
		end
		return true
	end
end
return {
	BlockHeldItem = BlockHeldItem,
}
-- ----------------------------------
-- ----------------------------------
