-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local Network = require("Shared/TS/Network").Network
local Player = require("Shared/TS/Player/Player").Player
local Signal = require("Shared/TS/Util/Signal").Signal
local PlayerService
do
	PlayerService = setmetatable({}, {
		__tostring = function()
			return "PlayerService"
		end,
	})
	PlayerService.__index = PlayerService
	function PlayerService.new(...)
		local self = setmetatable({}, PlayerService)
		return self:constructor(...) or self
	end
	function PlayerService:constructor()
		self.PlayerPreReady = Signal.new()
		self.PlayerAdded = Signal.new()
		self.PlayerRemoved = Signal.new()
		self.players = {}
		self.playersPendingReady = {}
		local playerCore = GameObject:Find("Players"):GetComponent("PlayerCore")
		local onPlayerPreJoin = function(clientInfo)
			local player = Player.new(clientInfo.GameObject:GetComponent("NetworkObject"), clientInfo.ClientId, clientInfo.UserId, clientInfo.Username, clientInfo.UsernameTag)
			clientInfo.GameObject.name = "Player_" .. clientInfo.Username
			local _playersPendingReady = self.playersPendingReady
			local _clientId = clientInfo.ClientId
			_playersPendingReady[_clientId] = player
			self.PlayerPreReady:Fire(player)
		end
		local onPlayerRemoved = function(clientInfo)
			local clientId = clientInfo.ClientId
			local _players = self.players
			local _arg0 = function(player)
				return player.clientId == clientId
			end
			-- ▼ ReadonlyArray.findIndex ▼
			local _result = -1
			for _i, _v in _players do
				if _arg0(_v, _i - 1, _players) == true then
					_result = _i - 1
					break
				end
			end
			-- ▲ ReadonlyArray.findIndex ▲
			local index = _result
			if index == -1 then
				return nil
			end
			local player = self.players[index + 1]
			table.remove(self.players, index + 1)
			self.PlayerRemoved:Fire(player)
			ServerSignals.PlayerLeave:fire(player)
			Network.ServerToClient.RemovePlayer.Server:FireAllClients(player.clientId)
			player:Destroy()
		end
		local players = playerCore:GetPlayers()
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < players.Length) then
					break
				end
				local clientInfo = players:GetValue(i)
				onPlayerPreJoin(clientInfo)
			end
		end
		playerCore:OnPlayerAdded(function(clientInfo)
			onPlayerPreJoin(clientInfo)
		end)
		playerCore:OnPlayerRemoved(function(clientInfo)
			onPlayerRemoved(clientInfo)
		end)
		-- Player completes join
		Network.ClientToServer.Ready.Server:OnClientEvent(function(clientId)
			local _playersPendingReady = self.playersPendingReady
			local _clientId = clientId
			if not (_playersPendingReady[_clientId] ~= nil) then
				-- print("player not found in pending: " + clientId);
				error("Player not found in pending: " .. tostring(clientId))
			end
			local _playersPendingReady_1 = self.playersPendingReady
			local _clientId_1 = clientId
			local player = _playersPendingReady_1[_clientId_1]
			local _playersPendingReady_2 = self.playersPendingReady
			local _clientId_2 = clientId
			_playersPendingReady_2[_clientId_2] = nil
			table.insert(self.players, player)
			Network.ServerToClient.AddPlayer.Server:FireAllClients(player:Encode())
			local _fn = Network.ServerToClient.AllPlayers.Server
			local _exp = player.clientId
			local _players = self.players
			local _arg0 = function(p)
				return p:Encode()
			end
			-- ▼ ReadonlyArray.map ▼
			local _newValue = table.create(#_players)
			for _k, _v in _players do
				_newValue[_k] = _arg0(_v, _k - 1, _players)
			end
			-- ▲ ReadonlyArray.map ▲
			_fn:FireClient(_exp, _newValue)
			self.PlayerAdded:Fire(player)
			ServerSignals.PlayerJoin:fire(player)
		end)
	end
	function PlayerService:GetPlayers()
		return self.players
	end
	function PlayerService:GetPlayerFromClientId(clientId)
		local _players = self.players
		local _arg0 = function(player)
			return player.clientId == clientId
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _players do
			if _arg0(_v, _i - 1, _players) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		local player = _result
		return player
	end
	function PlayerService:GetPlayerFromUsername(name)
		local _players = self.players
		local _arg0 = function(player)
			return player.username == name
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _players do
			if _arg0(_v, _i - 1, _players) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		local player = _result
		return player
	end
	function PlayerService:ObservePlayers(observer)
		local cleanupPerPlayer = {}
		local observe = function(player)
			local cleanup = observer(player)
			if cleanup ~= nil then
				local _player = player
				cleanupPerPlayer[_player] = cleanup
			end
		end
		for _, player in self.players do
			observe(player)
		end
		local stopPlayerAdded = self.PlayerAdded:Connect(function(player)
			observe(player)
		end)
		local stopPlayerRemoved = self.PlayerRemoved:Connect(function(player)
			local _player = player
			local cleanup = cleanupPerPlayer[_player]
			if cleanup ~= nil then
				cleanup()
				local _player_1 = player
				cleanupPerPlayer[_player_1] = nil
			end
		end)
		return function()
			stopPlayerAdded()
			stopPlayerRemoved()
			for player, cleanup in cleanupPerPlayer do
				cleanup()
			end
		end
	end
	function PlayerService:OnStart()
	end
end
-- (Flamework) PlayerService metadata
Reflect.defineMetadata(PlayerService, "identifier", "Bundles/Server/Services/Global/Player/PlayerService@PlayerService")
Reflect.defineMetadata(PlayerService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(PlayerService, "$:flamework@Service", Service, { {} })
return {
	PlayerService = PlayerService,
}
-- ----------------------------------
-- ----------------------------------
