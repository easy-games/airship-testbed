-- Compiled with unity-ts v2.1.0-75
local EffectsManager = require("Shared/TS/Effects/EffectsManager").EffectsManager
local BundleReferenceManager = require("Shared/TS/Util/BundleReferenceManager").BundleReferenceManager
local _ReferenceManagerResources = require("Shared/TS/Util/ReferenceManagerResources")
local Bundle_Entity = _ReferenceManagerResources.Bundle_Entity
local Bundle_Entity_OnHit = _ReferenceManagerResources.Bundle_Entity_OnHit
local BundleGroupNames = _ReferenceManagerResources.BundleGroupNames
local Task = require("Shared/TS/Util/Task").Task
local SoundUtil = require("Shared/TS/Util/SoundUtil").SoundUtil
local ArrayUtil = require("Shared/TS/Util/ArrayUtil").ArrayUtil
local EntityAnimator
do
	EntityAnimator = setmetatable({}, {
		__tostring = function()
			return "EntityAnimator"
		end,
	})
	EntityAnimator.__index = EntityAnimator
	function EntityAnimator.new(...)
		local self = setmetatable({}, EntityAnimator)
		return self:constructor(...) or self
	end
	function EntityAnimator:constructor(entity, anim, entityRef)
		self.entity = entity
		self.flashTransitionDuration = 0.035
		self.flashOnTime = 0.07
		self.defaultTransitionTime = 0.15
		self.damageFlashOnColor = Color.red
		self.damageFlashOffColor = Color.new(1, 0, 0, 0)
		self.isFlashing = false
		self.anim = anim
		self.entityRef = entityRef
		self.damageEffectClip = BundleReferenceManager:LoadResource(BundleGroupNames.Entity, Bundle_Entity.OnHit, Bundle_Entity_OnHit.GeneralAnim)
		self.damageEffectTemplate = BundleReferenceManager:LoadResource(BundleGroupNames.Entity, Bundle_Entity.OnHit, Bundle_Entity_OnHit.GenericVFX)
		-- Listen to animation events
		self.entityRef.animationEvents:OnEntityAnimationEvent(function(data)
			-- print("Animation Event: " + data.key + " On Entity: " + this.entity.id);
			self:OnAnimationEvent(data)
		end)
	end
	function EntityAnimator:PlayAnimation(clip, layer, wrapMode)
		if layer == nil then
			layer = 0
		end
		if wrapMode == nil then
			wrapMode = 0
		end
		return AnimancerBridge:Play(self.anim, clip, layer, self.defaultTransitionTime, 2, wrapMode)
	end
	function EntityAnimator:PlayAnimationOnce(clip, layer, wrapMode)
		if layer == nil then
			layer = 0
		end
		if wrapMode == nil then
			wrapMode = 0
		end
		return AnimancerBridge:PlayOnce(self.anim, clip, layer, self.defaultTransitionTime, 2)
	end
	function EntityAnimator:PlayTakeDamage(damageAmount, damageType, position, entityModel)
		-- Flash Red 3 times
		local totalTime = self.flashTransitionDuration + self.flashOnTime + self.flashTransitionDuration + 0.01
		self:PlayFlash()
		Task:Delay(totalTime, function()
			self:PlayFlash()
			Task:Delay(totalTime, function()
				self:PlayFlash()
			end)
		end)
		-- Play specific effects for different damage types like fire attacks or magic damage
		local vfxTemplate
		repeat
			vfxTemplate = self.damageEffectTemplate
			break
		until true
		if vfxTemplate then
			local go = EffectsManager:SpawnEffectAtPosition(vfxTemplate, position)
			if entityModel then
				go.transform.parent = entityModel.transform
			end
		end
	end
	function EntityAnimator:PlayFlash()
		if self.entity:IsDestroyed() or self.isFlashing then
			return nil
		end
		local allMeshes = ArrayUtil:Combine(self.entity:GetAccessoryMeshes(5), self.entityRef.meshes)
		local duration = self.flashTransitionDuration + self.flashOnTime
		self.isFlashing = true
		local _allMeshes = allMeshes
		local _arg0 = function(renderer)
			if renderer and renderer.enabled then
				renderer:TweenMaterialsProperty("_OverlayColor", self.damageFlashOffColor, self.damageFlashOnColor, self.flashTransitionDuration):SetPingPong()
			end
		end
		for _k, _v in _allMeshes do
			_arg0(_v, _k - 1, _allMeshes)
		end
		Task:Delay(duration, function()
			self.isFlashing = false
		end)
	end
	function EntityAnimator:OnAnimationEvent(data)
		local meta = self.entity:GetBlockBelowMeta()
		local _exp = data.key
		repeat
			if _exp == 0 then
				-- Play footstep sound
				if meta and meta.stepSound then
					SoundUtil:PlayAtPosition("Footsteps/" .. meta.stepSound[1], self.entity.model.transform.position, {
						volumeScale = 1,
					})
				end
				break
			end
		until true
	end
end
return {
	EntityAnimator = EntityAnimator,
}
-- ----------------------------------
-- ----------------------------------
