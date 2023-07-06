-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local GestureDriver = require("Shared/TS/UserInput/Drivers/GestureDriver").GestureDriver
local TouchscreenDriver = require("Shared/TS/UserInput/Drivers/TouchscreenDriver").TouchscreenDriver
local Touchscreen
do
	Touchscreen = setmetatable({}, {
		__tostring = function()
			return "Touchscreen"
		end,
	})
	Touchscreen.__index = Touchscreen
	function Touchscreen.new(...)
		local self = setmetatable({}, Touchscreen)
		return self:constructor(...) or self
	end
	function Touchscreen:constructor()
		self.bin = Bin.new()
		self.touchscreenDriver = TouchscreenDriver:instance()
		self.gestureDriver = GestureDriver.new()
		self.Touch = Signal.new()
		self.TouchTap = Signal.new()
		self.PrimaryTouch = Signal.new()
		self.PrimaryTouchTap = Signal.new()
		self.Pan = Signal.new()
		self.Pinch = Signal.new()
		self.bin:Add(self.Touch)
		self.bin:Add(self.TouchTap)
		self.bin:Add(self.PrimaryTouch)
		self.bin:Add(self.PrimaryTouchTap)
		self.bin:Add(self.Pan)
		self.bin:Add(self.Pinch)
		self.bin:Connect(self.touchscreenDriver.Touch, function(touchIndex, position, phase)
			self.Touch:Fire(touchIndex, position, phase)
			if touchIndex == 0 then
				self.PrimaryTouch:Fire(position, phase)
			end
		end)
		self.bin:Connect(self.touchscreenDriver.TouchTap, function(touchIndex, position, phase)
			self.TouchTap:Fire(touchIndex, position, phase)
			if touchIndex == 0 then
				self.PrimaryTouchTap:Fire(position, phase)
			end
		end)
		self.bin:Add(self.gestureDriver)
		self.bin:Add(self.gestureDriver.Pan:Proxy(self.Pan))
		self.bin:Add(self.gestureDriver.Pinch:Proxy(self.Pinch))
	end
	function Touchscreen:Destroy()
		self.bin:Destroy()
	end
end
return {
	Touchscreen = Touchscreen,
}
-- ----------------------------------
-- ----------------------------------
