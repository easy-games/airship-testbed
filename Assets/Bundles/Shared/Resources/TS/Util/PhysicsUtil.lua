-- Compiled with unity-ts v2.1.0-75
local PhysicsUtil
do
	PhysicsUtil = setmetatable({}, {
		__tostring = function()
			return "PhysicsUtil"
		end,
	})
	PhysicsUtil.__index = PhysicsUtil
	function PhysicsUtil.new(...)
		local self = setmetatable({}, PhysicsUtil)
		return self:constructor(...) or self
	end
	function PhysicsUtil:constructor()
	end
	PhysicsUtil.Gravity = -54.936
end
return {
	PhysicsUtil = PhysicsUtil,
}
-- ----------------------------------
-- ----------------------------------
