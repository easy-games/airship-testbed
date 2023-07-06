-- Compiled with unity-ts v2.1.0-75
local Bin = require("Shared/TS/Util/Bin").Bin
local Signal = require("Shared/TS/Util/Signal").Signal
-- import { DirectionV3, DistanceV3, DotV3, LerpV3, MagnitudeV3 } from "Shared/Util/Vector3Util";
local TouchscreenDriver = require("Shared/TS/UserInput/Drivers/TouchscreenDriver").TouchscreenDriver
-- -1 would be a perfect pinch:
local PINCH_DOT_THRESHOLD = -0.8
local OneFingerGestureCapture
do
	OneFingerGestureCapture = setmetatable({}, {
		__tostring = function()
			return "OneFingerGestureCapture"
		end,
	})
	OneFingerGestureCapture.__index = OneFingerGestureCapture
	function OneFingerGestureCapture.new(...)
		local self = setmetatable({}, OneFingerGestureCapture)
		return self:constructor(...) or self
	end
	function OneFingerGestureCapture:constructor()
		self.Pan = Signal.new()
	end
	function OneFingerGestureCapture:Update(position, phase)
		self.Pan:Fire(position, phase)
	end
	function OneFingerGestureCapture:Destroy()
		self.Pan:Destroy()
	end
end
local TwoFingerGestureCapture
do
	TwoFingerGestureCapture = setmetatable({}, {
		__tostring = function()
			return "TwoFingerGestureCapture"
		end,
	})
	TwoFingerGestureCapture.__index = TwoFingerGestureCapture
	function TwoFingerGestureCapture.new(...)
		local self = setmetatable({}, TwoFingerGestureCapture)
		return self:constructor(...) or self
	end
	function TwoFingerGestureCapture:constructor(primaryStart, secondaryStart)
		self.primaryStart = primaryStart
		self.secondaryStart = secondaryStart
		self.Pinch = Signal.new()
		self.pinching = false
		self.lastPinchDistance = 0
		self.lastPinchScale = 1
		self.centerStart = primaryStart:Lerp(secondaryStart, 0.5)
		self.startDistance = primaryStart:Distance(secondaryStart)
	end
	function TwoFingerGestureCapture:Update(primary, secondary)
		local _primary = primary
		local _centerStart = self.centerStart
		local primaryDir = (_primary - _centerStart).normalized
		local _secondary = secondary
		local _centerStart_1 = self.centerStart
		local secondaryDir = (_secondary - _centerStart_1).normalized
		local dot = primaryDir:Dot(secondaryDir)
		if dot <= PINCH_DOT_THRESHOLD then
			-- Good pinch
			local started = not self.pinching
			if started then
				self.pinching = true
			end
			local distanceBetween = primary:Distance(secondary)
			local distance = math.abs(distanceBetween - self.startDistance)
			local scale = distanceBetween / self.startDistance
			self.lastPinchDistance = distance
			self.lastPinchScale = scale
			self.Pinch:Fire(distance, scale, if started then 1 else 2)
		else
			-- Bad pinch
			if self.pinching then
				self.pinching = false
				self.Pinch:Fire(self.lastPinchDistance, self.lastPinchScale, 3)
			end
		end
	end
	function TwoFingerGestureCapture:Destroy()
		if self.pinching then
			self.Pinch:Fire(self.lastPinchDistance, self.lastPinchScale, 3)
		end
		self.Pinch:Destroy()
	end
end
local GestureDriver
do
	GestureDriver = setmetatable({}, {
		__tostring = function()
			return "GestureDriver"
		end,
	})
	GestureDriver.__index = GestureDriver
	function GestureDriver.new(...)
		local self = setmetatable({}, GestureDriver)
		return self:constructor(...) or self
	end
	function GestureDriver:constructor()
		self.bin = Bin.new()
		self.touchscreenDriver = TouchscreenDriver:instance()
		self.Pan = Signal.new()
		self.Pinch = Signal.new()
		self.positions = {}
		self.bin:Add(self.Pan)
		self.bin:Add(self.Pinch)
		self.bin:Connect(self.touchscreenDriver.Touch, function(touchIndex, position, phase)
			repeat
				local _fallthrough = false
				if phase == 1 then
					_fallthrough = true
				end
				if _fallthrough or phase == 2 then
					local _positions = self.positions
					local _touchIndex = touchIndex
					local _position = position
					_positions[_touchIndex] = _position
					if touchIndex == 0 and self:hasOneTouching() then
						if self.oneFingerGestureCapture == nil then
							self.oneFingerGestureCapture = OneFingerGestureCapture.new()
							self.oneFingerGestureCapture.Pan:Proxy(self.Pan)
						end
						self.oneFingerGestureCapture:Update(position, phase)
					elseif (touchIndex == 0 or touchIndex == 1) and self:hasTwoTouching() then
						local primary = self.positions[0]
						local secondary = self.positions[1]
						if self.twoFingerGestureCapture == nil then
							self.twoFingerGestureCapture = TwoFingerGestureCapture.new(primary, secondary)
							self.twoFingerGestureCapture.Pinch:Proxy(self.Pinch)
						end
						self.twoFingerGestureCapture:Update(primary, secondary)
					end
					break
				end
				if phase == 3 then
					local _positions = self.positions
					local _touchIndex = touchIndex
					_positions[_touchIndex] = nil
					if touchIndex == 0 and self.oneFingerGestureCapture ~= nil then
						self.oneFingerGestureCapture:Update(position, phase)
						self.oneFingerGestureCapture:Destroy()
						self.oneFingerGestureCapture = nil
					end
					if (touchIndex == 0 or touchIndex == 1) and self.twoFingerGestureCapture ~= nil then
						self.twoFingerGestureCapture:Destroy()
						self.twoFingerGestureCapture = nil
					end
					break
				end
			until true
		end)
	end
	function GestureDriver:hasOneTouching()
		return self.positions[0] ~= nil and not (self.positions[1] ~= nil)
	end
	function GestureDriver:hasTwoTouching()
		return self.positions[0] ~= nil and (self.positions[1] ~= nil and not (self.positions[2] ~= nil))
	end
	function GestureDriver:Destroy()
		local _result = self.oneFingerGestureCapture
		if _result ~= nil then
			_result:Destroy()
		end
		local _result_1 = self.twoFingerGestureCapture
		if _result_1 ~= nil then
			_result_1:Destroy()
		end
		self.bin:Destroy()
	end
end
return {
	GestureDriver = GestureDriver,
}
-- ----------------------------------
-- ----------------------------------
