-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local TouchscreenDriver
do
	TouchscreenDriver = setmetatable({}, {
		__tostring = function()
			return "TouchscreenDriver"
		end,
	})
	TouchscreenDriver.__index = TouchscreenDriver
	function TouchscreenDriver.new(...)
		local self = setmetatable({}, TouchscreenDriver)
		return self:constructor(...) or self
	end
	function TouchscreenDriver:constructor()
		self.Touch = Signal.new()
		self.TouchTap = Signal.new()
		UserInputService.InputProxy:OnTouchEvent(function(touchIndex, position, phase)
			self.Touch:Fire(touchIndex, position, phase)
		end)
		UserInputService.InputProxy:OnTouchTapEvent(function(touchIndex, position, phase)
			self.TouchTap:Fire(touchIndex, position, phase)
		end)
	end
	function TouchscreenDriver:instance()
		if self.inst == nil then
			self.inst = TouchscreenDriver.new()
		end
		return self.inst
	end
end
return {
	TouchscreenDriver = TouchscreenDriver,
}
-- ----------------------------------
-- ----------------------------------
