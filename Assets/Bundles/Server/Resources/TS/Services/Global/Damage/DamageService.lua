-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local EntityDamageServerSignal = require("Server/TS/Signals/EntityDamageServerSignal").EntityDamageServerSignal
local EntityDeathServerSignal = require("Server/TS/Signals/EntityDeathServerSignal").EntityDeathServerSignal
local Network = require("Shared/TS/Network").Network
local DEFAULT_RESPAWN_TIME = require("Shared/TS/Respawn/Respawn").DEFAULT_RESPAWN_TIME
local DamageType = require("Shared/TS/Damage/DamageType").DamageType
local DamageService
do
	DamageService = setmetatable({}, {
		__tostring = function()
			return "DamageService"
		end,
	})
	DamageService.__index = DamageService
	function DamageService.new(...)
		local self = setmetatable({}, DamageService)
		return self:constructor(...) or self
	end
	function DamageService:constructor(entityService)
		self.entityService = entityService
	end
	function DamageService:OnStart()
		Network.ClientToServer.TEST_LATENCY.Server:SetCallback(function(clientId)
			print("-----")
			for _, entity in self.entityService:GetEntities() do
				print(entity:GetDisplayName() .. ": " .. tostring(entity.id))
			end
			print("-----")
			print("Received: " .. tostring(InstanceFinder.TimeManager.Tick))
			local entity = self.entityService:GetEntityByClientId(clientId)
			if not entity then
				return -1
			end
			local entityDriver = entity.gameObject:GetComponent("EntityDriver")
			local dir = entity.model.transform.forward
			local _fn = entityDriver
			local _exp = dir * (-5)
			local _vector3 = Vector3.new(0, 10, 0)
			_fn:Impulse(_exp + _vector3)
			return InstanceFinder.TimeManager.Tick
		end)
	end
	function DamageService:InflictDamage(entity, amount, config)
		local _condition = entity:HasImmunity()
		if _condition then
			local _result = config
			if _result ~= nil then
				_result = _result.ignoreImmunity
			end
			_condition = not _result
		end
		if _condition then
			return false
		end
		if entity:IsDead() then
			return false
		end
		local _exp = entity
		local _exp_1 = amount
		local _result = config
		if _result ~= nil then
			_result = _result.damageType
		end
		local _condition_1 = _result
		if _condition_1 == nil then
			_condition_1 = DamageType.SWORD
		end
		local _result_1 = config
		if _result_1 ~= nil then
			_result_1 = _result_1.fromEntity
		end
		local damageEvent = EntityDamageServerSignal.new(_exp, _exp_1, _condition_1, _result_1)
		ServerSignals.EntityDamage:Fire(damageEvent)
		local _condition_2 = damageEvent:IsCancelled()
		if _condition_2 then
			local _result_2 = config
			if _result_2 ~= nil then
				_result_2 = _result_2.ignoreCancelled
			end
			_condition_2 = not _result_2
		end
		if _condition_2 then
			return false
		end
		local fromPos = nil
		local _result_2 = config
		if _result_2 ~= nil then
			_result_2 = _result_2.fromEntity
		end
		if _result_2 then
			fromPos = config.fromEntity.networkObject.gameObject.transform.position
		end
		print("Sending damage event: " .. tostring(InstanceFinder.TimeManager.Tick))
		local _fn = Network.ServerToClient.EntityDamage.Server
		local _exp_2 = entity.id
		local _exp_3 = damageEvent.amount
		local _exp_4 = damageEvent.damageType
		local _result_3 = damageEvent.fromEntity
		if _result_3 ~= nil then
			_result_3 = _result_3.id
		end
		_fn:FireAllClients(_exp_2, _exp_3, _exp_4, _result_3)
		local despawned = false
		entity:SetHealth(entity:GetHealth() - amount)
		entity:SetLastDamagedTime(Time.time)
		if entity:GetHealth() == 0 then
			entity:Kill()
			local entityDeathEvent = EntityDeathServerSignal.new(entity, damageEvent.fromEntity, damageEvent, DEFAULT_RESPAWN_TIME)
			ServerSignals.EntityDeath:Fire(entityDeathEvent)
			local _fn_1 = Network.ServerToClient.EntityDeath.Server
			local _exp_5 = entity.id
			local _exp_6 = damageEvent.damageType
			local _result_4 = entityDeathEvent.killer
			if _result_4 ~= nil then
				_result_4 = _result_4.id
			end
			_fn_1:FireAllClients(_exp_5, _exp_6, _result_4)
			self.entityService:DespawnEntity(entity)
			despawned = true
		else
			entity:GrantImmunity(0.3)
		end
		-- Knockback
		if not despawned then
			local humanoid = entity.networkObject.gameObject:GetComponent("EntityDriver")
			assert(humanoid, "Missing humanoid")
			-- const rigidBody = entity.NetworkObject.gameObject.GetComponent<Rigidbody>();
			-- assert(rigidBody, "Missing rigid body.");
			local horizontalScalar = 7.5
			local impulse
			local _result_4 = config
			if _result_4 ~= nil then
				_result_4 = _result_4.knockbackDirection
			end
			if _result_4 then
				local delta = config.knockbackDirection.normalized
				impulse = Vector3.new(delta.x * horizontalScalar, 9, delta.z * horizontalScalar)
			elseif fromPos then
				local currentPos = entity.networkObject.transform.position
				local _fromPos = fromPos
				local delta = (currentPos - _fromPos).normalized
				impulse = Vector3.new(delta.x * horizontalScalar, 9, delta.z * horizontalScalar)
			else
				impulse = Vector3.new(0, 9, 0) * 1
			end
			humanoid:Impulse(impulse)
		end
		return true
	end
end
-- (Flamework) DamageService metadata
Reflect.defineMetadata(DamageService, "identifier", "Bundles/Server/Services/Global/Damage/DamageService@DamageService")
Reflect.defineMetadata(DamageService, "flamework:parameters", { "Bundles/Server/Services/Global/Entity/EntityService@EntityService" })
Reflect.defineMetadata(DamageService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(DamageService, "$:flamework@Service", Service, { {} })
return {
	DamageService = DamageService,
}
-- ----------------------------------
-- ----------------------------------
