-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local CameraSystem = require("Client/TS/Controllers/Global/Camera/CameraSystem").CameraSystem
local CameraController
do
	CameraController = setmetatable({}, {
		__tostring = function()
			return "CameraController"
		end,
	})
	CameraController.__index = CameraController
	function CameraController.new(...)
		local self = setmetatable({}, CameraController)
		return self:constructor(...) or self
	end
	function CameraController:constructor()
		self.mainCamera = GameObject:Find("MainCamera"):GetComponent("Camera")
		self.cameraSystem = CameraSystem.new(self.mainCamera)
	end
	function CameraController:SetMode(mode, transition)
		self.cameraSystem:SetMode(mode, transition)
	end
	function CameraController:ClearMode(transition)
		self.cameraSystem:ClearMode(transition)
	end
	function CameraController:SetFOV(fieldOfView, immediate)
		if immediate == nil then
			immediate = false
		end
		self.cameraSystem:SetFOV(fieldOfView, immediate)
	end
	function CameraController:OnStart()
	end
	CameraController.CameraReferenceKey = "CameraRig"
end
-- (Flamework) CameraController metadata
Reflect.defineMetadata(CameraController, "identifier", "Bundles/Client/Controllers/Global/Camera/CameraController@CameraController")
Reflect.defineMetadata(CameraController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(CameraController, "$:flamework@Controller", Controller, { {} })
return {
	CameraController = CameraController,
}
-- ----------------------------------
-- ----------------------------------
