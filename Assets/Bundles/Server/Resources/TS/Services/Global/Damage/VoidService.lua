-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local SetInterval = require("Shared/TS/Util/Timer").SetInterval
local DamageType = require("Shared/TS/Damage/DamageType").DamageType
local VoidService
do
	VoidService = setmetatable({}, {
		__tostring = function()
			return "VoidService"
		end,
	})
	VoidService.__index = VoidService
	function VoidService.new(...)
		local self = setmetatable({}, VoidService)
		return self:constructor(...) or self
	end
	function VoidService:constructor(entityService, damageService)
		self.entityService = entityService
		self.damageService = damageService
	end
	function VoidService:OnStart()
		SetInterval(1, function()
			for _, entity in self.entityService:GetEntities() do
				if entity.networkObject.transform.position.y <= -20 then
					self.damageService:InflictDamage(entity, math.huge, {
						damageType = DamageType.VOID,
					})
				end
			end
		end)
	end
end
-- (Flamework) VoidService metadata
Reflect.defineMetadata(VoidService, "identifier", "Bundles/Server/Services/Global/Damage/VoidService@VoidService")
Reflect.defineMetadata(VoidService, "flamework:parameters", { "Bundles/Server/Services/Global/Entity/EntityService@EntityService", "Bundles/Server/Services/Global/Damage/DamageService@DamageService" })
Reflect.defineMetadata(VoidService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(VoidService, "$:flamework@Service", Service, { {} })
return {
	VoidService = VoidService,
}
-- ----------------------------------
-- ----------------------------------
