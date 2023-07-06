-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local DamageType = require("Shared/TS/Damage/DamageType").DamageType
local Entity = require("Shared/TS/Entity/Entity").Entity
local _ItemDefinitions = require("Shared/TS/Item/ItemDefinitions")
local GetItemMeta = _ItemDefinitions.GetItemMeta
local GetItemTypeFromItemId = _ItemDefinitions.GetItemTypeFromItemId
local Projectile = require("Shared/TS/Projectile/Projectile").Projectile
local LayerUtil = require("Shared/TS/Util/LayerUtil").LayerUtil
local ProjectileCollideServerSignal = require("Server/TS/Services/Global/Damage/Projectile/ProjectileCollideServerSignal").ProjectileCollideServerSignal
local ProjectileService
do
	ProjectileService = setmetatable({}, {
		__tostring = function()
			return "ProjectileService"
		end,
	})
	ProjectileService.__index = ProjectileService
	function ProjectileService.new(...)
		local self = setmetatable({}, ProjectileService)
		return self:constructor(...) or self
	end
	function ProjectileService:constructor(damageService)
		self.damageService = damageService
		self.projectilesById = {}
	end
	function ProjectileService:OnStart()
		-- Listen for `ProjectileHit` and apply damage.
		ServerSignals.ProjectileHit:Connect(function(event)
			if not event.hitEntity then
				return nil
			end
			local knockbackDirection = event.velocity.normalized
			self.damageService:InflictDamage(event.hitEntity, event.damage, {
				fromEntity = event.projectile.shooter,
				damageType = DamageType.PROJECTILE,
				projectileHitSignal = event,
				knockbackDirection = knockbackDirection,
			})
		end)
		-- ServerSignals.ProjectileHit.Connect((event) => {
		-- Network.ServerToClient.DebugProjectileHit.Server.FireAllClients(event.hitPosition);
		-- });
		ProjectileManager.Instance:onProjectileValidate(function(event)
			event.validated = true
		end)
		ProjectileManager.Instance:onProjectileLaunched(function(easyProjectile, shooterGO)
			local shooterEntity = Entity:FindByGameObject(shooterGO)
			local itemType = GetItemTypeFromItemId(easyProjectile.itemTypeId)
			if not itemType then
				Debug:LogError("Failed to find itemType with id " .. tostring(easyProjectile.itemTypeId))
				return nil
			end
			local projectile = Projectile.new(easyProjectile, itemType, shooterEntity)
		end)
	end
	function ProjectileService:HandleCollision(projectile, collider, hitPoint, normal, velocity)
		local ammoMeta = GetItemMeta(projectile.itemType).Ammo
		local hitEntity = Entity:FindByCollider(collider)
		-- Check if it should be colliding with us.
		if not LayerUtil:LayerIsInMask(collider.gameObject.layer, ammoMeta.projectileHitLayerMask) then
			return false
		end
		local projectileHitSignal = ProjectileCollideServerSignal.new(projectile, ammoMeta.damage, hitPoint, normal, velocity, hitEntity)
		ServerSignals.ProjectileHit:Fire(projectileHitSignal)
		return true
	end
	function ProjectileService:GetProjectileById(projectileId)
		local _projectilesById = self.projectilesById
		local _projectileId = projectileId
		return _projectilesById[_projectileId]
	end
end
-- (Flamework) ProjectileService metadata
Reflect.defineMetadata(ProjectileService, "identifier", "Bundles/Server/Services/Global/Damage/Projectile/ProjectileService@ProjectileService")
Reflect.defineMetadata(ProjectileService, "flamework:parameters", { "Bundles/Server/Services/Global/Damage/DamageService@DamageService" })
Reflect.defineMetadata(ProjectileService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ProjectileService, "$:flamework@Service", Service, { {} })
return {
	ProjectileService = ProjectileService,
}
-- ----------------------------------
-- ----------------------------------
