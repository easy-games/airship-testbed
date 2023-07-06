-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local _UserInput = require("Shared/TS/UserInput/init")
local Keyboard = _UserInput.Keyboard
local Mouse = _UserInput.Mouse
local Preferred = _UserInput.Preferred
local Touchscreen = _UserInput.Touchscreen
local Bin = require("Shared/TS/Util/Bin").Bin
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local SpringTween = require("Shared/TS/Util/SpringTween").SpringTween
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local CameraTransform = require("Client/TS/Controllers/Global/Camera/init").CameraTransform
-- Lua's bitwise operations is unsigned, but C#'s is signed, so we need to hardcode the mask:
-- Character layer: 3
-- BridgeAssist layer: 7
-- Bitwise operation to ignore layers above: ~(1 << 3 | 1 << 7)
local CHARACTER_MASK = -137
local MIN_ROT_X = math.rad(1)
local MAX_ROT_X = math.rad(179)
local XZ_LOCKED_OFFSET = Vector3.new(0.3, 0, 3.5)
local Y_LOCKED_ROTATION = math.rad(15)
local ANGLE_EPSILON = 0.0001
local MOUSE_SENS_SCALAR = 0.01
if RunUtil:IsMac() then
	MOUSE_SENS_SCALAR = 0.04
end
local HumanoidCameraMode
do
	HumanoidCameraMode = setmetatable({}, {
		__tostring = function()
			return "HumanoidCameraMode"
		end,
	})
	HumanoidCameraMode.__index = HumanoidCameraMode
	function HumanoidCameraMode.new(...)
		local self = setmetatable({}, HumanoidCameraMode)
		return self:constructor(...) or self
	end
	function HumanoidCameraMode:constructor(characterGO, graphicalCharacterGO, initialFirstPerson, initialYOffset)
		self.characterGO = characterGO
		self.graphicalCharacterGO = graphicalCharacterGO
		self.bin = Bin.new()
		self.lookAngle = 0
		self.forwardDirection = Vector3.new(0, 0, 1)
		self.lookBackwards = false
		self.rotationX = math.rad(90)
		self.rotationY = math.rad(0)
		self.lockView = true
		self.firstPerson = true
		self.rightClicking = false
		self.rightClickPos = Vector3.zero
		self.camRight = Vector3.new(0, 0, 1)
		self.lastAttachToPos = Vector3.new(0, 0, 0)
		self.lastCamPos = Vector3.new(0, 0, 0)
		self.yOffset = 0
		self.preferred = self.bin:Add(Preferred.new())
		self.keyboard = self.bin:Add(Keyboard.new())
		self.touchscreen = self.bin:Add(Touchscreen.new())
		self.mouse = self.bin:Add(Mouse.new())
		self.clientSettingsController = Flamework.resolveDependency("Bundles/Client/Controllers/Global/ClientSettings/ClientSettingsController@ClientSettingsController")
		self.entityDriver = characterGO:GetComponent("EntityDriver")
		self.attachTo = graphicalCharacterGO.transform
		self.firstPerson = initialFirstPerson
		self.yOffset = initialYOffset
		self:SetupMobileControls()
		self.bin:Add(function() end)
	end
	function HumanoidCameraMode:SetupMobileControls()
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
					self.rotationY = (touchStartRotY - deltaPosSinceStart.x * self.clientSettingsController:GetTouchSensitivity()) % (math.pi * 2)
					self.rotationX = math.clamp(touchStartRotX + deltaPosSinceStart.y * self.clientSettingsController:GetTouchSensitivity(), MIN_ROT_X, MAX_ROT_X)
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
	function HumanoidCameraMode:OnStart(camera)
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
		self:SetFirstPerson(self.firstPerson)
	end
	function HumanoidCameraMode:OnStop()
		self.bin:Clean()
	end
	function HumanoidCameraMode:OnUpdate(dt)
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
		if self.mouse:IsLocked() and (rightClick or (self.firstPerson or self.lockView)) then
			local mouseDelta = self.mouse:GetDelta()
			if not self.firstPerson and not self.lockView then
				self.mouse:SetLocation(self.rightClickPos)
			end
			self.rotationY = (self.rotationY - mouseDelta.x * self.clientSettingsController:GetMouseSensitivity() * MOUSE_SENS_SCALAR) % (math.pi * 2)
			self.rotationX = math.clamp(self.rotationX + mouseDelta.y * self.clientSettingsController:GetMouseSensitivity() * MOUSE_SENS_SCALAR * (if self.firstPerson then Screen.height / Screen.width else 1), MIN_ROT_X, MAX_ROT_X)
		end
	end
	function HumanoidCameraMode:OnLateUpdate(dt)
		local xOffset = if self.lockView and not self.firstPerson then XZ_LOCKED_OFFSET.x else 0
		if self.lockView and not self.firstPerson then
			if self.rotationX < math.rad(45) then
				xOffset = MathUtil:Map(self.rotationX, MIN_ROT_X, math.rad(45), 0, xOffset)
			end
		end
		local zOffset = XZ_LOCKED_OFFSET.z
		local radius = if self.firstPerson then 1 else zOffset
		local yRotOffset = if self.lockView then Y_LOCKED_ROTATION + (if self.lookBackwards and not self.firstPerson then math.pi else 0) else 0
		-- Polar to cartesian conversion (i.e. the 3D point around the sphere of the character):
		local rotY = self.rotationY + yRotOffset - math.pi / 2
		local xPos = radius * math.cos(rotY) * math.sin(self.rotationX)
		local zPos = radius * math.sin(rotY) * math.sin(self.rotationX)
		local yPos = radius * math.cos(self.rotationX)
		local posOffset = Vector3.new(xPos, yPos, zPos)
		if self.yOffsetSpring ~= nil then
			local newYOffset, isDone = self.yOffsetSpring:update(dt)
			self.yOffset = newYOffset.y
			if isDone then
				self.yOffsetSpring = nil
			end
		end
		local _position = self.attachTo.position
		local _vector3 = Vector3.new(0, self.yOffset, 0)
		local _camRight = self.camRight
		local _xOffset = xOffset
		local attachToPos = _position + _vector3 + (_camRight * _xOffset)
		self.lastAttachToPos = attachToPos
		local newPosition = if self.firstPerson then attachToPos else attachToPos + posOffset
		local rotation
		local lv = (posOffset * (-1)).normalized
		rotation = Quaternion.LookRotation(lv, Vector3.new(0, 1, 0))
		self.lastCamPos = newPosition
		return CameraTransform.new(newPosition, rotation)
	end
	function HumanoidCameraMode:OnPostUpdate(camera)
		local transform = camera.transform
		if not self.firstPerson then
			transform:LookAt(self.lastAttachToPos)
			self.occlusionCam:BumpForOcclusion(self.lastAttachToPos, CHARACTER_MASK)
			self.lastCamPos = transform.position
		end
		self.camRight = transform.right
		self:CalculateDirectionAndAngle(self.lastCamPos, transform.forward)
	end
	function HumanoidCameraMode:CalculateDirectionAndAngle(position, forward)
		local _position = position
		local _arg0 = forward * 100
		local forwardPos = _position + _arg0
		forwardPos = Vector3.new(forwardPos.x, position.y, forwardPos.z)
		local _forwardPos = forwardPos
		local _position_1 = position
		local forwardDir = (_forwardPos - _position_1).normalized
		self.forwardDirection = Vector3.new(forwardDir.x, 0, forwardDir.z)
		local lastLookAngle = self.lookAngle
		local newLookAngle = math.atan2(-self.forwardDirection.x, self.forwardDirection.z)
		if self.lookBackwards and not self.firstPerson then
			newLookAngle += math.pi
		end
		-- Only update the Humanoid if there's a bit of a change:
		if math.abs(lastLookAngle - newLookAngle) > ANGLE_EPSILON then
			self.lookAngle = newLookAngle
			self.entityDriver:SetLookAngle(math.deg(self.lookAngle) % 360)
		end
	end
	function HumanoidCameraMode:SetFirstPerson(firstPerson)
		self.firstPerson = firstPerson
	end
	function HumanoidCameraMode:SetYOffset(yOffset, immediate)
		if immediate == nil then
			immediate = false
		end
		if immediate then
			self.yOffset = yOffset
			if self.yOffsetSpring then
				self.yOffsetSpring:resetTo(Vector3.new(0, yOffset, 0))
			end
			return nil
		end
		if self.yOffsetSpring == nil then
			self.yOffsetSpring = SpringTween.new(Vector3.new(0, self.yOffset, 0), 5, 2)
		end
		self.yOffsetSpring:setGoal(Vector3.new(0, yOffset, 0))
	end
	function HumanoidCameraMode:SetLookBackwards(lookBackwards)
		self.lookBackwards = lookBackwards
	end
end
return {
	HumanoidCameraMode = HumanoidCameraMode,
}
-- ----------------------------------
-- ----------------------------------
