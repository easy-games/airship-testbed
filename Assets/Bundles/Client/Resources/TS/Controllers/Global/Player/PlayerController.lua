-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Game = require("Shared/TS/Game").Game
local Network = require("Shared/TS/Network").Network
local Player = require("Shared/TS/Player/Player").Player
local WaitForNobId = require("Shared/TS/Util/NetworkUtil").WaitForNobId
local PlayerController
do
	PlayerController = setmetatable({}, {
		__tostring = function()
			return "PlayerController"
		end,
	})
	PlayerController.__index = PlayerController
	function PlayerController.new(...)
		local self = setmetatable({}, PlayerController)
		return self:constructor(...) or self
	end
	function PlayerController:constructor()
		self.players = {
			[Game.LocalPlayer] = true,
		}
		self.LocalConnection = InstanceFinder.ClientManager.Connection
		local _players = self.players
		local _localPlayer = Game.LocalPlayer
		_players[_localPlayer] = true
	end
	function PlayerController:OnStart()
		Network.ServerToClient.AllPlayers.Client:OnServerEvent(function(playerDtos)
			for _, dto in playerDtos do
				self:AddPlayer(dto)
			end
		end)
		Network.ServerToClient.AddPlayer.Client:OnServerEvent(function(playerDto)
			self:AddPlayer(playerDto)
		end)
		Network.ServerToClient.RemovePlayer.Client:OnServerEvent(function(clientId)
			local player = self:GetPlayerFromClientId(clientId)
			if player then
				self.players[player] = nil
				ClientSignals.PlayerLeave:Fire(player)
				player:Destroy()
			end
		end)
	end
	function PlayerController:GetPlayerFromClientId(clientId)
		for player in self.players do
			if player.clientId == clientId then
				return player
			end
		end
		return nil
	end
	function PlayerController:GetPlayerFromUserId(userId)
		for player in self.players do
			-- print("checking player " + player.userId + " to " + userId);
			if player.userId == userId then
				return player
			end
		end
		return nil
	end
	function PlayerController:GetPlayerFromUsername(name)
		for player in self.players do
			if player.username == name then
				return player
			end
		end
		return nil
	end
	function PlayerController:AddPlayer(dto)
		local existing = self:GetPlayerFromClientId(dto.clientId)
		if existing then
			return nil
		end
		local nob = WaitForNobId(dto.nobId)
		nob.gameObject.name = "Player_" .. dto.username
		local team
		local _value = dto.teamId
		if _value ~= "" and _value then
			team = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Team/TeamController@TeamController")):GetTeam(dto.teamId)
		end
		if dto.clientId == self.LocalConnection.ClientId then
			local mutablePlayer = Game.LocalPlayer
			mutablePlayer.nob = nob
			mutablePlayer.clientId = dto.clientId
			mutablePlayer.userId = dto.userId
			mutablePlayer.username = dto.username
			mutablePlayer.usernameTag = dto.usernameTag
			local _result = team
			if _result ~= nil then
				_result:AddPlayer(mutablePlayer)
			end
			return nil
		end
		local player = Player.new(nob, dto.clientId, dto.userId, dto.username, dto.usernameTag)
		local _result = team
		if _result ~= nil then
			_result:AddPlayer(player)
		end
		self.players[player] = true
		ClientSignals.PlayerJoin:Fire(player)
	end
	function PlayerController:GetPlayers()
		return Object.keys(self.players)
	end
end
-- (Flamework) PlayerController metadata
Reflect.defineMetadata(PlayerController, "identifier", "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController")
Reflect.defineMetadata(PlayerController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(PlayerController, "$:flamework@Controller", Controller, { {} })
return {
	PlayerController = PlayerController,
}
-- ----------------------------------
-- ----------------------------------
