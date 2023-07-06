-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local _CanvasAPI = require("Shared/TS/Util/CanvasAPI")
local CanvasAPI = _CanvasAPI.CanvasAPI
local PointerDirection = _CanvasAPI.PointerDirection
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local ClientSettingsUIController
do
	ClientSettingsUIController = setmetatable({}, {
		__tostring = function()
			return "ClientSettingsUIController"
		end,
	})
	ClientSettingsUIController.__index = ClientSettingsUIController
	function ClientSettingsUIController.new(...)
		local self = setmetatable({}, ClientSettingsUIController)
		return self:constructor(...) or self
	end
	function ClientSettingsUIController:constructor(clientSettingsController, escapeMenuController)
		self.clientSettingsController = clientSettingsController
		self.escapeMenuController = escapeMenuController
		local settingsCanvasGO = self.escapeMenuController.refs:GetValue("Tabs", "Settings")
		self.refs = settingsCanvasGO:GetComponent("GameObjectReferences")
	end
	function ClientSettingsUIController:OnStart()
		self:SetupSlider(self.refs:GetValue("UI", "MouseSensitivity"), self.clientSettingsController:GetMouseSensitivity(), function(val)
			self.clientSettingsController:SetMouseSensitivity(val)
		end)
		self:SetupSlider(self.refs:GetValue("UI", "Volume"), self.clientSettingsController:GetGlobalVolume(), function(val)
			self.clientSettingsController:SetGlobalVolume(val)
		end)
		self:SetupSlider(self.refs:GetValue("UI", "AmbientSound"), self.clientSettingsController:GetAmbientSound(), function(val)
			self.clientSettingsController:SetAmbientSound(val)
		end)
	end
	function ClientSettingsUIController:SetupSlider(go, startingValue, onChange)
		local transform = go.transform
		local inputField = transform:FindChild("InputField"):GetComponent("TMP_InputField")
		local slider = transform:FindChild("Slider"):GetComponent("Slider")
		slider.value = startingValue
		inputField.text = tostring(startingValue) .. ""
		CanvasAPI:OnValueChangeEvent(slider.gameObject, function(value)
			onChange(value)
			inputField.text = tostring(math.floor(value * 100) / 100) .. ""
		end)
		CanvasAPI:OnPointerEvent(slider.gameObject, function(direction)
			if direction == PointerDirection.DOWN then
				SoundUtil:PlayGlobal("UI_Click.wav")
			end
		end)
	end
end
-- (Flamework) ClientSettingsUIController metadata
Reflect.defineMetadata(ClientSettingsUIController, "identifier", "Bundles/Client/Controllers/Global/Core/EscapeMenu/ClientSettingsUIController@ClientSettingsUIController")
Reflect.defineMetadata(ClientSettingsUIController, "flamework:parameters", { "Bundles/Client/Controllers/Global/ClientSettings/ClientSettingsController@ClientSettingsController", "Bundles/Client/Controllers/Global/Core/EscapeMenu/EscapeMenuController@EscapeMenuController" })
Reflect.defineMetadata(ClientSettingsUIController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ClientSettingsUIController, "$:flamework@Controller", Controller, { {} })
return {
	ClientSettingsUIController = ClientSettingsUIController,
}
-- ----------------------------------
-- ----------------------------------
