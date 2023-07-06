-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local Game = require("Shared/TS/Game").Game
local Team = require("Shared/TS/Team/Team").Team
local ColorUtil = require("Shared/TS/Util/ColorUtil").ColorUtil
local Theme = require("Shared/TS/Util/Theme").Theme
local BWTeamService
do
	BWTeamService = setmetatable({}, {
		__tostring = function()
			return "BWTeamService"
		end,
	})
	BWTeamService.__index = BWTeamService
	function BWTeamService.new(...)
		local self = setmetatable({}, BWTeamService)
		return self:constructor(...) or self
	end
	function BWTeamService:constructor(teamService, matchService)
		self.teamService = teamService
		self.matchService = matchService
	end
	function BWTeamService:OnStart()
		local queueMeta = self.matchService:GetQueueMeta()
		for _, team in queueMeta.teams do
			local t = Team.new(team.name, team.id, team.color)
			self.teamService:RegisterTeam(t)
		end
		-- Temporary: even team distribution
		ServerSignals.PlayerJoin:connect(function(event)
			local teams = self.teamService:GetTeams()
			local smallestTeam = teams[1]
			for _, t in teams do
				-- ▼ ReadonlySet.size ▼
				local _size = 0
				for _1 in t:GetPlayers() do
					_size += 1
				end
				-- ▲ ReadonlySet.size ▲
				-- ▼ ReadonlySet.size ▼
				local _size_1 = 0
				for _1 in smallestTeam:GetPlayers() do
					_size_1 += 1
				end
				-- ▲ ReadonlySet.size ▲
				if _size < _size_1 then
					smallestTeam = t
				end
			end
			smallestTeam:AddPlayer(event.player)
			local color = ColorUtil:ColorToHex(smallestTeam.color)
			Game:BroadcastMessage("<b><color=" .. (color .. (">" .. (event.player.username .. ("</color></b> <color=" .. (ColorUtil:ColorToHex(Theme.Gray) .. ">joined the server.</color>"))))))
		end)
		ServerSignals.PlayerLeave:connect(function(event)
			local team = event.player:GetTeam()
			if team then
				local color = ColorUtil:ColorToHex(team.color)
				Game:BroadcastMessage("<b><color=" .. (color .. (">" .. (event.player.username .. ("</color></b> <color=" .. (ColorUtil:ColorToHex(Theme.Gray) .. ">left the server.</color>"))))))
			else
				Game:BroadcastMessage("<b>" .. (event.player.username .. ("</b> <color=" .. (ColorUtil:ColorToHex(Theme.Gray) .. ">left.</color>"))))
			end
		end)
	end
end
-- (Flamework) BWTeamService metadata
Reflect.defineMetadata(BWTeamService, "identifier", "Bundles/Server/Services/Match/BW/BWTeamService@BWTeamService")
Reflect.defineMetadata(BWTeamService, "flamework:parameters", { "Bundles/Server/Services/Global/Team/TeamService@TeamService", "Bundles/Server/Services/Match/MatchService@MatchService" })
Reflect.defineMetadata(BWTeamService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BWTeamService, "$:flamework@Service", Service, { {} })
return {
	BWTeamService = BWTeamService,
}
-- ----------------------------------
-- ----------------------------------
