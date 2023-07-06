-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local SyncEventPriority = require("Shared/rbxts_include/node_modules/@easy-games/unity-sync-event/out/init").SyncEventPriority
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local Network = require("Shared/TS/Network").Network
local Bin = require("Shared/TS/Util/Bin").Bin
local TeamService
do
	TeamService = setmetatable({}, {
		__tostring = function()
			return "TeamService"
		end,
	})
	TeamService.__index = TeamService
	function TeamService.new(...)
		local self = setmetatable({}, TeamService)
		return self:constructor(...) or self
	end
	function TeamService:constructor()
		self.teams = {}
	end
	function TeamService:OnStart()
		ServerSignals.PlayerJoin:setPriority(SyncEventPriority.LOWEST):connect(function(event)
			local _exp = Object.values(self.teams)
			local _arg0 = function(e)
				return e.team:Encode()
			end
			-- ▼ ReadonlyArray.map ▼
			local _newValue = table.create(#_exp)
			for _k, _v in _exp do
				_newValue[_k] = _arg0(_v, _k - 1, _exp)
			end
			-- ▲ ReadonlyArray.map ▲
			local teamDtos = _newValue
			Network.ServerToClient.AddTeams.Server:FireClient(event.player.clientId, teamDtos)
		end)
	end
	function TeamService:RegisterTeam(team)
		local _teams = self.teams
		local _id = team.id
		if _teams[_id] ~= nil then
			print("Tried to register duplicate team id: " .. team.id .. ". Ignoring.")
			return nil
		end
		local entry = {
			team = team,
			bin = Bin.new(),
		}
		local _teams_1 = self.teams
		local _id_1 = team.id
		_teams_1[_id_1] = entry
		local dto = team:Encode()
		Network.ServerToClient.AddTeams.Server:FireAllClients({ dto })
		entry.bin:Add(team.onPlayerAdded:Connect(function(player)
			Network.ServerToClient.AddPlayerToTeam.Server:FireAllClients(team.id, player.userId)
		end))
		entry.bin:Add(team.onPlayerRemoved:Connect(function(player)
			Network.ServerToClient.RemovePlayerFromTeam.Server:FireAllClients(team.id, player.userId)
		end))
	end
	function TeamService:RemoveTeam(team)
		local _teams = self.teams
		local _id = team.id
		local entry = _teams[_id]
		if not entry then
			return nil
		end
		entry.bin:Clean()
		Network.ServerToClient.RemoveTeams.Server:FireAllClients({ team.id })
	end
	function TeamService:GetTeams()
		local _exp = Object.values(self.teams)
		local _arg0 = function(entry)
			return entry.team
		end
		-- ▼ ReadonlyArray.map ▼
		local _newValue = table.create(#_exp)
		for _k, _v in _exp do
			_newValue[_k] = _arg0(_v, _k - 1, _exp)
		end
		-- ▲ ReadonlyArray.map ▲
		return _newValue
	end
	function TeamService:GetTeamByName(teamName)
		local _exp = Object.values(self.teams)
		local _arg0 = function(entry)
			return entry.team.name == teamName
		end
		-- ▼ ReadonlyArray.find ▼
		local _result
		for _i, _v in _exp do
			if _arg0(_v, _i - 1, _exp) == true then
				_result = _v
				break
			end
		end
		-- ▲ ReadonlyArray.find ▲
		local _result_1 = _result
		if _result_1 ~= nil then
			_result_1 = _result_1.team
		end
		return _result_1
	end
	function TeamService:GetTeamById(teamId)
		local _teams = self.teams
		local _teamId = teamId
		local _result = _teams[_teamId]
		if _result ~= nil then
			_result = _result.team
		end
		return _result
	end
end
-- (Flamework) TeamService metadata
Reflect.defineMetadata(TeamService, "identifier", "Bundles/Server/Services/Global/Team/TeamService@TeamService")
Reflect.defineMetadata(TeamService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(TeamService, "$:flamework@Service", Service, { {} })
return {
	TeamService = TeamService,
}
-- ----------------------------------
-- ----------------------------------
