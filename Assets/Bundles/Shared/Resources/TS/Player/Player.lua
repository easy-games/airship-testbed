-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local Network = require("Shared/TS/Network").Network
local Bin = require("Shared/TS/Util/Bin").Bin
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local Player
do
	Player = setmetatable({}, {
		__tostring = function()
			return "Player"
		end,
	})
	Player.__index = Player
	function Player.new(...)
		local self = setmetatable({}, Player)
		return self:constructor(...) or self
	end
	function Player:constructor(nob, clientId, userId, username, usernameTag)
		self.nob = nob
		self.clientId = clientId
		self.userId = userId
		self.username = username
		self.usernameTag = usernameTag
		self.CharacterChanged = Signal.new()
		self.OnLeave = Signal.new()
		self.OnChangeTeam = Signal.new()
		self.bin = Bin.new()
		self.connected = true
	end
	function Player:SetTeam(team)
		local oldTeam = self.team
		self.team = team
		self.OnChangeTeam:Fire(team, oldTeam)
	end
	function Player:GetTeam()
		return self.team
	end
	function Player:SendMessage(message)
		if RunUtil:IsServer() then
			Network.ServerToClient.ChatMessage.Server:FireClient(self.clientId, message)
		else
			(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Chat/ChatController@ChatController")):AddChatMessage(message)
		end
	end
	function Player:IsFriend()
		return false
	end
	function Player:IsBot()
		return false
	end
	function Player:Encode()
		local _object = {
			nobId = self.nob.ObjectId,
			clientId = self.clientId,
			userId = self.userId,
			username = self.username,
			usernameTag = self.usernameTag,
		}
		local _left = "teamId"
		local _result = self.team
		if _result ~= nil then
			_result = _result.id
		end
		_object[_left] = _result
		return _object
	end
	function Player:SetCharacter(entity)
		local _result = entity
		if _result ~= nil then
			_result = _result:GetDisplayName()
		end
		local _condition = _result
		if _condition == nil then
			_condition = "undefined"
		end
		print("setCharacter " .. _condition)
		self.Character = entity
		self.CharacterChanged:Fire(entity)
	end
	function Player:ObserveCharacter(observer)
		local bin = Bin.new()
		local cleanup = observer(self.Character)
		bin:Add(self.CharacterChanged:Connect(function(newPawn)
			local _result = cleanup
			if _result ~= nil then
				_result()
			end
			cleanup = observer(newPawn)
		end))
		self.bin:Add(bin)
		return bin
	end
	function Player:IsConnected()
		return self.connected
	end
	function Player:Destroy()
		self.connected = false
		self.bin:Clean()
		self.OnLeave:Fire()
		self.OnLeave:DisconnectAll()
	end
end
return {
	Player = Player,
}
-- ----------------------------------
-- ----------------------------------
