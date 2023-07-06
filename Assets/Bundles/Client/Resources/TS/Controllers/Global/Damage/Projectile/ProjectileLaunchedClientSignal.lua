-- Compiled with unity-ts v2.1.0-75
local ProjectileLaunchedClientSignal
do
	ProjectileLaunchedClientSignal = setmetatable({}, {
		__tostring = function()
			return "ProjectileLaunchedClientSignal"
		end,
	})
	ProjectileLaunchedClientSignal.__index = ProjectileLaunchedClientSignal
	function ProjectileLaunchedClientSignal.new(...)
		local self = setmetatable({}, ProjectileLaunchedClientSignal)
		return self:constructor(...) or self
	end
	function ProjectileLaunchedClientSignal:constructor(projectile)
		self.projectile = projectile
	end
end
return {
	ProjectileLaunchedClientSignal = ProjectileLaunchedClientSignal,
}
-- ----------------------------------
-- ----------------------------------
