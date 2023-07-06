-- Compiled with unity-ts v2.1.0-75
local Cancellable = require("Shared/TS/Util/Cancellable").Cancellable
local EntityDamageServerSignal
do
	local super = Cancellable
	EntityDamageServerSignal = setmetatable({}, {
		__tostring = function()
			return "EntityDamageServerSignal"
		end,
		__index = super,
	})
	EntityDamageServerSignal.__index = EntityDamageServerSignal
	function EntityDamageServerSignal.new(...)
		local self = setmetatable({}, EntityDamageServerSignal)
		return self:constructor(...) or self
	end
	function EntityDamageServerSignal:constructor(entity, amount, damageType, fromEntity)
		super.constructor(self)
		self.entity = entity
		self.amount = amount
		self.damageType = damageType
		self.fromEntity = fromEntity
	end
end
return {
	EntityDamageServerSignal = EntityDamageServerSignal,
}
-- ----------------------------------
-- ----------------------------------
