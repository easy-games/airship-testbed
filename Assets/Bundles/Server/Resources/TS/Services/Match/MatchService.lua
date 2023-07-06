-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local MatchState = require("Shared/TS/Match/MatchState").MatchState
local Network = require("Shared/TS/Network").Network
local Queues = require("Shared/TS/Queue/QueueDefinitions").Queues
local QueueType = require("Shared/TS/Queue/QueueType").QueueType
local Task = require("Shared/TS/Util/Task").Task
local MatchService
do
	MatchService = setmetatable({}, {
		__tostring = function()
			return "MatchService"
		end,
	})
	MatchService.__index = MatchService
	function MatchService.new(...)
		local self = setmetatable({}, MatchService)
		return self:constructor(...) or self
	end
	function MatchService:constructor()
		self.state = MatchState.SETUP
		-- Load queue type from server bootstrap.
		local serverBootstrap = GameObject:Find("ServerBootstrap"):GetComponent("ServerBootstrap")
		local q = serverBootstrap:GetQueueType()
		-- If queue type does not exist, kill thread.
		if not (table.find(Object.values(QueueType), q) ~= nil) then
			print("[FATAL]: Invalid queue type: " .. q)
			error()
		end
		self.queueType = q
	end
	function MatchService:OnStart()
		(Flamework.resolveDependency("Bundles/Server/Services/Match/Map/MapService@MapService")):WaitForMapLoaded()
		-- Immediately transition into `MatchState.PRE` after map load.
		self:SetState(MatchState.PRE)
	end
	function MatchService:WaitForMatchReady()
		if self.state ~= MatchState.SETUP then
			return nil
		end
		while self.state == MatchState.SETUP do
			Task:Wait(0.1)
		end
	end
	function MatchService:WaitForQueueReady()
		if self.queueType then
			return self:GetQueueMeta()
		end
		while not self.queueType do
			Task:Wait(0.1)
		end
		return self:GetQueueMeta()
	end
	function MatchService:GetState()
		return self.state
	end
	function MatchService:IsRunning()
		return self.state == MatchState.RUNNING
	end
	function MatchService:StartMatch()
		if self.state ~= MatchState.PRE then
			return nil
		end
		self:SetState(MatchState.RUNNING)
		-- Fire signal and remote.
		ServerSignals.MatchStart:fire()
		Network.ServerToClient.MatchStarted.Server:FireAllClients()
	end
	function MatchService:EndMatch(winningTeam)
		if self.state ~= MatchState.RUNNING then
			return nil
		end
		self:SetState(MatchState.POST)
		-- Fire signal and remote.
		ServerSignals.MatchEnded:Fire({
			winningTeam = winningTeam,
		})
		local _fn = Network.ServerToClient.MatchEnded.Server
		local _result = winningTeam
		if _result ~= nil then
			_result = _result.id
		end
		_fn:FireAllClients(_result)
	end
	function MatchService:SetState(state)
		local oldState = self.state
		self.state = state
		-- Fire signal and remote.
		ServerSignals.MatchStateChange:Fire({
			newState = self.state,
			oldState = oldState,
		})
		Network.ServerToClient.MatchStateChange.Server:FireAllClients(self.state, oldState)
	end
	function MatchService:GetQueueType()
		return self.queueType
	end
	function MatchService:GetQueueMeta()
		return Queues[self.queueType]
	end
end
-- (Flamework) MatchService metadata
Reflect.defineMetadata(MatchService, "identifier", "Bundles/Server/Services/Match/MatchService@MatchService")
Reflect.defineMetadata(MatchService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(MatchService, "$:flamework@Service", Service, { {} })
return {
	MatchService = MatchService,
}
-- ----------------------------------
-- ----------------------------------
