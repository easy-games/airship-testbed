-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local DamageType = require("Shared/TS/Damage/DamageType").DamageType
local Entity = require("Shared/TS/Entity/Entity").Entity
local SetInterval = require("Shared/TS/Util/Timer").SetInterval
local KillCreditService
do
	KillCreditService = setmetatable({}, {
		__tostring = function()
			return "KillCreditService"
		end,
	})
	KillCreditService.__index = KillCreditService
	function KillCreditService.new(...)
		local self = setmetatable({}, KillCreditService)
		return self:constructor(...) or self
	end
	function KillCreditService:constructor()
		self.entityIdToDamageCreditMap = {}
		self.expireTime = 4
		self.damageTypes = {
			[DamageType.VOID] = true,
			[DamageType.FALL] = true,
		}
	end
	function KillCreditService:OnStart()
		ServerSignals.EntityDamage:ConnectWithPriority(500, function(event)
			if event.fromEntity then
				local _entityIdToDamageCreditMap = self.entityIdToDamageCreditMap
				local _id = event.entity.id
				local _arg1 = {
					creditToEntityId = event.fromEntity.id,
					time = os.clock(),
				}
				_entityIdToDamageCreditMap[_id] = _arg1
			end
		end)
		ServerSignals.EntityDeath:ConnectWithPriority(0, function(event)
			local _damageTypes = self.damageTypes
			local _damageType = event.damageEvent.damageType
			local _condition = _damageTypes[_damageType] ~= nil
			if _condition then
				_condition = event.killer == nil
			end
			if _condition then
				local _entityIdToDamageCreditMap = self.entityIdToDamageCreditMap
				local _id = event.entity.id
				local credit = _entityIdToDamageCreditMap[_id]
				if credit then
					local killerEntity = Entity:FindById(credit.creditToEntityId)
					if killerEntity then
						event.killer = killerEntity
					end
				end
			end
		end)
		-- Expire old entries
		SetInterval(2, function()
			local toRemove = {}
			for _, key in Object.keys(self.entityIdToDamageCreditMap) do
				local credit = self.entityIdToDamageCreditMap[key]
				if os.clock() - credit.time > self.expireTime then
					table.insert(toRemove, key)
				end
			end
			for _, id in toRemove do
				self.entityIdToDamageCreditMap[id] = nil
			end
		end)
	end
end
-- (Flamework) KillCreditService metadata
Reflect.defineMetadata(KillCreditService, "identifier", "Bundles/Server/Services/Match/Damage/KillCreditService@KillCreditService")
Reflect.defineMetadata(KillCreditService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(KillCreditService, "$:flamework@Service", Service, { {} })
return {
	KillCreditService = KillCreditService,
}
-- ----------------------------------
-- ----------------------------------
