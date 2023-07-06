-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local SetInterval = require("Shared/TS/Util/Timer").SetInterval
local TIME_UNTIL_REGEN = 5
local REGEN_PER_SECOND = 5
local REGEN_TICKS_PER_SECOND = 5
local HealthRegenService
do
	HealthRegenService = setmetatable({}, {
		__tostring = function()
			return "HealthRegenService"
		end,
	})
	HealthRegenService.__index = HealthRegenService
	function HealthRegenService.new(...)
		local self = setmetatable({}, HealthRegenService)
		return self:constructor(...) or self
	end
	function HealthRegenService:constructor(entityService)
		self.entityService = entityService
	end
	function HealthRegenService:OnStart()
		local regenAmount = REGEN_PER_SECOND / REGEN_TICKS_PER_SECOND
		SetInterval(1 / REGEN_TICKS_PER_SECOND, function()
			for _, entity in self.entityService:GetEntities() do
				if entity:GetHealth() < entity:GetMaxHealth() then
					if entity:TimeSinceLastDamaged() >= TIME_UNTIL_REGEN then
						entity:SetHealth(entity:GetHealth() + regenAmount)
					end
				end
			end
		end)
	end
end
-- (Flamework) HealthRegenService metadata
Reflect.defineMetadata(HealthRegenService, "identifier", "Bundles/Server/Services/Match/Damage/HealthRegenService@HealthRegenService")
Reflect.defineMetadata(HealthRegenService, "flamework:parameters", { "Bundles/Server/Services/Global/Entity/EntityService@EntityService" })
Reflect.defineMetadata(HealthRegenService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(HealthRegenService, "$:flamework@Service", Service, { {} })
return {
	HealthRegenService = HealthRegenService,
}
-- ----------------------------------
-- ----------------------------------
