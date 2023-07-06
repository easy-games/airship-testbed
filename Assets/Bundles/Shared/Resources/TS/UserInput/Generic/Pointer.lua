-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Touchscreen = require("Shared/TS/UserInput/Touchscreen").Touchscreen
local Mouse = require("Shared/TS/UserInput/Mouse").Mouse
local Signal = require("Shared/TS/Util/Signal").Signal
local Pointer
do
	Pointer = setmetatable({}, {
		__tostring = function()
			return "Pointer"
		end,
	})
	Pointer.__index = Pointer
	function Pointer.new(...)
		local self = setmetatable({}, Pointer)
		return self:constructor(...) or self
	end
	function Pointer:constructor()
		self.bin = Bin.new()
		self.touchscreen = Touchscreen.new()
		self.mouse = Mouse.new()
		self.Down = Signal.new()
		self.Up = Signal.new()
		self.Moved = Signal.new()
		self.bin:Add(self.touchscreen)
		self.bin:Add(self.mouse)
		self.bin:Add(self.mouse.LeftDown:Proxy(self.Down))
		self.bin:Add(self.mouse.LeftUp:Proxy(self.Up))
		self.bin:Add(self.mouse.Moved:Proxy(self.Moved))
		self.bin:Connect(self.touchscreen.PrimaryTouch, function(location, phase)
			repeat
				if phase == 1 then
					self.Down:Fire()
					break
				end
				if phase == 3 then
					self.Up:Fire()
					break
				end
				if phase == 2 then
					self.Moved:Fire(location)
					break
				end
			until true
		end)
		self.bin:Add(self.Down)
		self.bin:Add(self.Up)
		self.bin:Add(self.Moved)
	end
	function Pointer:Destroy()
		self.bin:Destroy()
	end
end
return {
	Pointer = Pointer,
}
-- ----------------------------------
-- ----------------------------------
