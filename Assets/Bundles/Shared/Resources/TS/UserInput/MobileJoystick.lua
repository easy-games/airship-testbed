-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local MobileJoystickDriver = require("Shared/TS/UserInput/Drivers/MobileJoystickDriver").MobileJoystickDriver
local MobileJoystick
do
	MobileJoystick = setmetatable({}, {
		__tostring = function()
			return "MobileJoystick"
		end,
	})
	MobileJoystick.__index = MobileJoystick
	function MobileJoystick.new(...)
		local self = setmetatable({}, MobileJoystick)
		return self:constructor(...) or self
	end
	function MobileJoystick:constructor()
		self.bin = Bin.new()
		self.mobileJoystickDriver = MobileJoystickDriver:instance()
		self.Changed = Signal.new()
		self.bin:Add(self.Changed)
		self.bin:Add(self.mobileJoystickDriver.Changed:Proxy(self.Changed))
	end
	function MobileJoystick:IsVisible()
		return self.mobileJoystickDriver:IsVisible()
	end
	function MobileJoystick:SetVisible(visible)
		self.mobileJoystickDriver:SetVisible(visible)
	end
	function MobileJoystick:Destroy()
		self.bin:Destroy()
	end
end
return {
	MobileJoystick = MobileJoystick,
}
-- ----------------------------------
-- ----------------------------------
