-- Compiled with unity-ts v2.1.0-75
local BlockArchetype
do
	local _inverse = {}
	BlockArchetype = setmetatable({}, {
		__index = _inverse,
	})
	BlockArchetype.NONE = 0
	_inverse[0] = "NONE"
	BlockArchetype.STONE = 1
	_inverse[1] = "STONE"
	BlockArchetype.WOOD = 2
	_inverse[2] = "WOOD"
	BlockArchetype.WOOL = 3
	_inverse[3] = "WOOL"
end
return {
	BlockArchetype = BlockArchetype,
}
-- ----------------------------------
-- ----------------------------------
