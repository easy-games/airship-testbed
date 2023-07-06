-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local PreferredDriver
do
	PreferredDriver = setmetatable({}, {
		__tostring = function()
			return "PreferredDriver"
		end,
	})
	PreferredDriver.__index = PreferredDriver
	function PreferredDriver.new(...)
		local self = setmetatable({}, PreferredDriver)
		return self:constructor(...) or self
	end
	function PreferredDriver:constructor()
		self.scheme = UserInputService.InputProxy:GetScheme()
		self.SchemeChanged = Signal.new()
		UserInputService.InputProxy:OnSchemeChangedEvent(function(scheme)
			self.scheme = scheme
			self.SchemeChanged:Fire(scheme)
		end)
	end
	function PreferredDriver:GetScheme()
		return self.scheme
	end
	function PreferredDriver:instance()
		if self.inst == nil then
			self.inst = PreferredDriver.new()
		end
		return self.inst
	end
end
return {
	PreferredDriver = PreferredDriver,
}
-- ----------------------------------
-- ----------------------------------
