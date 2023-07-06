-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local SignalProxy = require("Shared/TS/Util/SignalProxy").SignalProxy
local KeyboardDriver = require("Shared/TS/UserInput/Drivers/KeyboardDriver").KeyboardDriver
local Keyboard
do
	Keyboard = setmetatable({}, {
		__tostring = function()
			return "Keyboard"
		end,
	})
	Keyboard.__index = Keyboard
	function Keyboard.new(...)
		local self = setmetatable({}, Keyboard)
		return self:constructor(...) or self
	end
	function Keyboard:constructor()
		self.bin = Bin.new()
		self.keyboardDriver = KeyboardDriver:instance()
		self.keysDown = {}
		self.KeyUp = Signal.new()
		self.KeyDown = self.bin:Add(SignalProxy.new(self.keyboardDriver.KeyDown))
		self.bin:Add(self.KeyDown)
		self.bin:Add(self.KeyUp)
		self.bin:Connect(self.keyboardDriver.KeyDown, function(key)
			local _keysDown = self.keysDown
			local _key = key.Key
			_keysDown[_key] = true
			self.KeyDown:Fire(key)
		end)
		self.bin:Connect(self.keyboardDriver.KeyUp, function(key)
			local _keysDown = self.keysDown
			local _key = key.Key
			_keysDown[_key] = false
			self.KeyUp:Fire(key)
		end)
	end
	function Keyboard:IsKeyDown(key)
		local _keysDown = self.keysDown
		local _key = key
		local keyDown = _keysDown[_key]
		if keyDown == nil then
			keyDown = self.keyboardDriver:IsKeyDown(key)
			local _keysDown_1 = self.keysDown
			local _key_1 = key
			local _keyDown = keyDown
			_keysDown_1[_key_1] = _keyDown
		end
		return keyDown
	end
	function Keyboard:IsEitherKeyDown(key1, key2)
		return self:IsKeyDown(key1) or self:IsKeyDown(key2)
	end
	function Keyboard:AreBothKeysDown(key1, key2)
		return self:IsKeyDown(key1) and self:IsKeyDown(key2)
	end
	function Keyboard:Destroy()
		self.bin:Destroy()
	end
end
return {
	Keyboard = Keyboard,
}
-- ----------------------------------
-- ----------------------------------
