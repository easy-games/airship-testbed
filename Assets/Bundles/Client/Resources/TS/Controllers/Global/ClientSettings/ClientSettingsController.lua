-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSettingsController
do
	ClientSettingsController = setmetatable({}, {
		__tostring = function()
			return "ClientSettingsController"
		end,
	})
	ClientSettingsController.__index = ClientSettingsController
	function ClientSettingsController.new(...)
		local self = setmetatable({}, ClientSettingsController)
		return self:constructor(...) or self
	end
	function ClientSettingsController:constructor()
		self.mouseSensitivity = 0.5
		self.touchSensitivity = 0.5
		self.globalVolume = 1
		self.ambientSound = 0.14
		self.firstPersonFov = 85
		self.thirdPersonFov = 100
		self:LoadSettings()
	end
	function ClientSettingsController:OnStart()
	end
	function ClientSettingsController:LoadSettings()
		self:SetAmbientSound(0.1)
	end
	function ClientSettingsController:SaveSettings()
	end
	function ClientSettingsController:GetMouseSensitivity()
		return self.mouseSensitivity
	end
	function ClientSettingsController:SetMouseSensitivity(value)
		self.mouseSensitivity = value
	end
	function ClientSettingsController:GetTouchSensitivity()
		return self.touchSensitivity
	end
	function ClientSettingsController:SetTouchSensitivity(value)
		self.touchSensitivity = value
	end
	function ClientSettingsController:GetAmbientSound()
		return self.ambientSound
	end
	function ClientSettingsController:SetAmbientSound(val)
		self.ambientSound = val;
		(Flamework.resolveDependency("Bundles/Client/Controllers/Global/AmbientSound/AmbientSoundController@AmbientSoundController")):SetVolume(val * 0.5)
	end
	function ClientSettingsController:SetGlobalVolume(volume)
		self.globalVolume = volume
		Bridge:SetVolume(volume)
	end
	function ClientSettingsController:GetGlobalVolume()
		return self.globalVolume
	end
	function ClientSettingsController:GetFirstPersonFov()
		return self.firstPersonFov
	end
	function ClientSettingsController:GetThirdPersonFov()
		return self.thirdPersonFov
	end
end
-- (Flamework) ClientSettingsController metadata
Reflect.defineMetadata(ClientSettingsController, "identifier", "Bundles/Client/Controllers/Global/ClientSettings/ClientSettingsController@ClientSettingsController")
Reflect.defineMetadata(ClientSettingsController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ClientSettingsController, "$:flamework@Controller", Controller, { {} })
return {
	ClientSettingsController = ClientSettingsController,
}
-- ----------------------------------
-- ----------------------------------
