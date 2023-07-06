-- Compiled with unity-ts v2.1.0-75
local EntitySerializer
do
	local _inverse = {}
	EntitySerializer = setmetatable({}, {
		__index = _inverse,
	})
	EntitySerializer.DEFAULT = 0
	_inverse[0] = "DEFAULT"
	EntitySerializer.CHARACTER = 1
	_inverse[1] = "CHARACTER"
end
return {
	EntitySerializer = EntitySerializer,
}
-- ----------------------------------
-- ----------------------------------
