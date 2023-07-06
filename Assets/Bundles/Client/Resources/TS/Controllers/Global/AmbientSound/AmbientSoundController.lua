-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local AmbientSoundController
do
	AmbientSoundController = setmetatable({}, {
		__tostring = function()
			return "AmbientSoundController"
		end,
	})
	AmbientSoundController.__index = AmbientSoundController
	function AmbientSoundController.new(...)
		local self = setmetatable({}, AmbientSoundController)
		return self:constructor(...) or self
	end
	function AmbientSoundController:constructor()
		local go = GameObject:Create("AmbientSound")
		self.audioSource = go:AddComponent("AudioSource")
	end
	function AmbientSoundController:OnStart()
		local clip = AssetBridge:LoadAsset("Shared/Resources/Sound/Ambience_Forest.ogg")
		self.audioSource.spatialBlend = 0
		self.audioSource.loop = true
		self.audioSource.clip = clip
		self.audioSource.volume = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/ClientSettings/ClientSettingsController@ClientSettingsController")):GetAmbientSound()
		self.audioSource:Play()
	end
	function AmbientSoundController:SetVolume(val)
		self.audioSource.volume = val
	end
end
-- (Flamework) AmbientSoundController metadata
Reflect.defineMetadata(AmbientSoundController, "identifier", "Bundles/Client/Controllers/Global/AmbientSound/AmbientSoundController@AmbientSoundController")
Reflect.defineMetadata(AmbientSoundController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(AmbientSoundController, "$:flamework@Controller", Controller, { {} })
return {
	AmbientSoundController = AmbientSoundController,
}
-- ----------------------------------
-- ----------------------------------
