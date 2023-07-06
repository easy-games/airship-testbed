-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local teamUpgrades = require("Shared/TS/TeamUpgrades/TeamUpgradeMeta").teamUpgrades
-- * Set of utilities for interfacing team upgrades.
local TeamUpgradeUtil
do
	TeamUpgradeUtil = setmetatable({}, {
		__tostring = function()
			return "TeamUpgradeUtil"
		end,
	})
	TeamUpgradeUtil.__index = TeamUpgradeUtil
	function TeamUpgradeUtil.new(...)
		local self = setmetatable({}, TeamUpgradeUtil)
		return self:constructor(...) or self
	end
	function TeamUpgradeUtil:constructor()
	end
	function TeamUpgradeUtil:GetTeamUpgradeMeta(teamUpgradeType)
		return teamUpgrades[teamUpgradeType]
	end
	function TeamUpgradeUtil:GetUpgradeTierCountForType(teamUpgradeType)
		local upgradeMeta = TeamUpgradeUtil:GetTeamUpgradeMeta(teamUpgradeType)
		return #upgradeMeta.tiers
	end
	function TeamUpgradeUtil:GetUpgradeTierForType(teamUpgradeType, tier)
		local upgradeMeta = TeamUpgradeUtil:GetTeamUpgradeMeta(teamUpgradeType)
		local tiersInType = TeamUpgradeUtil:GetUpgradeTierCountForType(teamUpgradeType)
		local targetTier = math.clamp(tier, 1, tiersInType)
		return upgradeMeta.tiers[targetTier - 1 + 1]
	end
	function TeamUpgradeUtil:NumericTierToRomanNumeralTier(tier)
		if tier == 1 then
			return "TierI"
		end
		if tier == 2 then
			return "TierII"
		end
		if tier == 3 then
			return "TierIII"
		end
		return nil
	end
	function TeamUpgradeUtil:GetUpgradeStateForPlayer(upgradeType, player)
		if RunUtil:IsClient() then
			local _localUpgradeMap = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/TeamUpgrade/TeamUpgradeController@TeamUpgradeController")).localUpgradeMap
			local _upgradeType = upgradeType
			return _localUpgradeMap[_upgradeType]
		else
			return (Flamework.resolveDependency("Bundles/Server/Services/Match/TeamUpgradeService@TeamUpgradeService")):GetUpgradeStateForPlayer(player, upgradeType)
		end
	end
end
return {
	TeamUpgradeUtil = TeamUpgradeUtil,
}
-- ----------------------------------
-- ----------------------------------
