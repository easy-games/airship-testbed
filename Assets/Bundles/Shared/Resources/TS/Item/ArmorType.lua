-- Compiled with unity-ts v2.1.0-75
local ArmorType
do
	local _inverse = {}
	ArmorType = setmetatable({}, {
		__index = _inverse,
	})
	ArmorType.HELMET = 0
	_inverse[0] = "HELMET"
	ArmorType.CHESTPLATE = 1
	_inverse[1] = "CHESTPLATE"
	ArmorType.BOOTS = 2
	_inverse[2] = "BOOTS"
end
return {
	ArmorType = ArmorType,
}
-- ----------------------------------
-- ----------------------------------
