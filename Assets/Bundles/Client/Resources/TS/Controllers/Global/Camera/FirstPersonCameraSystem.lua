-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
-- import {CameraController} from "./CameraController";
local Game = require("Shared/TS/Game").Game
local Bin = require("Shared/TS/Util/Bin").Bin
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local OnLateUpdate = require("Shared/TS/Util/Timer").OnLateUpdate
local CameraReferences = require("Client/TS/Controllers/Global/Camera/CameraReferences").CameraReferences
local FirstPersonCameraSystem
do
	FirstPersonCameraSystem = setmetatable({}, {
		__tostring = function()
			return "FirstPersonCameraSystem"
		end,
	})
	FirstPersonCameraSystem.__index = FirstPersonCameraSystem
	function FirstPersonCameraSystem.new(...)
		local self = setmetatable({}, FirstPersonCameraSystem)
		return self:constructor(...) or self
	end
	function FirstPersonCameraSystem:constructor(entityReferences, entityVariables)
		self.manualSpineOffset = Vector3.new(0, 0.8, 0.25)
		self.trackedHeadRotation = Quaternion.identity
		self.inFirstPerson = true
		self.fovFirstPerson = 90
		self.fovThirdPerson = 100
		self.entityReferences = entityReferences
		self.entityVariables = entityVariables
		self.cameras = CameraReferences:Instance()
		self:OnFirstPersonChanged(self.inFirstPerson)
		self.bin = Bin.new()
		self.bin:Add(OnLateUpdate:ConnectWithPriority(100, function()
			return self:LateUpdate()
		end))
	end
	function FirstPersonCameraSystem:Destroy()
		self.bin:Clean()
	end
	function FirstPersonCameraSystem:LateUpdate()
		if not self.inFirstPerson then
			return nil
		end
		-- Calculate how high the neck bone is off the spine bone
		self.manualSpineOffset = self.entityVariables:GetVector("FPSHeadOffset")
		local _manualSpineOffset = self.manualSpineOffset
		local _position = self.entityReferences.neckBone.position
		local _position_1 = self.entityReferences.spineBone3.position
		local neckOffset = _manualSpineOffset + (_position - _position_1)
		-- Get the cameras transform information
		local headLookPosition = self.cameras.fpsCamera.transform.position
		local headLookRotation = self.cameras.fpsCamera.transform.rotation
		local diffAngle = Quaternion.Angle(self.trackedHeadRotation, headLookRotation)
		local lerpMod = MathUtil:Lerp(self.entityVariables:GetNumber("FPSLerpMin"), self.entityVariables:GetNumber("FPSLerpMax"), diffAngle / self.entityVariables:GetNumber("FPSLerpRange"))
		-- Move the spine to match where the camera is looking
		self.trackedHeadRotation = Quaternion.Slerp(self.trackedHeadRotation, headLookRotation, Time.deltaTime * lerpMod)
		-- this.trackedHeadRotation = headLookRotation;
		-- Calculate new position based on head rotation
		local _headLookPosition = headLookPosition
		local _trackedHeadRotation = self.trackedHeadRotation
		local _neckOffset = neckOffset
		local newPosition = _headLookPosition - (_trackedHeadRotation * _neckOffset)
		-- let headBob = new Vector3(0, math.sin(Time.deltaTime * ,0);
		-- Apply the new rotation
		self.entityReferences.spineBone2.rotation = self.trackedHeadRotation
		-- Apply the new positions
		self.entityReferences.spineBone2.position = newPosition
		self.entityReferences.spineBone3.position = newPosition
	end
	function FirstPersonCameraSystem:OnFirstPersonChanged(isFirstPerson)
		self.inFirstPerson = isFirstPerson
		self.cameras.fpsCamera.gameObject:SetActive(isFirstPerson)
		local _result = Game.LocalPlayer.Character
		if _result ~= nil then
			_result = _result.anim
			if _result ~= nil then
				_result:SetFirstPerson(isFirstPerson)
			end
		end
		self.trackedHeadRotation = self.cameras.fpsCamera.transform.rotation
		local fov = if isFirstPerson then self.fovFirstPerson else self.fovThirdPerson;
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Camera/CameraController@CameraController")):SetFOV(fov, true);
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")):UpdateFov()
		-- In First person hide all meshes except the arm
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < #self.entityReferences.meshes) then
					break
				end
				self.entityReferences.meshes[i + 1].gameObject:SetActive(not isFirstPerson)
			end
		end
		self.entityReferences.fpsMesh.gameObject:SetActive(isFirstPerson)
	end
end
return {
	FirstPersonCameraSystem = FirstPersonCameraSystem,
}
-- ----------------------------------
-- ----------------------------------
