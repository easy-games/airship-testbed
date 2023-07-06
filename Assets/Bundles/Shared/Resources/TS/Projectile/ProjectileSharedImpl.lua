-- Compiled with unity-ts v2.1.0-75
local ProjectileSharedImpl
do
	ProjectileSharedImpl = setmetatable({}, {
		__tostring = function()
			return "ProjectileSharedImpl"
		end,
	})
	ProjectileSharedImpl.__index = ProjectileSharedImpl
	function ProjectileSharedImpl.new(...)
		local self = setmetatable({}, ProjectileSharedImpl)
		return self:constructor(...) or self
	end
	function ProjectileSharedImpl:constructor()
	end
	function ProjectileSharedImpl:ShouldIgnoreCollision(projectile, hitPoint, velocity, collider)
		return false
	end
end
return {
	ProjectileSharedImpl = ProjectileSharedImpl,
}
-- ----------------------------------
-- ----------------------------------
