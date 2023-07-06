-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local LobbyController
do
	LobbyController = setmetatable({}, {
		__tostring = function()
			return "LobbyController"
		end,
	})
	LobbyController.__index = LobbyController
	function LobbyController.new(...)
		local self = setmetatable({}, LobbyController)
		return self:constructor(...) or self
	end
	function LobbyController:constructor()
	end
	function LobbyController:OnStart()
		print("Lobby controller!")
	end
end
-- (Flamework) LobbyController metadata
Reflect.defineMetadata(LobbyController, "identifier", "Bundles/Client/Controllers/Lobby/lobby-controller@LobbyController")
Reflect.defineMetadata(LobbyController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(LobbyController, "$:flamework@Controller", Controller, { {} })
return {
	LobbyController = LobbyController,
}
-- ----------------------------------
-- ----------------------------------
