-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local BlockHitDamageCalc = require("Shared/TS/Block/BlockHitDamageCalc").BlockHitDamageCalc
local Game = require("Shared/TS/Game").Game
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local HeldItem = require("Shared/TS/Item/HeldItems/HeldItem").HeldItem
-- Dependencies
local BreakBlockHeldItem
do
	local super = HeldItem
	BreakBlockHeldItem = setmetatable({}, {
		__tostring = function()
			return "BreakBlockHeldItem"
		end,
		__index = super,
	})
	BreakBlockHeldItem.__index = BreakBlockHeldItem
	function BreakBlockHeldItem.new(...)
		local self = setmetatable({}, BreakBlockHeldItem)
		return self:constructor(...) or self
	end
	function BreakBlockHeldItem:constructor(...)
		super.constructor(self, ...)
	end
	function BreakBlockHeldItem:OnEquip()
		super.OnEquip(self)
		if self.entity:IsLocalCharacter() then
			(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")):Enable()
		end
	end
	function BreakBlockHeldItem:OnUnEquip()
		super.OnUnEquip(self)
		if self.entity:IsLocalCharacter() then
			(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")):Disable()
		end
	end
	function BreakBlockHeldItem:OnUseClient(useIndex)
		super.OnUseClient(self, useIndex)
		if self.entity:IsLocalCharacter() then
			self:HitBlockLocal()
		end
	end
	function BreakBlockHeldItem:HitBlockLocal()
		local voxelPos = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")).SelectedBlockPosition
		if not voxelPos then
			return nil
		end
		local world = WorldAPI:GetMainWorld()
		local block = world:GetBlockAt(voxelPos);
		-- Pass along event data =
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockHealthController@BlockHealthController")):OnBeforeBlockHit(voxelPos, block);
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")):AddToMoveData("HitBlock", voxelPos)
		if self.entity.player and self.meta.breakBlock then
			-- Check to see if we can actually do damage here
			if BlockHitDamageCalc(self.entity.player, voxelPos, self.meta.breakBlock) > 0 then
				-- Do the actual damage
				local damage = BlockHitDamageCalc(Game.LocalPlayer, voxelPos, self.meta.breakBlock)
				local _condition = VoxelDataAPI:GetVoxelData(voxelPos, "health")
				if _condition == nil then
					_condition = WorldAPI.DefaultVoxelHealth
				end
				local health = _condition
				local blockType = WorldAPI:GetMainWorld():GetBlockAt(voxelPos).itemType
				local newHealth = math.max(health - damage, 0)
				VoxelDataAPI:SetVoxelData(voxelPos, "health", newHealth)
				if newHealth == 0 then
					-- Destroy block
					world:PlaceBlockById(voxelPos, 0);
					-- Local Client visualization
					(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockHealthController@BlockHealthController")):VisualizeBlockBreak(voxelPos, block.blockId)
				else
					-- Local Client visualization
					(Flamework.resolveDependency("Bundles/Client/Controllers/Global/BlockInteractions/BlockHealthController@BlockHealthController")):VisualizeBlockHealth(voxelPos)
				end
			end
		end
		if self.meta.breakBlock then
		end
	end
end
return {
	BreakBlockHeldItem = BreakBlockHeldItem,
}
-- ----------------------------------
-- ----------------------------------
