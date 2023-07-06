-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local _Timer = require("Shared/TS/Util/Timer")
local OnFixedUpdate = _Timer.OnFixedUpdate
local OnLateUpdate = _Timer.OnLateUpdate
local OnTick = _Timer.OnTick
local OnUpdate = _Timer.OnUpdate
local BedWars = require("Shared/TS/BedWars/BedWars").BedWars
local InitNet = require("Shared/TS/Network/NetworkAPI").InitNet
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local SetupWorld = require("Shared/TS/VoxelWorld/SetupWorld").SetupWorld
local function LoadFlamework()
	Flamework.addPath("assets/game/bedwars/bundles/server/resources/ts/services/global", "^.*service.lua$")
	if BedWars:IsMatchServer() then
		Flamework.addPath("assets/game/bedwars/bundles/server/resources/ts/services/match", "^.*service.lua$")
	elseif BedWars:IsLobbyServer() then
		Flamework.addPath("assets/game/bedwars/bundles/server/resources/ts/services/lobby", "^.*service.lua$")
	end
	Flamework.ignite()
end
local function LoadServer()
	InitNet()
	SetupWorld()
	LoadFlamework()
	local serverBootstrap = GameObject:Find("ServerBootstrap"):GetComponent("ServerBootstrap")
	serverBootstrap:FinishedSetup()
end
local function SetupServer()
	-- Drive timer:
	gameObject:OnUpdate(function()
		OnUpdate:Fire(TimeUtil:GetDeltaTime())
	end)
	gameObject:OnLateUpdate(function()
		OnLateUpdate:Fire(TimeUtil:GetDeltaTime())
	end)
	gameObject:OnFixedUpdate(function()
		OnFixedUpdate:Fire(TimeUtil:GetFixedDeltaTime())
	end)
	InstanceFinder.TimeManager:OnOnTick(function()
		OnTick:Fire()
	end)
	LoadServer()
end
return {
	SetupServer = SetupServer,
}
-- ----------------------------------
-- ----------------------------------
