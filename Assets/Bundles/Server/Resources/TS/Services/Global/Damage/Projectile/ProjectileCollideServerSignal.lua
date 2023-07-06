-- Compiled with unity-ts v2.1.0-75
local ProjectileCollideServerSignal
do
	ProjectileCollideServerSignal = setmetatable({}, {
		__tostring = function()
			return "ProjectileCollideServerSignal"
		end,
	})
	ProjectileCollideServerSignal.__index = ProjectileCollideServerSignal
	function ProjectileCollideServerSignal.new(...)
		local self = setmetatable({}, ProjectileCollideServerSignal)
		return self:constructor(...) or self
	end
	function ProjectileCollideServerSignal:constructor(projectile, baseDamage, hitPosition, normal, velocity, hitEntity)
		self.projectile = projectile
		self.baseDamage = baseDamage
		self.hitPosition = hitPosition
		self.normal = normal
		self.velocity = velocity
		self.hitEntity = hitEntity
		self.damage = baseDamage
	end
end
return {
	ProjectileCollideServerSignal = ProjectileCollideServerSignal,
}
-- ----------------------------------
-- ----------------------------------
