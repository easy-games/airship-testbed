-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local KeySignal = require("Shared/TS/UserInput/Drivers/Signals/KeySignal").KeySignal
local KeyboardDriver
do
	KeyboardDriver = setmetatable({}, {
		__tostring = function()
			return "KeyboardDriver"
		end,
	})
	KeyboardDriver.__index = KeyboardDriver
	function KeyboardDriver.new(...)
		local self = setmetatable({}, KeyboardDriver)
		return self:constructor(...) or self
	end
	function KeyboardDriver:constructor()
		self.KeyDown = Signal.new()
		self.KeyUp = Signal.new()
		UserInputService.InputProxy:OnKeyPressEvent(function(key, isDown)
			if isDown then
				self.KeyDown:Fire(KeySignal.new(key))
			else
				self.KeyUp:Fire(KeySignal.new(key))
			end
		end)
	end
	function KeyboardDriver:IsKeyDown(key)
		return UserInputService.InputProxy:IsKeyDown(key)
	end
	function KeyboardDriver:instance()
		if self.inst == nil then
			self.inst = KeyboardDriver.new()
		end
		return self.inst
	end
end
return {
	KeyboardDriver = KeyboardDriver,
}
-- ----------------------------------
-- ----------------------------------
