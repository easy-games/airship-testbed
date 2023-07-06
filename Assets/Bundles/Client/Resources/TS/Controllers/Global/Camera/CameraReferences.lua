-- Compiled with unity-ts v2.1.0-75
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local Mouse = require("Shared/TS/UserInput/init").Mouse
local CameraReferences
do
	CameraReferences = setmetatable({}, {
		__tostring = function()
			return "CameraReferences"
		end,
	})
	CameraReferences.__index = CameraReferences
	function CameraReferences.new(...)
		local self = setmetatable({}, CameraReferences)
		return self:constructor(...) or self
	end
	function CameraReferences:constructor()
		self.CameraBundleKey = "CameraRig"
		self.mouse = Mouse.new()
		if CameraReferences._instance then
			error("TRYING TO INITIALIZE SINGLETON THAT ALREADY EXISTS: CameraReferences")
			return nil
		end
		CameraReferences._instance = self
		-- Get Camera references
		local references = GameObjectReferences:GetReferences(self.CameraBundleKey)
		self.mainCamera = references:GetValue("Cameras", "MainCamera")
		self.fpsCamera = references:GetValue("Cameras", "FPSCamera")
	end
	function CameraReferences:Instance()
		if not CameraReferences._instance then
			CameraReferences.new()
		end
		return CameraReferences._instance
	end
	function CameraReferences:RaycastVoxelFromCamera(distance)
		local ray = self:GetRayFromCamera(distance)
		return WorldAPI:GetMainWorld():RaycastVoxel(ray.origin, ray.direction, distance)
	end
	function CameraReferences:RaycastPhysicsFromCamera(distance, layerMask)
		local ray = self:GetRayFromCamera(distance)
		return Physics:EasyRaycast(ray.origin, ray.direction, 40, layerMask)
	end
	function CameraReferences:GetRayFromCamera(distance)
		local ray = Camera.main:ScreenPointToRay(self.mouse:GetLocation())
		local _direction = ray.direction
		local _distance = distance
		ray.direction = _direction * _distance
		return ray
	end
end
return {
	CameraReferences = CameraReferences,
}
-- ----------------------------------
-- ----------------------------------
