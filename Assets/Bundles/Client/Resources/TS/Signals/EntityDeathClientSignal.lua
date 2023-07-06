-- Compiled with unity-ts v2.1.0-75
local EntityDeathClientSignal
do
	EntityDeathClientSignal = setmetatable({}, {
		__tostring = function()
			return "EntityDeathClientSignal"
		end,
	})
	EntityDeathClientSignal.__index = EntityDeathClientSignal
	function EntityDeathClientSignal.new(...)
		local self = setmetatable({}, EntityDeathClientSignal)
		return self:constructor(...) or self
	end
	function EntityDeathClientSignal:constructor(entity, damageType, fromEntity)
		self.entity = entity
		self.damageType = damageType
		self.fromEntity = fromEntity
	end
end
return {
	EntityDeathClientSignal = EntityDeathClientSignal,
}
-- ----------------------------------
-- ----------------------------------
