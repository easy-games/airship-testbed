-- Compiled with unity-ts v2.1.0-75
-- * Types of team upgrades.
local TeamUpgradeType
do
	local _inverse = {}
	TeamUpgradeType = setmetatable({}, {
		__index = _inverse,
	})
	TeamUpgradeType.TEAM_GENERATOR = "TeamGenerator"
	_inverse.TeamGenerator = "TEAM_GENERATOR"
	TeamUpgradeType.DIAMOND_GENERATOR = "DiamondGenerator"
	_inverse.DiamondGenerator = "DIAMOND_GENERATOR"
	TeamUpgradeType.DAMAGE = "Damage"
	_inverse.Damage = "DAMAGE"
	TeamUpgradeType.ARMOR_PROTECTION = "ArmorProtection"
	_inverse.ArmorProtection = "ARMOR_PROTECTION"
	TeamUpgradeType.BREAK_SPEED = "BreakSpeed"
	_inverse.BreakSpeed = "BREAK_SPEED"
end
return {
	TeamUpgradeType = TeamUpgradeType,
}
-- ----------------------------------
-- ----------------------------------
