-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local SetTimeout = require("Shared/TS/Util/Timer").SetTimeout
local SkyboxController
do
	SkyboxController = setmetatable({}, {
		__tostring = function()
			return "SkyboxController"
		end,
	})
	SkyboxController.__index = SkyboxController
	function SkyboxController.new(...)
		local self = setmetatable({}, SkyboxController)
		return self:constructor(...) or self
	end
	function SkyboxController:constructor()
		SetTimeout(3, function() end)
	end
	function SkyboxController:OnStart()
	end
end
-- (Flamework) SkyboxController metadata
Reflect.defineMetadata(SkyboxController, "identifier", "Bundles/Client/Controllers/Global/Skybox/SkyboxController@SkyboxController")
Reflect.defineMetadata(SkyboxController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(SkyboxController, "$:flamework@Controller", Controller, { {} })
return {
	SkyboxController = SkyboxController,
}
-- ----------------------------------
-- ----------------------------------
