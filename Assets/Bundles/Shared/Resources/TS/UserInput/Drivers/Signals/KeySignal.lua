-- Compiled with unity-ts v2.1.0-75
local Cancellable = require("Shared/TS/Util/Cancellable").Cancellable
local KeySignal
do
	local super = Cancellable
	KeySignal = setmetatable({}, {
		__tostring = function()
			return "KeySignal"
		end,
		__index = super,
	})
	KeySignal.__index = KeySignal
	function KeySignal.new(...)
		local self = setmetatable({}, KeySignal)
		return self:constructor(...) or self
	end
	function KeySignal:constructor(Key)
		super.constructor(self)
		self.Key = Key
	end
end
return {
	KeySignal = KeySignal,
}
-- ----------------------------------
-- ----------------------------------
