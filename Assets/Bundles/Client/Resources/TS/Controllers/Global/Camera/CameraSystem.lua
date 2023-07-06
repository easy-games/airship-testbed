-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local Spring = require("Shared/TS/Util/Spring").Spring
local _Timer = require("Shared/TS/Util/Timer")
local OnLateUpdate = _Timer.OnLateUpdate
local OnUpdate = _Timer.OnUpdate
local StaticCameraMode = require("Client/TS/Controllers/Global/Camera/DefaultCameraModes/StaticCameraMode").StaticCameraMode
local TransitionMode
do
	TransitionMode = setmetatable({}, {
		__tostring = function()
			return "TransitionMode"
		end,
	})
	TransitionMode.__index = TransitionMode
	function TransitionMode.new(...)
		local self = setmetatable({}, TransitionMode)
		return self:constructor(...) or self
	end
	function TransitionMode:constructor(config, modeStart, modeGoal, onDone)
		self.config = config
		self.modeStart = modeStart
		self.modeGoal = modeGoal
		self.onDone = onDone
		self.start = Time.time
	end
	function TransitionMode:OnStart()
	end
	function TransitionMode:OnStop()
		self.modeStart:OnStop()
		self.modeGoal:OnStop()
	end
	function TransitionMode:OnUpdate(dt)
	end
	function TransitionMode:OnPostUpdate()
	end
	function TransitionMode:OnLateUpdate(dt)
		local transformStart = self.modeStart:OnLateUpdate(dt)
		local transformGoal = self.modeGoal:OnLateUpdate(dt)
		local alpha = math.clamp((Time.time - self.start) / self.config.Duration, 0, 1)
		if alpha == 1 then
			self.onDone()
		end
		return transformStart:Lerp(transformGoal, alpha)
	end
end
--[[
	*
	* Drives the camera modes.
]]
local CameraSystem
do
	CameraSystem = setmetatable({}, {
		__tostring = function()
			return "CameraSystem"
		end,
	})
	CameraSystem.__index = CameraSystem
	function CameraSystem.new(...)
		local self = setmetatable({}, CameraSystem)
		return self:constructor(...) or self
	end
	function CameraSystem:constructor(camera)
		self.camera = camera
		self.currentMode = StaticCameraMode.new(Vector3.new(0, 10, 0), Quaternion.identity)
		self.modeCleared = true
		self.fovSpringMoving = false
		self.fovSpringMovingStart = 0
		self.ModeChangedBegin = Signal.new()
		self.ModeChangedEnd = Signal.new()
		self.transform = camera.transform
		self.fovSpring = Spring.new(Vector3.new(camera.fieldOfView, 0, 0), 5)
		self.currentMode:OnStart(camera)
		local updateFov = function(dt)
			camera.fieldOfView = self.fovSpring:update(dt).x
			if Time.time - self.fovSpringMovingStart > 2 and math.abs(self.fovSpring.velocity.x) < 0.01 then
				self.fovSpringMoving = false
			end
		end
		OnUpdate:ConnectWithPriority(400, function(dt)
			self.currentMode:OnUpdate(dt)
		end)
		OnLateUpdate:ConnectWithPriority(0, function(dt)
			local camTransform = self.currentMode:OnLateUpdate(dt)
			self.transform:SetPositionAndRotation(camTransform.position, camTransform.rotation)
			self.currentMode:OnPostUpdate(self.camera)
			if self.fovSpringMoving then
				updateFov(dt)
			end
		end)
	end
	function CameraSystem:GetMode()
		return self.currentMode
	end
	function CameraSystem:SetMode(mode, transition)
		if mode == self.currentMode then
			return nil
		end
		self.modeCleared = false
		if transition == nil then
			local oldMode = self.currentMode
			self.ModeChangedBegin:Fire(mode, oldMode)
			self.currentMode:OnStop()
			self.currentMode = mode
			self.currentMode:OnStart(self.camera)
			self.ModeChangedEnd:Fire(mode, oldMode)
		else
			local oldMode = self.currentMode
			self.ModeChangedBegin:Fire(mode, oldMode)
			mode:OnStart(self.camera)
			self.currentMode = TransitionMode.new(transition, oldMode, mode, function()
				oldMode:OnStop()
				self.currentMode = mode
				self.ModeChangedEnd:Fire(mode, oldMode)
			end)
		end
	end
	function CameraSystem:ClearMode(transition)
		if self.onClearCallback then
			self:SetMode(self.onClearCallback(), transition)
		else
			self:SetMode(StaticCameraMode.new(self.transform.position, self.transform.rotation), transition)
			self.modeCleared = true
		end
	end
	function CameraSystem:SetOnClearCallback(onClearCallback)
		self.onClearCallback = onClearCallback
		if self.modeCleared and onClearCallback then
			self:SetMode(onClearCallback())
		end
	end
	function CameraSystem:SetFOV(fieldOfView, immediate)
		if immediate == nil then
			immediate = false
		end
		if immediate then
			self.fovSpring:resetTo(Vector3.new(fieldOfView, 0, 0))
			self.camera.fieldOfView = fieldOfView
			self.fovSpringMoving = false
		else
			self.fovSpring.goal = Vector3.new(fieldOfView, 0, 0)
			self.fovSpringMoving = true
			self.fovSpringMovingStart = Time.time
		end
	end
end
return {
	CameraSystem = CameraSystem,
}
-- ----------------------------------
-- ----------------------------------
