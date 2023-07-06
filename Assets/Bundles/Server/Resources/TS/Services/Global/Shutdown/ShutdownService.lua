-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local SetInterval = require("Shared/TS/Util/Timer").SetInterval
local ShutdownService
do
	ShutdownService = setmetatable({}, {
		__tostring = function()
			return "ShutdownService"
		end,
	})
	ShutdownService.__index = ShutdownService
	function ShutdownService.new(...)
		local self = setmetatable({}, ShutdownService)
		return self:constructor(...) or self
	end
	function ShutdownService:constructor(playerService)
		self.playerService = playerService
		self.playerConnected = false
		self.timeWithNoPlayers = 0
	end
	function ShutdownService:OnStart()
		ServerSignals.PlayerJoin:connect(function(event)
			self.playerConnected = true
			self.timeWithNoPlayers = 0
		end)
		local intervalTime = 10
		SetInterval(intervalTime, function()
			if #self.playerService:GetPlayers() == 0 then
				self.timeWithNoPlayers += intervalTime
				if RunUtil:IsEditor() then
					return nil
				end
				if self.playerConnected then
					if self.timeWithNoPlayers >= ShutdownService.SHUTDOWN_TIME_ALL_PLAYERS_LEFT then
						print("Server will shutdown due to excessive time with all players having left.")
						self:Shutdown()
					end
				else
					if self.timeWithNoPlayers >= ShutdownService.SHUTDOWN_TIME_NOBODY_CONNECTED then
						print("Server will shutdown due to excessive time with nobody ever connecting.")
						self:Shutdown()
					end
				end
			end
		end)
	end
	function ShutdownService:Shutdown()
		local serverBootstrap = GameObject:Find("ServerBootstrap"):GetComponent("ServerBootstrap")
		serverBootstrap:Shutdown()
	end
	ShutdownService.SHUTDOWN_TIME_NOBODY_CONNECTED = 10 * 60
	ShutdownService.SHUTDOWN_TIME_ALL_PLAYERS_LEFT = 1 * 60
end
-- (Flamework) ShutdownService metadata
Reflect.defineMetadata(ShutdownService, "identifier", "Bundles/Server/Services/Global/Shutdown/ShutdownService@ShutdownService")
Reflect.defineMetadata(ShutdownService, "flamework:parameters", { "Bundles/Server/Services/Global/Player/PlayerService@PlayerService" })
Reflect.defineMetadata(ShutdownService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ShutdownService, "$:flamework@Service", Service, { {} })
return {
	ShutdownService = ShutdownService,
}
-- ----------------------------------
-- ----------------------------------
