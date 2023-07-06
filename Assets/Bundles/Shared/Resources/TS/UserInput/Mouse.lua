-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
local MouseDriver = require("Shared/TS/UserInput/Drivers/MouseDriver").MouseDriver
local mouseUnlockerKeys = {}
local mouseUnlockerIdCounter = 1
local Mouse
do
	Mouse = setmetatable({}, {
		__tostring = function()
			return "Mouse"
		end,
	})
	Mouse.__index = Mouse
	function Mouse.new(...)
		local self = setmetatable({}, Mouse)
		return self:constructor(...) or self
	end
	function Mouse:constructor()
		self.bin = Bin.new()
		self.mouseDriver = MouseDriver:instance()
		self.LeftDown = Signal.new()
		self.LeftUp = Signal.new()
		self.RightDown = Signal.new()
		self.RightUp = Signal.new()
		self.MiddleDown = Signal.new()
		self.MiddleUp = Signal.new()
		self.Scrolled = Signal.new()
		self.Moved = Signal.new()
		self.Delta = Signal.new()
		self.isLeftDown = false
		self.isRightDown = false
		self.isMiddleDown = false
		self.location = Vector3.new(0, 0, 0)
		-- Track signals in bin:
		self.bin:Add(self.LeftDown)
		self.bin:Add(self.LeftUp)
		self.bin:Add(self.RightDown)
		self.bin:Add(self.RightUp)
		self.bin:Add(self.LeftDown)
		self.bin:Add(self.LeftUp)
		self.bin:Add(self.Scrolled)
		self.bin:Add(self.Moved)
		self.bin:Add(self.Delta)
		-- Initial states:
		self.isLeftDown = self.mouseDriver:IsLeftDown()
		self.isRightDown = self.mouseDriver:IsRightDown()
		self.isMiddleDown = self.mouseDriver:IsMiddleDown()
		self.location = self.mouseDriver:GetLocation()
		-- ▼ ReadonlySet.size ▼
		local _size = 0
		for _ in mouseUnlockerKeys do
			_size += 1
		end
		-- ▲ ReadonlySet.size ▲
		if _size == 0 then
			self.mouseDriver:SetLocked(true)
		end
		-- Connect to mouse driver:
		self.bin:Connect(self.mouseDriver.LeftButtonChanged, function(isDown)
			self.isLeftDown = isDown
			if isDown then
				self.LeftDown:Fire()
			else
				self.LeftUp:Fire()
			end
		end)
		self.bin:Connect(self.mouseDriver.RightButtonChanged, function(isDown)
			self.isRightDown = isDown
			if isDown then
				self.RightDown:Fire()
			else
				self.RightUp:Fire()
			end
		end)
		self.bin:Connect(self.mouseDriver.MiddleButtonChanged, function(isDown)
			self.isMiddleDown = isDown
			if isDown then
				self.MiddleDown:Fire()
			else
				self.MiddleUp:Fire()
			end
		end)
		self.bin:Connect(self.mouseDriver.Moved, function(location)
			self.location = location
			self.Moved:Fire(location)
		end)
		self.bin:Connect(self.mouseDriver.Delta, function(delta)
			self.Delta:Fire(delta)
		end)
		self.bin:Connect(self.mouseDriver.Scrolled, function(delta)
			self.Scrolled:Fire(delta)
		end)
	end
	function Mouse:IsLeftButtonDown()
		return self.isLeftDown
	end
	function Mouse:IsRightButtonDown()
		return self.isRightDown
	end
	function Mouse:IsMiddleButtonDown()
		return self.isMiddleDown
	end
	function Mouse:GetLocation()
		return self.location
	end
	function Mouse:SetLocation(position)
		self.mouseDriver:SetLocation(position)
	end
	function Mouse:GetDelta()
		return self.mouseDriver:GetDelta()
	end
	function Mouse:AddUnlocker()
		local id = mouseUnlockerIdCounter
		mouseUnlockerIdCounter += 1
		self.mouseDriver:SetLocked(false)
		return id
	end
	function Mouse:RemoveUnlocker(id)
		local _id = id
		mouseUnlockerKeys[_id] = nil
		-- ▼ ReadonlySet.size ▼
		local _size = 0
		for _ in mouseUnlockerKeys do
			_size += 1
		end
		-- ▲ ReadonlySet.size ▲
		if _size == 0 then
			self.mouseDriver:SetLocked(true)
		end
	end
	function Mouse:ClearAllLockers()
		table.clear(mouseUnlockerKeys)
		self.mouseDriver:SetLocked(true)
	end
	function Mouse:IsLocked()
		return self.mouseDriver:IsLocked()
	end
	function Mouse:Destroy()
		self.bin:Destroy()
	end
end
return {
	Mouse = Mouse,
}
-- ----------------------------------
-- ----------------------------------
