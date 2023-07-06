-- Compiled with unity-ts v2.1.0-75
local ProjectileCollideClientSignal
do
	ProjectileCollideClientSignal = setmetatable({}, {
		__tostring = function()
			return "ProjectileCollideClientSignal"
		end,
	})
	ProjectileCollideClientSignal.__index = ProjectileCollideClientSignal
	function ProjectileCollideClientSignal.new(...)
		local self = setmetatable({}, ProjectileCollideClientSignal)
		return self:constructor(...) or self
	end
	function ProjectileCollideClientSignal:constructor(projectile, hitPosition, normal, velocity, hitEntity)
		self.projectile = projectile
		self.hitPosition = hitPosition
		self.normal = normal
		self.velocity = velocity
		self.hitEntity = hitEntity
	end
end
return {
	ProjectileCollideClientSignal = ProjectileCollideClientSignal,
}
-- ----------------------------------
-- ----------------------------------
