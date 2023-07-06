-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local Task = require("Shared/TS/Util/Task").Task
-- * Light update delay.
local LIGHT_UPDATE_DELAY = 8
local PointlightController
do
	PointlightController = setmetatable({}, {
		__tostring = function()
			return "PointlightController"
		end,
	})
	PointlightController.__index = PointlightController
	function PointlightController.new(...)
		local self = setmetatable({}, PointlightController)
		return self:constructor(...) or self
	end
	function PointlightController:constructor()
		self.pointlightPrefab = AssetBridge:LoadAsset("Shared/Resources/Prefabs/Pointlight.prefab")
	end
	function PointlightController:OnStart()
		-- TEMP: Waiting for fix for pointlight dirtying race condition. Force dirty.
		self:UpdateLights()
	end
	function PointlightController:CreatePointlight(pointlight)
		(self:GetVoxelWorld():GetComponent("VoxelWorld")):UpdateLights()
		local pointlightObject = GameObjectBridge:InstantiateIn(self.pointlightPrefab, self:GetVoxelWorld().transform)
		pointlightObject.name = "Pointlight"
		local pointlightComponent = pointlightObject:GetComponent("PointLight")
		-- Set pointlight properties.
		pointlightComponent.color = Color.new(pointlight.color[1], pointlight.color[2], pointlight.color[3], pointlight.color[4])
		pointlightComponent.transform.position = pointlight.position
		pointlightComponent.transform.rotation = pointlight.rotation
		pointlightComponent.intensity = pointlight.intensity
		pointlightComponent.range = pointlight.range
		pointlightComponent.castShadows = pointlight.castShadows
		pointlightComponent.highQualityLight = pointlight.highQualityLight
		-- Force light update.
		self:UpdateLights()
	end
	function PointlightController:GetVoxelWorld()
		return GameObject:Find("VoxelWorld")
	end
	function PointlightController:UpdateLights()
		Task:Delay(LIGHT_UPDATE_DELAY, function()
			local world = self:GetVoxelWorld():GetComponent("VoxelWorld")
			world:UpdateSceneLights()
		end)
	end
end
-- (Flamework) PointlightController metadata
Reflect.defineMetadata(PointlightController, "identifier", "Bundles/Client/Controllers/Global/Lighting/PointlightController@PointlightController")
Reflect.defineMetadata(PointlightController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(PointlightController, "$:flamework@Controller", Controller, { {
	loadOrder = -1,
} })
return {
	PointlightController = PointlightController,
}
-- ----------------------------------
-- ----------------------------------
