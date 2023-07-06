-- Compiled with unity-ts v2.1.0-75
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local BundleReferenceManager = require("Shared/TS/Util/BundleReferenceManager").BundleReferenceManager
local ReferenceManagerAssets = require("Shared/TS/Util/ReferenceManagerResources").ReferenceManagerAssets
local EffectsManager
do
	EffectsManager = setmetatable({}, {
		__tostring = function()
			return "EffectsManager"
		end,
	})
	EffectsManager.__index = EffectsManager
	function EffectsManager.new(...)
		local self = setmetatable({}, EffectsManager)
		return self:constructor(...) or self
	end
	function EffectsManager:constructor()
	end
	function EffectsManager:SpawnBundleEffect(bundleGroupId, bundleId, effectId, worldPosition, worldRotation, destroyInSeconds)
		if destroyInSeconds == nil then
			destroyInSeconds = 5
		end
		local _bundleGroups = ReferenceManagerAssets.bundleGroups
		local _bundleGroupId = bundleGroupId
		local bundleGroup = _bundleGroups[_bundleGroupId]
		if bundleGroup then
			return self:SpawnBundleGroupEffect(bundleGroup, bundleId, effectId, worldPosition, worldRotation, destroyInSeconds)
		end
		return nil
	end
	function EffectsManager:SpawnBundleGroupEffect(bundleGroup, bundleId, effectId, worldPosition, worldRotation, destroyInSeconds)
		if destroyInSeconds == nil then
			destroyInSeconds = 5
		end
		local _bundles = bundleGroup.bundles
		local _bundleId = bundleId
		local bundle = _bundles[_bundleId]
		if not bundle then
			return nil
		end
		local effect = self:SpawnBundleDataEffect(bundle, effectId, nil, destroyInSeconds)
		if effect then
			effect.transform.position = worldPosition
			effect.transform.eulerAngles = worldRotation
		end
		return effect
	end
	function EffectsManager:SpawnBundleDataEffect(bundle, effectId, hitTransform, destroyInSeconds)
		if destroyInSeconds == nil then
			destroyInSeconds = 5
		end
		if not bundle or effectId < 0 then
			error("Trying to spawn effect that doesnt exist: " .. tostring(bundle) .. ", " .. tostring(effectId))
			return nil
		end
		local template = BundleReferenceManager:LoadResourceFromBundle(bundle, effectId)
		if template == nil then
			error("Trying to spawn effect but prefab template wasn't found: " .. tostring(bundle.id) .. ", " .. tostring(effectId))
			return nil
		end
		return self:SpawnEffect(template, hitTransform, destroyInSeconds)
	end
	function EffectsManager:SpawnEffectAtPosition(template, worldPosition, worldEuler, destroyInSeconds)
		if destroyInSeconds == nil then
			destroyInSeconds = 5
		end
		local effect = self:SpawnEffect(template, nil, destroyInSeconds)
		effect.transform.position = worldPosition
		if worldEuler then
			effect.transform.eulerAngles = worldEuler
		end
		return effect
	end
	function EffectsManager:SpawnEffect(template, parent, destroyInSeconds)
		if destroyInSeconds == nil then
			destroyInSeconds = 5
		end
		local vfx
		if parent then
			vfx = GameObjectBridge:InstantiateIn(template, parent)
		else
			vfx = GameObjectBridge:Instantiate(template)
		end
		vfx.transform.localPosition = Vector3.zero
		vfx.transform.localEulerAngles = Vector3.zero
		-- vfx.transform.localScale = Vector3.one;
		if destroyInSeconds > 0 then
			GameObjectBridge:Destroy(vfx, destroyInSeconds)
		end
		return vfx
	end
end
return {
	EffectsManager = EffectsManager,
}
-- ----------------------------------
-- ----------------------------------
