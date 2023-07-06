-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Game = require("Shared/TS/Game").Game
local Bin = require("Shared/TS/Util/Bin").Bin
local LoadingScreenController
do
	LoadingScreenController = setmetatable({}, {
		__tostring = function()
			return "LoadingScreenController"
		end,
	})
	LoadingScreenController.__index = LoadingScreenController
	function LoadingScreenController.new(...)
		local self = setmetatable({}, LoadingScreenController)
		return self:constructor(...) or self
	end
	function LoadingScreenController:constructor()
		self.coreLoadingScreen = GameObject:Find("CoreLoadingScreen"):GetComponent("CoreLoadingScreen")
		self.coreLoadingScreen:SetProgress("Loading World", 60)
		if Game.LocalPlayer.Character then
			self:FinishLoading()
		else
			self:SetProgress("Waiting for Character", 85)
			local bin = Bin.new()
			bin:Add(ClientSignals.EntitySpawn:Connect(function(event)
				if event.Entity:IsLocalCharacter() then
					bin:Clean()
					self:FinishLoading()
				end
			end))
		end
	end
	function LoadingScreenController:OnStart()
	end
	function LoadingScreenController:SetProgress(step, progress)
		self.coreLoadingScreen:SetProgress(step, progress)
	end
	function LoadingScreenController:FinishLoading()
		self.coreLoadingScreen:Close()
	end
end
-- (Flamework) LoadingScreenController metadata
Reflect.defineMetadata(LoadingScreenController, "identifier", "Bundles/Client/Controllers/Global/LoadingScreen/LoadingScreenController@LoadingScreenController")
Reflect.defineMetadata(LoadingScreenController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(LoadingScreenController, "$:flamework@Controller", Controller, { {} })
return {
	LoadingScreenController = LoadingScreenController,
}
-- ----------------------------------
-- ----------------------------------
