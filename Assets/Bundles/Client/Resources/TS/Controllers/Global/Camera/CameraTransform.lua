-- Compiled with unity-ts v2.1.0-75
--[[
	*
	* Unique class for holding the position and rotation of the camera. Used by `CameraMode` classes.
]]
local CameraTransform
do
	CameraTransform = setmetatable({}, {
		__tostring = function()
			return "CameraTransform"
		end,
	})
	CameraTransform.__index = CameraTransform
	function CameraTransform.new(...)
		local self = setmetatable({}, CameraTransform)
		return self:constructor(...) or self
	end
	function CameraTransform:constructor(position, rotation)
		self.position = if position ~= nil then position else Vector3.zero
		self.rotation = if rotation ~= nil then rotation else Quaternion.identity
	end
	function CameraTransform:fromTransform(transform)
		return CameraTransform.new(transform.position, transform.rotation)
	end
	function CameraTransform:Lerp(other, alpha)
		local position = self.position:Lerp(other.position, alpha)
		local rotation = Quaternion.Slerp(self.rotation, other.rotation, alpha)
		return CameraTransform.new(position, rotation)
	end
	CameraTransform.identity = CameraTransform.new()
end
return {
	CameraTransform = CameraTransform,
}
-- ----------------------------------
-- ----------------------------------
