-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local SpectateUIController
do
	SpectateUIController = setmetatable({}, {
		__tostring = function()
			return "SpectateUIController"
		end,
	})
	SpectateUIController.__index = SpectateUIController
	function SpectateUIController.new(...)
		local self = setmetatable({}, SpectateUIController)
		return self:constructor(...) or self
	end
	function SpectateUIController:constructor(spectateController)
		self.spectateController = spectateController
		local go = GameObject:Find("Spectate")
		self.canvas = go:GetComponent("Canvas")
		self.canvas.enabled = false
		local refs = go:GetComponent("GameObjectReferences")
		self.targetNameTMP = refs:GetValue("UI", "TargetName")
	end
	function SpectateUIController:OnStart()
		self.spectateController:ObserveSpectatorTarget(function(entity)
			if not entity then
				self.canvas.enabled = false
				return nil
			end
			self.targetNameTMP.text = entity:GetDisplayName()
			self.canvas.enabled = true
		end)
	end
end
-- (Flamework) SpectateUIController metadata
Reflect.defineMetadata(SpectateUIController, "identifier", "Bundles/Client/Controllers/Match/SpectateUIController@SpectateUIController")
Reflect.defineMetadata(SpectateUIController, "flamework:parameters", { "Bundles/Client/Controllers/Match/SpectateController@SpectateController" })
Reflect.defineMetadata(SpectateUIController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(SpectateUIController, "$:flamework@Controller", Controller, { {} })
return {
	SpectateUIController = SpectateUIController,
}
-- ----------------------------------
-- ----------------------------------
