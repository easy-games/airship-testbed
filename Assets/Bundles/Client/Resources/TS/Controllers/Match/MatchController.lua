-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local MatchState = require("Shared/TS/Match/MatchState").MatchState
local Network = require("Shared/TS/Network").Network
local MatchController
do
	MatchController = setmetatable({}, {
		__tostring = function()
			return "MatchController"
		end,
	})
	MatchController.__index = MatchController
	function MatchController.new(...)
		local self = setmetatable({}, MatchController)
		return self:constructor(...) or self
	end
	function MatchController:constructor()
		self.state = MatchState.SETUP
	end
	function MatchController:OnStart()
		-- Listen for match state change.
		Network.ServerToClient.MatchStateChange.Client:OnServerEvent(function(newState, oldState)
			self.state = newState
			-- Fire signal.
			ClientSignals.MatchStateChange:Fire({
				newState = self.state,
				oldState = oldState,
			})
		end)
		-- Listen for match start.
		Network.ServerToClient.MatchStarted.Client:OnServerEvent(function()
			self.state = MatchState.RUNNING
			-- Fire signal
			ClientSignals.MatchStart:Fire()
		end)
	end
	function MatchController:GetState()
		return self.state
	end
end
-- (Flamework) MatchController metadata
Reflect.defineMetadata(MatchController, "identifier", "Bundles/Client/Controllers/Match/MatchController@MatchController")
Reflect.defineMetadata(MatchController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(MatchController, "$:flamework@Controller", Controller, { {} })
return {
	MatchController = MatchController,
}
-- ----------------------------------
-- ----------------------------------
