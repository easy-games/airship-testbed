-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local EntityDamageClientSignal = require("Client/TS/Signals/EntityDamageClientSignal").EntityDamageClientSignal
local EntityDeathClientSignal = require("Client/TS/Signals/EntityDeathClientSignal").EntityDeathClientSignal
local Network = require("Shared/TS/Network").Network
local DamageController
do
	DamageController = setmetatable({}, {
		__tostring = function()
			return "DamageController"
		end,
	})
	DamageController.__index = DamageController
	function DamageController.new(...)
		local self = setmetatable({}, DamageController)
		return self:constructor(...) or self
	end
	function DamageController:constructor(entityController)
		self.entityController = entityController
	end
	function DamageController:OnStart()
		Network.ServerToClient.EntityDamage.Client:OnServerEvent(function(entityId, amount, damageType, fromEntityId)
			local entity = self.entityController:GetEntityById(entityId)
			if not entity then
				error("Failed to find entity.")
			end
			local fromEntity
			if fromEntityId ~= nil then
				fromEntity = self.entityController:GetEntityById(fromEntityId)
			end
			ClientSignals.EntityDamage:Fire(EntityDamageClientSignal.new(entity, amount, damageType, fromEntity))
		end)
		Network.ServerToClient.EntityDeath.Client:OnServerEvent(function(entityId, damageType, fromEntityId)
			local entity = self.entityController:GetEntityById(entityId)
			if not entity then
				error("Failed to find entity.")
			end
			local fromEntity
			if fromEntityId ~= nil then
				fromEntity = self.entityController:GetEntityById(fromEntityId)
			end
			entity:Kill()
			ClientSignals.EntityDeath:Fire(EntityDeathClientSignal.new(entity, damageType, fromEntity))
		end)
	end
end
-- (Flamework) DamageController metadata
Reflect.defineMetadata(DamageController, "identifier", "Bundles/Client/Controllers/Global/Damage/DamageController@DamageController")
Reflect.defineMetadata(DamageController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController" })
Reflect.defineMetadata(DamageController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(DamageController, "$:flamework@Controller", Controller, { {} })
return {
	DamageController = DamageController,
}
-- ----------------------------------
-- ----------------------------------
