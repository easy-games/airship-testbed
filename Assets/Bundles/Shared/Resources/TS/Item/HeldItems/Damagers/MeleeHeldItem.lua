-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local EffectsManager = require("Shared/TS/Effects/EffectsManager").EffectsManager
local Entity = require("Shared/TS/Entity/Entity").Entity
local Bundle_ItemSword = require("Shared/TS/Util/ReferenceManagerResources").Bundle_ItemSword
local HeldItem = require("Shared/TS/Item/HeldItems/HeldItem").HeldItem
local MeleeHeldItem
do
	local super = HeldItem
	MeleeHeldItem = setmetatable({}, {
		__tostring = function()
			return "MeleeHeldItem"
		end,
		__index = super,
	})
	MeleeHeldItem.__index = MeleeHeldItem
	function MeleeHeldItem.new(...)
		local self = setmetatable({}, MeleeHeldItem)
		return self:constructor(...) or self
	end
	function MeleeHeldItem:constructor(...)
		super.constructor(self, ...)
	end
	function MeleeHeldItem:OnUseClient(useIndex)
		super.OnUseClient(self, useIndex)
		local meleeData = self.meta.melee
		if not meleeData then
			return nil
		end
		self:Log("Using Server")
		-- Only local player should do collisions checks
		-- TODO make sure other players show the attacks effects just without having to do collision checks
		if self.entity:IsLocalCharacter() then
			local entityDriver = self.entity:GetEntityDriver()
			entityDriver:UpdateSyncTick()
			local hitTargets = self:GetCollisions(meleeData.colliderData)
			local _hitTargets = hitTargets
			local _arg0 = function(data)
				local _condition = self.bundles
				if _condition then
					local _result = self.meta.melee
					if _result ~= nil then
						_result = _result.onHitPrefabId
					end
					_condition = _result
				end
				if _condition ~= 0 and (_condition == _condition and _condition) then
					-- Local damage predictions
					local effectGO = EffectsManager:SpawnBundleGroupEffect(self.bundles, Bundle_ItemSword.Prefabs, self.meta.melee.onHitPrefabId, data.hitPosition, Quaternion.LookRotation(data.hitDirection).eulerAngles)
					if effectGO then
						effectGO.transform.parent = data.hitEntity.model.transform
					end
				end
			end
			for _k, _v in _hitTargets do
				_arg0(_v, _k - 1, _hitTargets)
			end
		end
	end
	function MeleeHeldItem:OnUseServer(useIndex)
		print("melee.onUseServer")
		Profiler:BeginSample("Melee.OnUseServer")
		Profiler:BeginSample("super.OnUseServer")
		super.OnUseServer(self, useIndex)
		Profiler:EndSample()
		local meleeData = self.meta.melee
		if not meleeData then
			Profiler:EndSample()
			return nil
		end
		self:Log("Using Server")
		Profiler:BeginSample("GetCollisions")
		local hitTargets = self:GetCollisions(meleeData.colliderData)
		Profiler:EndSample()
		print("Server hit tick=" .. tostring(InstanceFinder.TimeManager.Tick) .. ", hitTargets=" .. tostring(#hitTargets))
		Profiler:BeginSample("HitTargetsInflictDamage")
		local _hitTargets = hitTargets
		local _arg0 = function(data)
			local _fn = (Flamework.resolveDependency("Bundles/Server/Services/Global/Damage/DamageService@DamageService"))
			local _exp = data.hitEntity
			local _result = meleeData
			if _result ~= nil then
				_result = _result.damage
			end
			local _condition = _result
			if _condition == nil then
				_condition = 0
			end
			local _object = {}
			local _left = "damageType"
			local _result_1 = meleeData
			if _result_1 ~= nil then
				_result_1 = _result_1.damageType
			end
			_object[_left] = _result_1
			_object.fromEntity = self.entity
			_object.knockbackDirection = data.knockbackDirection
			_fn:InflictDamage(_exp, _condition, _object)
		end
		for _k, _v in _hitTargets do
			_arg0(_v, _k - 1, _hitTargets)
		end
		Profiler:EndSample()
		Profiler:EndSample()
	end
	function MeleeHeldItem:GetCollisions(boxData)
		local collisionData = {}
		local closestCollisionData
		if not boxData then
			error(self.meta.displayName .. " Melee No Box Data")
			return collisionData
		end
		self:Log("Finding Collisions")
		local detectHalfSize = Vector3.new(boxData.boxHalfWidth, boxData.boxHalfHeight, boxData.boxHalfDepth)
		local layerMask = 8
		local _condition = boxData.localPositionOffsetX
		if _condition == nil then
			_condition = 0
		end
		local _exp = boxData.boxHalfHeight
		local _condition_1 = boxData.localPositionOffsetY
		if _condition_1 == nil then
			_condition_1 = 0
		end
		local _exp_1 = _exp + _condition_1
		local _exp_2 = -0.5 + boxData.boxHalfDepth
		local _condition_2 = boxData.localPositionOffsetZ
		if _condition_2 == nil then
			_condition_2 = 0
		end
		local boxLocalPos = Vector3.new(_condition, _exp_1, _exp_2 + _condition_2)
		local colliderWorldPos = self.entity.model.transform:TransformPoint(boxLocalPos)
		local hitColliders = Physics:OverlapBox(colliderWorldPos, detectHalfSize, self.entity.model.transform.rotation, layerMask, 0)
		local foundRaycastCollision
		local rayDistance = (boxData.boxHalfDepth + boxData.boxHalfHeight + boxData.boxHalfWidth) * 2
		-- For each collider in the box detection
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < hitColliders.Length) then
					break
				end
				self:Log("Collider: " .. tostring(i))
				local collider = hitColliders:GetValue(i)
				local targetEntity = Entity:FindByCollider(collider)
				-- If we hit an entity that is not the owner of this item
				if not targetEntity then
					-- Box check doesn't care about non entities
					continue
				end
				if targetEntity.id == self.entity.id then
					-- Hit Self
					continue
				end
				self:Log("Hit Entity: " .. tostring(targetEntity.id))
				-- Raycast to the target to find a more concrete collisions
				-- TODO the entities look direction should be synced here not just its plane aligned look direction
				local backtrackOffset = self.entity.model.transform:TransformVector(Vector3.new(0, 0, -0.5))
				local rayStart = self.entity:GetHeadPosition() + backtrackOffset
				local rayEnd = targetEntity:GetHeadPosition()
				local _rayEnd = rayEnd
				local _rayStart = rayStart
				local hitDirection = (_rayEnd - _rayStart).normalized
				-- RAYCAST ALL
				self:Log("Raycast All")
				local hitInfosArray = Physics:RaycastAll(rayStart, hitDirection, rayDistance, -1)
				local hitInfos = hitInfosArray
				local blockerDistance = 9999
				-- DebugUtil.DrawSingleLine(rayStart, rayEnd, Color.cyan, 2);
				-- Check each ray collision
				do
					local i = 0
					local _shouldIncrement_1 = false
					while true do
						if _shouldIncrement_1 then
							i += 1
						else
							_shouldIncrement_1 = true
						end
						if not (i < hitInfos.Length) then
							break
						end
						self:Log("Raycasting to target")
						local hitInfo = hitInfos:GetValue(i)
						-- Look for entities and blocking colliders
						local rayTarget = Entity:FindByCollider(hitInfo.collider)
						if rayTarget then
							if rayTarget.id == self.entity.id then
								-- Hit self, skip
								continue
							elseif rayTarget.id == targetEntity.id then
								self:Log("Raycast hit: " .. tostring(rayTarget.id))
								-- Raycast hit the target entity
								foundRaycastCollision = {
									hitEntity = targetEntity,
									hitDirection = hitDirection,
									hitPosition = hitInfo.point,
									hitNormal = hitInfo.normal,
									distance = hitInfo.distance,
									knockbackDirection = self.entity.gameObject.transform.forward,
								}
								-- DebugUtil.DrawSingleLine(rayStart, hitInfo.point, Color.green, 2);
								if not closestCollisionData or hitInfo.distance < closestCollisionData.distance then
									self:Log("New closest target: " .. tostring(hitInfo.distance))
									closestCollisionData = foundRaycastCollision
									continue
								end
							else
								-- Hit a non entity object
								self:Log("Blocked by object: " .. hitInfo.collider.gameObject.name)
								blockerDistance = math.min(blockerDistance, hitInfo.distance)
								-- DebugUtil.DrawSingleLine(rayStart, hitInfo.point, Color.red, 2);
							end
						end
						if foundRaycastCollision then
							self:Log("Found target")
							if foundRaycastCollision.distance < blockerDistance then
								self:Log("Using target")
								-- Not blocked by something
								local _collisionData = collisionData
								local _foundRaycastCollision = foundRaycastCollision
								table.insert(_collisionData, _foundRaycastCollision)
								-- DebugUtil.DrawSingleLine(rayStart, foundRaycastCollision.hitPosition, Color.green, 2);
							else
								self:Log("Can't use target because of blocker")
							end
						end
					end
				end
			end
		end
		-- DebugUtil.DrawBox(
		-- colliderWorldPos,
		-- this.entity.model.transform.rotation,
		-- detectHalfSize,
		-- closestCollisionData ? Color.green : Color.red,
		-- 2,
		-- );
		local _result = self.meta.melee
		if _result ~= nil then
			_result = _result.canHitMultipleTargets
		end
		if _result then
			return collisionData
		elseif closestCollisionData then
			return { closestCollisionData }
		end
		return {}
	end
end
return {
	MeleeHeldItem = MeleeHeldItem,
}
-- ----------------------------------
-- ----------------------------------
