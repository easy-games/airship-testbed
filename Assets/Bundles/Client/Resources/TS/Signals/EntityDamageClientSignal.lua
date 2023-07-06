-- Compiled with unity-ts v2.1.0-75
local EntityDamageClientSignal
do
	EntityDamageClientSignal = setmetatable({}, {
		__tostring = function()
			return "EntityDamageClientSignal"
		end,
	})
	EntityDamageClientSignal.__index = EntityDamageClientSignal
	function EntityDamageClientSignal.new(...)
		local self = setmetatable({}, EntityDamageClientSignal)
		return self:constructor(...) or self
	end
	function EntityDamageClientSignal:constructor(entity, amount, damageType, fromEntity)
		self.entity = entity
		self.amount = amount
		self.damageType = damageType
		self.fromEntity = fromEntity
	end
end
return {
	EntityDamageClientSignal = EntityDamageClientSignal,
}
-- ----------------------------------
-- ----------------------------------
