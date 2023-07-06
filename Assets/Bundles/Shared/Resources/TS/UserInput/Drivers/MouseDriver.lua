-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local MouseDriver
do
	MouseDriver = setmetatable({}, {
		__tostring = function()
			return "MouseDriver"
		end,
	})
	MouseDriver.__index = MouseDriver
	function MouseDriver.new(...)
		local self = setmetatable({}, MouseDriver)
		return self:constructor(...) or self
	end
	function MouseDriver:constructor()
		self.LeftButtonChanged = Signal.new()
		self.RightButtonChanged = Signal.new()
		self.MiddleButtonChanged = Signal.new()
		self.Scrolled = Signal.new()
		self.Moved = Signal.new()
		self.Delta = Signal.new()
		self.inputProxy = UserInputService.InputProxy
		self.inputProxy:OnLeftMouseButtonPressEvent(function(isDown)
			self.LeftButtonChanged:Fire(isDown)
		end)
		self.inputProxy:OnRightMouseButtonPressEvent(function(isDown)
			self.RightButtonChanged:Fire(isDown)
		end)
		self.inputProxy:OnMiddleMouseButtonPressEvent(function(isDown)
			self.MiddleButtonChanged:Fire(isDown)
		end)
		self.inputProxy:OnMouseScrollEvent(function(scrollAmount)
			self.Scrolled:Fire(scrollAmount)
		end)
		self.inputProxy:OnMouseMoveEvent(function(location)
			self.Moved:Fire(location)
		end)
		self.inputProxy:OnMouseDeltaEvent(function(delta)
			self.Delta:Fire(delta)
		end)
	end
	function MouseDriver:IsLeftDown()
		return self.inputProxy:IsLeftMouseButtonDown()
	end
	function MouseDriver:IsRightDown()
		return self.inputProxy:IsRightMouseButtonDown()
	end
	function MouseDriver:IsMiddleDown()
		return self.inputProxy:IsMiddleMouseButtonDown()
	end
	function MouseDriver:GetLocation()
		return self.inputProxy:GetMouseLocation()
	end
	function MouseDriver:GetDelta()
		return self.inputProxy:GetMouseDelta()
	end
	function MouseDriver:SetLocation(position)
		self.inputProxy:SetMouseLocation(position)
	end
	function MouseDriver:IsLocked()
		return self.inputProxy:IsMouseLocked()
	end
	function MouseDriver:SetLocked(locked)
		self.inputProxy:SetMouseLocked(locked)
	end
	function MouseDriver:instance()
		if self.inst == nil then
			self.inst = MouseDriver.new()
		end
		return self.inst
	end
end
return {
	MouseDriver = MouseDriver,
}
-- ----------------------------------
-- ----------------------------------
