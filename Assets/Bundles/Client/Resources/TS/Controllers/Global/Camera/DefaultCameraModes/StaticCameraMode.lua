-- Compiled with unity-ts v2.1.0-75
local CameraTransform = require("Client/TS/Controllers/Global/Camera/CameraTransform").CameraTransform
local StaticCameraMode
do
	StaticCameraMode = setmetatable({}, {
		__tostring = function()
			return "StaticCameraMode"
		end,
	})
	StaticCameraMode.__index = StaticCameraMode
	function StaticCameraMode.new(...)
		local self = setmetatable({}, StaticCameraMode)
		return self:constructor(...) or self
	end
	function StaticCameraMode:constructor(position, rotation)
		self.transform = CameraTransform.new(position, rotation)
	end
	function StaticCameraMode:OnStart()
	end
	function StaticCameraMode:OnStop()
	end
	function StaticCameraMode:OnUpdate(dt)
	end
	function StaticCameraMode:OnPostUpdate()
	end
	function StaticCameraMode:OnLateUpdate()
		return self.transform
	end
end
return {
	StaticCameraMode = StaticCameraMode,
}
-- ----------------------------------
-- ----------------------------------
