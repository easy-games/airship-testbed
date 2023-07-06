-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Network = require("Shared/TS/Network").Network
local SetUtil = require("Shared/TS/Util/SetUtil").SetUtil
local BWController
do
	BWController = setmetatable({}, {
		__tostring = function()
			return "BWController"
		end,
	})
	BWController.__index = BWController
	function BWController.new(...)
		local self = setmetatable({}, BWController)
		return self:constructor(...) or self
	end
	function BWController:constructor(teamController, playerController)
		self.teamController = teamController
		self.playerController = playerController
		self.eliminatedPlayers = {}
	end
	function BWController:OnStart()
		-- Listen for player eliminated.
		Network.ServerToClient.PlayerEliminated.Client:OnServerEvent(function(clientId)
			local player = self.playerController:GetPlayerFromClientId(clientId)
			if not player then
				return nil
			end
			self.eliminatedPlayers[player] = true
			ClientSignals.PlayerEliminated:Fire({
				player = player,
			})
		end)
		-- Listen for match end.
		Network.ServerToClient.MatchEnded.Client:OnServerEvent(function(winningTeamId)
			if winningTeamId ~= "" and winningTeamId then
				self:ShowWinscreen(winningTeamId)
			end
		end)
	end
	function BWController:IsPlayerEliminated(player)
		local _eliminatedPlayers = self.eliminatedPlayers
		local _player = player
		return _eliminatedPlayers[_player] ~= nil
	end
	function BWController:GetEliminatedPlayers()
		return SetUtil:ToArray(self.eliminatedPlayers)
	end
	function BWController:GetEliminatedPlayersOnTeam(team)
		local _exp = SetUtil:ToArray(self.eliminatedPlayers)
		local _arg0 = function(player)
			local _result = player:GetTeam()
			if _result ~= nil then
				_result = _result.id
			end
			return _result == team.id
		end
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in _exp do
			if _arg0(_v, _k - 1, _exp) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		return _newValue
	end
	function BWController:GetAlivePlayersOnTeam(team)
		local _exp = self.playerController:GetPlayers()
		local _arg0 = function(player)
			local _result = player:GetTeam()
			if _result ~= nil then
				_result = _result.id
			end
			local _condition = _result == team.id
			if _condition then
				local _eliminatedPlayers = self.eliminatedPlayers
				local _player = player
				_condition = not (_eliminatedPlayers[_player] ~= nil)
			end
			return _condition
		end
		-- ▼ ReadonlyArray.filter ▼
		local _newValue = {}
		local _length = 0
		for _k, _v in _exp do
			if _arg0(_v, _k - 1, _exp) == true then
				_length += 1
				_newValue[_length] = _v
			end
		end
		-- ▲ ReadonlyArray.filter ▲
		return _newValue
	end
	function BWController:ShowWinscreen(winningTeamId)
		local winningTeam = self.teamController:GetTeam(winningTeamId)
		if winningTeam then
		end
	end
end
-- (Flamework) BWController metadata
Reflect.defineMetadata(BWController, "identifier", "Bundles/Client/Controllers/Match/BWController@BWController")
Reflect.defineMetadata(BWController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Team/TeamController@TeamController", "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController" })
Reflect.defineMetadata(BWController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BWController, "$:flamework@Controller", Controller, { {} })
return {
	BWController = BWController,
}
-- ----------------------------------
-- ----------------------------------
