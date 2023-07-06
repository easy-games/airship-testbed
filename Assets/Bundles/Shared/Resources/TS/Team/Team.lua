-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Game = require("Shared/TS/Game").Game
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local ChangeTeamSignal = require("Shared/TS/Team/TeamJoinSignal").ChangeTeamSignal
local Team
do
	Team = setmetatable({}, {
		__tostring = function()
			return "Team"
		end,
	})
	Team.__index = Team
	function Team.new(...)
		local self = setmetatable({}, Team)
		return self:constructor(...) or self
	end
	function Team:constructor(name, id, color)
		self.name = name
		self.id = id
		self.color = color
		self.players = {}
		self.onPlayerAdded = Signal.new()
		self.onPlayerRemoved = Signal.new()
	end
	function Team:GetPlayers()
		return self.players
	end
	function Team:AddPlayer(player)
		local oldTeam = player:GetTeam()
		local _players = self.players
		local _player = player
		_players[_player] = true
		player:SetTeam(self)
		self.onPlayerAdded:Fire(player)
		if RunUtil:IsClient() then
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Client/TS/ClientSignals"))
			end)
			local _arg0 = function(i)
				i.ClientSignals.PlayerChangeTeam:Fire(ChangeTeamSignal.new(player, self, oldTeam))
			end
			_promise:andThen(_arg0)
		else
			local _promise = TS.Promise.new(function(resolve)
				resolve(require("Server/TS/ServerSignals"))
			end)
			local _arg0 = function(i)
				i.ServerSignals.PlayerChangeTeam:Fire(ChangeTeamSignal.new(player, self, oldTeam))
			end
			_promise:andThen(_arg0)
		end
	end
	function Team:RemovePlayer(player)
		local _players = self.players
		local _player = player
		-- ▼ Set.delete ▼
		local _valueExisted = _players[_player] ~= nil
		_players[_player] = nil
		-- ▲ Set.delete ▲
		if _valueExisted then
			self.onPlayerRemoved:Fire(player)
		end
	end
	function Team:Encode()
		local playerIds = {}
		for player in self.players do
			local _userId = player.userId
			table.insert(playerIds, _userId)
		end
		return {
			name = self.name,
			id = self.id,
			userIds = playerIds,
			color = { self.color.r, self.color.g, self.color.b, self.color.a },
		}
	end
	function Team:HasLocalPlayer()
		local _condition = Game.LocalPlayer ~= nil
		if _condition then
			local _players = self.players
			local _localPlayer = Game.LocalPlayer
			_condition = _players[_localPlayer] ~= nil
		end
		return _condition
	end
end
return {
	Team = Team,
}
-- ----------------------------------
-- ----------------------------------
