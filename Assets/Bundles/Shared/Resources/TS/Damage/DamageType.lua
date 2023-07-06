-- Compiled with unity-ts v2.1.0-75
local DamageType
do
	local _inverse = {}
	DamageType = setmetatable({}, {
		__index = _inverse,
	})
	DamageType.VOID = 0
	_inverse[0] = "VOID"
	DamageType.SWORD = 1
	_inverse[1] = "SWORD"
	DamageType.PROJECTILE = 2
	_inverse[2] = "PROJECTILE"
	DamageType.FALL = 3
	_inverse[3] = "FALL"
end
return {
	DamageType = DamageType,
}
-- ----------------------------------
-- ----------------------------------
