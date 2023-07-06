-- Compiled with unity-ts v2.1.0-75
local BedWars = require("Shared/TS/BedWars/BedWars").BedWars
local TeamUpgradeType = require("Shared/TS/TeamUpgrades/TeamUpgradeType").TeamUpgradeType
local TeamUpgradeUtil = require("Shared/TS/TeamUpgrades/TeamUpgradeUtil").TeamUpgradeUtil
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local BlockArchetype = require("Shared/TS/Item/ItemMeta").BlockArchetype
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
--[[
	*
	* Will return 0 if can't damage.
]]
local function BlockHitDamageCalc(player, blockPos, breakBlockMeta)
	local damage = breakBlockMeta.damage
	if BedWars:IsMatchServer() then
		-- BedWars: disable breaking map blocks
		local wasPlacedByUser = VoxelDataAPI:GetVoxelData(blockPos, "placedByUser")
		if not wasPlacedByUser then
			return 0
		end
		-- BedWars: dont allow breaking your own team's bed
		local teamBlockId = VoxelDataAPI:GetVoxelData(blockPos, "teamId")
		local _condition = teamBlockId ~= nil
		if _condition then
			local _result = player:GetTeam()
			if _result ~= nil then
				_result = _result.id
			end
			_condition = teamBlockId == _result
		end
		if _condition then
			return 0
		end
		local blockMeta = WorldAPI:GetMainWorld():GetBlockAt(blockPos).itemMeta
		local _condition_1 = breakBlockMeta.extraDamageBlockArchetype ~= BlockArchetype.NONE
		if _condition_1 then
			local _result = blockMeta
			if _result ~= nil then
				_result = _result.block
				if _result ~= nil then
					_result = _result.blockArchetype
				end
			end
			_condition_1 = _result == breakBlockMeta.extraDamageBlockArchetype
		end
		if _condition_1 then
			damage += breakBlockMeta.extraDamage
		end
		local breakSpeedState = TeamUpgradeUtil:GetUpgradeStateForPlayer(TeamUpgradeType.BREAK_SPEED, player)
		if breakSpeedState and breakSpeedState.currentUpgradeTier > 0 then
			local breakSpeedValue = TeamUpgradeUtil:GetUpgradeTierForType(TeamUpgradeType.BREAK_SPEED, breakSpeedState.currentUpgradeTier).value
			damage *= 1 + breakSpeedValue / 100
		end
	end
	return damage
end
return {
	BlockHitDamageCalc = BlockHitDamageCalc,
}
-- ----------------------------------
-- ----------------------------------
