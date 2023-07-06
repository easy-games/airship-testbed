-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Entity = require("Shared/TS/Entity/Entity").Entity
local _ItemDefinitions = require("Shared/TS/Item/ItemDefinitions")
local GetItemMeta = _ItemDefinitions.GetItemMeta
local GetItemTypeFromItemId = _ItemDefinitions.GetItemTypeFromItemId
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Projectile = require("Shared/TS/Projectile/Projectile").Projectile
local LayerUtil = require("Shared/TS/Util/LayerUtil").LayerUtil
local ProjectileCollideClientSignal = require("Client/TS/Controllers/Global/Damage/Projectile/ProjectileCollideClientSignal").ProjectileCollideClientSignal
local ProjectileLaunchedClientSignal = require("Client/TS/Controllers/Global/Damage/Projectile/ProjectileLaunchedClientSignal").ProjectileLaunchedClientSignal
local ProjectileController
do
	ProjectileController = setmetatable({}, {
		__tostring = function()
			return "ProjectileController"
		end,
	})
	ProjectileController.__index = ProjectileController
	function ProjectileController.new(...)
		local self = setmetatable({}, ProjectileController)
		return self:constructor(...) or self
	end
	function ProjectileController:constructor()
		self.prefabInfoByItemType = {}
		for _, itemTypeStr in Object.keys(ItemType) do
			local itemType = itemTypeStr
			local itemMeta = GetItemMeta(itemType)
			if itemMeta.Ammo then
				local projPrefab = AssetBridge:LoadAssetIfExists("Shared/Resources/Prefabs/Projectiles/Ammo/" .. (itemType .. ".prefab"))
				if not projPrefab then
					print("Unable to find asset for ammoItemType: " .. itemType)
					continue
				end
				local rigidbody = projPrefab:GetComponent("Rigidbody")
				local _prefabInfoByItemType = self.prefabInfoByItemType
				local _arg1 = {
					gameObject = projPrefab,
					rigidbody = rigidbody,
				}
				_prefabInfoByItemType[itemType] = _arg1
			end
		end
	end
	function ProjectileController:OnStart()
		ProjectileManager.Instance:onProjectileLaunched(function(easyProjectile, shooterGO)
			local shooterEntity = Entity:FindByGameObject(shooterGO)
			local itemType = GetItemTypeFromItemId(easyProjectile.itemTypeId)
			if not itemType then
				Debug:LogError("Failed to find itemType with id " .. tostring(easyProjectile.itemTypeId))
				return nil
			end
			local projectile = Projectile.new(easyProjectile, itemType, shooterEntity)
			ClientSignals.ProjectileLaunched:Fire(ProjectileLaunchedClientSignal.new(projectile))
		end)
	end
	function ProjectileController:HandleCollision(projectile, collider, hitPoint, normal, velocity)
		local ammoMeta = GetItemMeta(projectile.itemType).Ammo
		local hitEntity = Entity:FindByCollider(collider)
		-- Check if it should be colliding with us.
		if not LayerUtil:LayerIsInMask(collider.gameObject.layer, ammoMeta.projectileHitLayerMask) then
			return false
		end
		local projectileHitSignal = ProjectileCollideClientSignal.new(projectile, hitPoint, normal, velocity, hitEntity)
		ClientSignals.ProjectileCollide:Fire(projectileHitSignal)
		return true
	end
end
-- (Flamework) ProjectileController metadata
Reflect.defineMetadata(ProjectileController, "identifier", "Bundles/Client/Controllers/Global/Damage/Projectile/ProjectileController@ProjectileController")
Reflect.defineMetadata(ProjectileController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ProjectileController, "$:flamework@Controller", Controller, { {} })
return {
	ProjectileController = ProjectileController,
}
-- ----------------------------------
-- ----------------------------------
