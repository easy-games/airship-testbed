-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local MobileJoystickDriver
do
	MobileJoystickDriver = setmetatable({}, {
		__tostring = function()
			return "MobileJoystickDriver"
		end,
	})
	MobileJoystickDriver.__index = MobileJoystickDriver
	function MobileJoystickDriver.new(...)
		local self = setmetatable({}, MobileJoystickDriver)
		return self:constructor(...) or self
	end
	function MobileJoystickDriver:constructor()
		self.Changed = Signal.new()
		UserInputService.InputProxy:OnMobileJoystickEvent(function(position, phase)
			self.Changed:Fire(position, phase)
		end)
	end
	function MobileJoystickDriver:SetVisible(visible)
		UserInputService.InputProxy:SetMobileJoystickVisible(visible)
	end
	function MobileJoystickDriver:IsVisible()
		return UserInputService.InputProxy:IsMobileJoystickVisible()
	end
	function MobileJoystickDriver:instance()
		if self.inst == nil then
			self.inst = MobileJoystickDriver.new()
		end
		return self.inst
	end
end
return {
	MobileJoystickDriver = MobileJoystickDriver,
}
-- ----------------------------------
-- ----------------------------------
