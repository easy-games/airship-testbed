-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local Network = require("Shared/TS/Network").Network
local Team = require("Shared/TS/Team/Team").Team
local TeamController
do
	TeamController = setmetatable({}, {
		__tostring = function()
			return "TeamController"
		end,
	})
	TeamController.__index = TeamController
	function TeamController.new(...)
		local self = setmetatable({}, TeamController)
		return self:constructor(...) or self
	end
	function TeamController:constructor(playerController)
		self.playerController = playerController
		self.teams = {}
	end
	function TeamController:OnStart()
		Network.ServerToClient.AddTeams.Client:OnServerEvent(function(teamDtos)
			for _, dto in teamDtos do
				local team = Team.new(dto.name, dto.id, Color.new(dto.color[1], dto.color[2], dto.color[3], dto.color[4]))
				local _teams = self.teams
				local _id = dto.id
				_teams[_id] = team
				for _1, userId in dto.userIds do
					local player = self.playerController:GetPlayerFromUserId(userId)
					if player then
						team:AddPlayer(player)
					end
				end
			end
		end)
		Network.ServerToClient.RemoveTeams.Client:OnServerEvent(function(teamIds)
			for _, teamId in teamIds do
				local team = self:GetTeam(teamId)
				if not team then
					continue
				end
				local _teams = self.teams
				local _teamId = teamId
				_teams[_teamId] = nil
			end
		end)
		Network.ServerToClient.AddPlayerToTeam.Client:OnServerEvent(function(teamId, userId)
			local team = self:GetTeam(teamId)
			if not team then
				return nil
			end
			local player = self.playerController:GetPlayerFromUserId(userId)
			if not player then
				return nil
			end
			team:AddPlayer(player)
		end)
		Network.ServerToClient.RemovePlayerFromTeam.Client:OnServerEvent(function(teamId, playerId)
			local team = self:GetTeam(teamId)
			if not team then
				return nil
			end
			local player = self.playerController:GetPlayerFromUserId(playerId)
			if not player then
				return nil
			end
			team:RemovePlayer(player)
		end)
	end
	function TeamController:GetTeam(teamId)
		local _teams = self.teams
		local _teamId = teamId
		return _teams[_teamId]
	end
	function TeamController:GetTeams()
		return Object.values(self.teams)
	end
end
-- (Flamework) TeamController metadata
Reflect.defineMetadata(TeamController, "identifier", "Bundles/Client/Controllers/Global/Team/TeamController@TeamController")
Reflect.defineMetadata(TeamController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Player/PlayerController@PlayerController" })
Reflect.defineMetadata(TeamController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(TeamController, "$:flamework@Controller", Controller, { {} })
return {
	TeamController = TeamController,
}
-- ----------------------------------
-- ----------------------------------
