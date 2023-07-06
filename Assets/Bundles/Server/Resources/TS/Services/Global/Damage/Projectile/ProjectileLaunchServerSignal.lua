-- Compiled with unity-ts v2.1.0-75
local ProjectileLaunchedServerSignal
do
	ProjectileLaunchedServerSignal = setmetatable({}, {
		__tostring = function()
			return "ProjectileLaunchedServerSignal"
		end,
	})
	ProjectileLaunchedServerSignal.__index = ProjectileLaunchedServerSignal
	function ProjectileLaunchedServerSignal.new(...)
		local self = setmetatable({}, ProjectileLaunchedServerSignal)
		return self:constructor(...) or self
	end
	function ProjectileLaunchedServerSignal:constructor(projectile)
		self.projectile = projectile
	end
end
return {
	ProjectileLaunchedServerSignal = ProjectileLaunchedServerSignal,
}
-- ----------------------------------
-- ----------------------------------
