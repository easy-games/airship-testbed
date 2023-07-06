-- Compiled with unity-ts v2.1.0-75
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local Spring = require("Shared/TS/Util/Spring").Spring
local CameraTransform = require("Client/TS/Controllers/Global/Camera/CameraTransform").CameraTransform
local SPEED = 12
local ROTATION_SENSITIVITY = 0.005
local MIN_ROT_X = math.rad(1)
local MAX_ROT_X = math.rad(179)
local FlyCameraMode
do
	FlyCameraMode = setmetatable({}, {
		__tostring = function()
			return "FlyCameraMode"
		end,
	})
	FlyCameraMode.__index = FlyCameraMode
	function FlyCameraMode.new(...)
		local self = setmetatable({}, FlyCameraMode)
		return self:constructor(...) or self
	end
	function FlyCameraMode:constructor()
		self.bin = Bin.new()
		self.xRot = math.rad(90)
		self.yRot = 0
		self.keysDown = {}
		self.rightClicking = false
	end
	function FlyCameraMode:OnStart(camera)
		local transform = camera.transform
		self.positionSpring = Spring.new(transform.position, 5)
		self.xRotSpring = Spring.new(Vector3.new(math.rad(90), 0, 0), 5)
		self.yRotVelSpring = Spring.new(Vector3.new(0, 0, 0), 3)
		self.keyboard = self.bin:Add(Keyboard.new())
		self.mouse = self.bin:Add(Mouse.new())
		-- Sink keys:
		local sinkKeys = {}
		sinkKeys[37] = true
		sinkKeys[15] = true
		sinkKeys[33] = true
		sinkKeys[18] = true
		sinkKeys[63] = true
		sinkKeys[64] = true
		sinkKeys[61] = true
		sinkKeys[62] = true
		sinkKeys[31] = true
		sinkKeys[19] = true
		self.bin:Add(self.keyboard.KeyDown:ConnectWithPriority(0, function(event)
			local _key = event.Key
			if sinkKeys[_key] ~= nil then
				local _keysDown = self.keysDown
				local _key_1 = event.Key
				_keysDown[_key_1] = true
				event:SetCancelled(true)
			end
		end))
		self.bin:Add(self.keyboard.KeyUp:ConnectWithPriority(0, function(event)
			local _key = event.Key
			if sinkKeys[_key] ~= nil then
				local _keysDown = self.keysDown
				local _key_1 = event.Key
				_keysDown[_key_1] = nil
			end
		end))
	end
	function FlyCameraMode:OnStop()
		self.bin:Clean()
	end
	function FlyCameraMode:OnUpdate(dt)
		-- Input:
		local up = self.keysDown[37] ~= nil or self.keysDown[63] ~= nil
		local dn = self.keysDown[33] ~= nil or self.keysDown[64] ~= nil
		local lf = self.keysDown[15] ~= nil or self.keysDown[61] ~= nil
		local rt = self.keysDown[18] ~= nil or self.keysDown[62] ~= nil
		local q = self.keysDown[31] ~= nil
		local e = self.keysDown[19] ~= nil
		local direction = self:CalculateDirection()
		-- Build move vector:
		local moveVector = Vector3.new(0, 0, 0)
		if up ~= dn then
			local _moveVector = moveVector
			local _arg0 = if dn then 1 else -1
			local _arg0_1 = direction * _arg0
			moveVector = _moveVector + _arg0_1
		end
		if lf ~= rt then
			local perpendicular = direction:Cross(Vector3.up)
			local _moveVector = moveVector
			local _arg0 = if rt then 1 else -1
			local _arg0_1 = perpendicular * _arg0
			moveVector = _moveVector + _arg0_1
		end
		if q ~= e then
			local perpendicular = direction:Cross(Vector3.up)
			local upwards = direction:Cross(perpendicular)
			local _moveVector = moveVector
			local _arg0 = if q then 1 else -1
			local _arg0_1 = upwards * _arg0
			moveVector = _moveVector + _arg0_1
		end
		-- Set new position:
		if moveVector.sqrMagnitude > 0 then
			local _goal = self.positionSpring.goal
			local _normalized = moveVector.normalized
			local _arg0 = SPEED * dt
			self.positionSpring.goal = _goal + (_normalized * _arg0)
		end
		-- Handle camera rotation when right-clicking:
		local rightClick = self.mouse:IsRightButtonDown()
		self.rightClicking = rightClick
		if rightClick then
			local mouseDelta = self.mouse:GetDelta()
			self.xRotSpring.goal = Vector3.new(math.clamp(self.xRotSpring.goal.x + mouseDelta.y * ROTATION_SENSITIVITY, MIN_ROT_X, MAX_ROT_X), 0, 0)
			self.xRot = self.xRotSpring:update(dt).x
			self.yRotVelSpring.goal = Vector3.new(0, -mouseDelta.x * ROTATION_SENSITIVITY, 0)
		else
			self.yRotVelSpring.goal = Vector3.new(0, 0, 0)
		end
		self.yRot = (self.yRot + self.yRotVelSpring:update(dt).y) % (math.pi * 2)
	end
	function FlyCameraMode:OnPostUpdate()
	end
	function FlyCameraMode:OnLateUpdate(dt)
		local position = self.positionSpring:update(dt)
		local rotation = Quaternion.Euler(-self.xRot + math.pi / 2, -self.yRot, 0)
		return CameraTransform.new(position, rotation)
	end
	function FlyCameraMode:CalculateDirection()
		local yRot = self.yRot - math.pi / 2
		local xPos = math.cos(yRot) * math.sin(self.xRot)
		local zPos = math.sin(yRot) * math.sin(self.xRot)
		local yPos = math.cos(self.xRot)
		return Vector3.new(xPos, yPos, zPos)
	end
end
return {
	FlyCameraMode = FlyCameraMode,
}
-- ----------------------------------
-- ----------------------------------
