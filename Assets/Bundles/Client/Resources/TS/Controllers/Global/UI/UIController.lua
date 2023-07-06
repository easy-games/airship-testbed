-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local UIController
do
	UIController = setmetatable({}, {
		__tostring = function()
			return "UIController"
		end,
	})
	UIController.__index = UIController
	function UIController.new(...)
		local self = setmetatable({}, UIController)
		return self:constructor(...) or self
	end
	function UIController:constructor()
	end
	function UIController:OnStart()
	end
end
-- (Flamework) UIController metadata
Reflect.defineMetadata(UIController, "identifier", "Bundles/Client/Controllers/Global/UI/UIController@UIController")
Reflect.defineMetadata(UIController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(UIController, "$:flamework@Controller", Controller, { {} })
return {
	UIController = UIController,
}
-- ----------------------------------
-- ----------------------------------
