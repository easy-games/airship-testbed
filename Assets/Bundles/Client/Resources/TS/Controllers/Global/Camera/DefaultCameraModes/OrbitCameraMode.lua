-- Compiled with unity-ts v2.1.0-75
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Preferred = _UserInput.Preferred
local Touchscreen = _UserInput.Touchscreen
local Bin = require("Shared/TS/Util/Bin").Bin
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local CameraTransform = require("Client/TS/Controllers/Global/Camera/CameraTransform").CameraTransform
local CHARACTER_MASK = -137
local MIN_ROT_X = math.rad(1)
local MAX_ROT_X = math.rad(179)
local ROTATION_SENSITIVITY = 0.01
local Y_LOCKED_ROTATION = math.rad(15)
local Y_OFFSET = 1.85
local OrbitCameraMode
do
	OrbitCameraMode = setmetatable({}, {
		__tostring = function()
			return "OrbitCameraMode"
		end,
	})
	OrbitCameraMode.__index = OrbitCameraMode
	function OrbitCameraMode.new(...)
		local self = setmetatable({}, OrbitCameraMode)
		return self:constructor(...) or self
	end
	function OrbitCameraMode:constructor(transform, distance)
		self.transform = transform
		self.distance = distance
		self.bin = Bin.new()
		self.rotationX = math.rad(90)
		self.rotationY = math.rad(0)
		self.lockView = true
		self.rightClicking = false
		self.rightClickPos = Vector3.zero
		self.camRight = Vector3.new(0, 0, 1)
		self.lastAttachToPos = Vector3.new(0, 0, 0)
		self.lastCamPos = Vector3.new(0, 0, 0)
		self.preferred = self.bin:Add(Preferred.new())
		self.keyboard = self.bin:Add(Keyboard.new())
		self.touchscreen = self.bin:Add(Touchscreen.new())
		self.mouse = self.bin:Add(Mouse.new())
		self:SetupMobileControls()
	end
	function OrbitCameraMode:SetupMobileControls()
		local touchscreen = self.bin:Add(Touchscreen.new())
		local touchStartPos = Vector3.new(0, 0, 0)
		local touchStartRotX = 0
		local touchStartRotY = 0
		local touchOverUI = false
		touchscreen.Pan:Connect(function(position, phase)
			repeat
				if phase == 1 then
					if UserInputService.InputProxy:IsPointerOverUI() then
						touchOverUI = true
					else
						touchOverUI = false
						touchStartPos = position
						touchStartRotX = self.rotationX
						touchStartRotY = self.rotationY
					end
					break
				end
				if phase == 2 then
					if touchOverUI then
						break
					end
					local _position = position
					local _touchStartPos = touchStartPos
					local deltaPosSinceStart = _position - _touchStartPos
					self.rotationY = (touchStartRotY - deltaPosSinceStart.x * ROTATION_SENSITIVITY) % (math.pi * 2)
					self.rotationX = math.clamp(touchStartRotX + deltaPosSinceStart.y * ROTATION_SENSITIVITY, MIN_ROT_X, MAX_ROT_X)
					break
				end
				if phase == 3 then
					touchOverUI = false
					break
				end
				break
			until true
		end)
	end
	function OrbitCameraMode:SetTransform(transform)
		self.transform = transform
	end
	function OrbitCameraMode:OnStart(camera)
		self.occlusionCam = camera.transform:GetComponent("OcclusionCam")
		if self.occlusionCam == nil then
			self.occlusionCam = camera.transform.gameObject:AddComponent("OcclusionCam")
		end
		self.bin:Add(self.preferred)
		self.bin:Add(self.keyboard)
		self.bin:Add(self.touchscreen)
		self.bin:Add(self.mouse)
		if not self.lockView then
			local unlockerId = self.mouse:AddUnlocker()
			self.bin:Add(function()
				self.mouse:RemoveUnlocker(unlockerId)
			end)
		end
	end
	function OrbitCameraMode:OnStop()
		self.bin:Clean()
	end
	function OrbitCameraMode:OnUpdate(dt)
		local lf = self.keyboard:IsKeyDown(61)
		local rt = self.keyboard:IsKeyDown(62)
		local rightClick = self.mouse:IsRightButtonDown()
		if rightClick and not self.rightClicking then
			self.rightClickPos = self.mouse:GetLocation()
		end
		self.rightClicking = rightClick
		if lf ~= rt then
			self.rotationY += (if lf then 1 else -1) * TimeUtil:GetDeltaTime() * 4
		end
		if self.mouse:IsLocked() and (rightClick or self.lockView) then
			local mouseDelta = self.mouse:GetDelta()
			if not self.lockView then
				self.mouse:SetLocation(self.rightClickPos)
			end
			self.rotationY = (self.rotationY - mouseDelta.x * ROTATION_SENSITIVITY) % (math.pi * 2)
			self.rotationX = math.clamp(self.rotationX + mouseDelta.y * ROTATION_SENSITIVITY, MIN_ROT_X, MAX_ROT_X)
		end
	end
	function OrbitCameraMode:OnLateUpdate(dt)
		local radius = self.distance
		local yRotOffset = if self.lockView then Y_LOCKED_ROTATION else 0
		-- Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		local rotY = self.rotationY + yRotOffset - math.pi / 2
		local xPos = radius * math.cos(rotY) * math.sin(self.rotationX)
		local zPos = radius * math.sin(rotY) * math.sin(self.rotationX)
		local yPos = radius * math.cos(self.rotationX)
		local posOffset = Vector3.new(xPos, yPos, zPos)
		local _position = self.transform.position
		local _vector3 = Vector3.new(0, Y_OFFSET, 0)
		local attachToPos = _position + _vector3
		self.lastAttachToPos = attachToPos
		local newPosition = attachToPos + posOffset
		local rotation
		local lv = (posOffset * (-1)).normalized
		rotation = Quaternion.LookRotation(lv, Vector3.new(0, 1, 0))
		self.lastCamPos = newPosition
		return CameraTransform.new(newPosition, rotation)
	end
	function OrbitCameraMode:OnPostUpdate(camera)
		local transform = camera.transform
		transform:LookAt(self.lastAttachToPos)
		self.occlusionCam:BumpForOcclusion(self.lastAttachToPos, CHARACTER_MASK)
		self.lastCamPos = transform.position
		self.camRight = transform.right
	end
end
return {
	OrbitCameraMode = OrbitCameraMode,
}
-- ----------------------------------
-- ----------------------------------
