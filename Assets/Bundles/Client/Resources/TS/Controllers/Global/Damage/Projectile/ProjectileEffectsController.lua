-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local EffectsManager = require("Shared/TS/Effects/EffectsManager").EffectsManager
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Network = require("Shared/TS/Network").Network
local _ReferenceManagerResources = require("Shared/TS/Util/ReferenceManagerResources")
local BundleGroupNames = _ReferenceManagerResources.BundleGroupNames
local Bundle_Projectiles = _ReferenceManagerResources.Bundle_Projectiles
local Bundle_Projectiles_OnHitVFX = _ReferenceManagerResources.Bundle_Projectiles_OnHitVFX
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local SetTimeout = require("Shared/TS/Util/Timer").SetTimeout
local ProjectileEffectsController
do
	ProjectileEffectsController = setmetatable({}, {
		__tostring = function()
			return "ProjectileEffectsController"
		end,
	})
	ProjectileEffectsController.__index = ProjectileEffectsController
	function ProjectileEffectsController.new(...)
		local self = setmetatable({}, ProjectileEffectsController)
		return self:constructor(...) or self
	end
	function ProjectileEffectsController:constructor(entityController, projectileController)
		self.entityController = entityController
		self.projectileController = projectileController
	end
	function ProjectileEffectsController:OnStart()
		ClientSignals.ProjectileCollide:Connect(function(event)
			local effect = EffectsManager:SpawnBundleEffect(BundleGroupNames.Projectiles, Bundle_Projectiles.OnHitVFX, Bundle_Projectiles_OnHitVFX.Arrow, event.hitPosition, Vector3.zero)
			local trail = event.projectile.gameObject.transform:Find("Trail")
			if trail then
				local pos = trail.position
				Bridge:SetParentToSceneRoot(trail)
				trail.position = pos
				SetTimeout(1, function()
					Object:Destroy(trail.gameObject)
				end)
			end
			local itemMeta = GetItemMeta(event.projectile.itemType)
			local _condition = not event.hitEntity
			if _condition then
				local _result = itemMeta.Ammo
				if _result ~= nil then
					_result = _result.onHitGroundSoundId
				end
				_condition = _result
			end
			if _condition ~= "" and _condition then
				local _fn = SoundUtil
				local _exp = itemMeta.Ammo.onHitGroundSoundId
				local _exp_1 = event.hitPosition
				local _object = {}
				local _left = "volumeScale"
				local _condition_1 = itemMeta.Ammo.onHitGroundSoundVolume
				if _condition_1 == nil then
					_condition_1 = 1
				end
				_object[_left] = _condition_1
				_fn:PlayAtPosition(_exp, _exp_1, _object)
			end
		end)
		Network.ServerToClient.DebugProjectileHit.Client:OnServerEvent(function(pos)
			EffectsManager:SpawnBundleEffect(BundleGroupNames.Projectiles, Bundle_Projectiles.OnHitVFX, Bundle_Projectiles_OnHitVFX.Arrow, pos, Vector3.zero)
		end)
	end
end
-- (Flamework) ProjectileEffectsController metadata
Reflect.defineMetadata(ProjectileEffectsController, "identifier", "Bundles/Client/Controllers/Global/Damage/Projectile/ProjectileEffectsController@ProjectileEffectsController")
Reflect.defineMetadata(ProjectileEffectsController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController", "Bundles/Client/Controllers/Global/Damage/Projectile/ProjectileController@ProjectileController" })
Reflect.defineMetadata(ProjectileEffectsController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(ProjectileEffectsController, "$:flamework@Controller", Controller, { {} })
return {
	ProjectileEffectsController = ProjectileEffectsController,
}
-- ----------------------------------
-- ----------------------------------
