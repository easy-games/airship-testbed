-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local ItemPlayMode = require("Shared/TS/Entity/Animation/InventoryEntityAnimator").ItemPlayMode
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local ProjectileUtil = require("Shared/TS/Projectile/ProjectileUtil").ProjectileUtil
local Mouse = require("Shared/TS/UserInput/init").Mouse
local Bin = require("Shared/TS/Util/Bin").Bin
local CanvasAPI = require("Shared/TS/Util/CanvasAPI").CanvasAPI
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local OnLateUpdate = require("Shared/TS/Util/Timer").OnLateUpdate
local HeldItem = require("Shared/TS/Item/HeldItems/HeldItem").HeldItem
local ProjectileLauncherHeldItem
do
	local super = HeldItem
	ProjectileLauncherHeldItem = setmetatable({}, {
		__tostring = function()
			return "ProjectileLauncherHeldItem"
		end,
		__index = super,
	})
	ProjectileLauncherHeldItem.__index = ProjectileLauncherHeldItem
	function ProjectileLauncherHeldItem.new(...)
		local self = setmetatable({}, ProjectileLauncherHeldItem)
		return self:constructor(...) or self
	end
	function ProjectileLauncherHeldItem:constructor(...)
		super.constructor(self, ...)
		self.chargeBin = Bin.new()
		self.currentlyCharging = false
		self.startHoldTimeSec = 0
		self.projectileTrajectoryRenderer = GameObject:Find("ProjectileTrajectoryRenderer"):GetComponent("ProjectileTrajectoryRenderer")
	end
	function ProjectileLauncherHeldItem:OnChargeStart()
		super.OnChargeStart(self)
		if not self.entity:IsLocalCharacter() then
			return nil
		end
		if RunUtil:IsServer() then
			return nil
		end
		if not self.meta.ProjectileLauncher then
			return nil
		end
		local ammoItemMeta = GetItemMeta(self.meta.ProjectileLauncher.ammoItemType)
		local ammoMeta = ammoItemMeta.Ammo
		if CanvasAPI:IsPointerOverUI() then
			return nil
		end
		if not self:HasRequiredAmmo() then
			return nil
		end
		self.currentlyCharging = true
		local _result = self.entity.anim
		if _result ~= nil then
			_result:PlayItemUse(0, ItemPlayMode.HOLD)
		end
		self.startHoldTimeSec = os.clock()
		local mouse = Mouse.new()
		local localEntityController = Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")
		self.chargeBin:Add(OnLateUpdate:ConnectWithPriority(200, function(deltaTime)
			if self.currentlyCharging then
				local chargeSec = os.clock() - self.startHoldTimeSec
				local launchPos = ProjectileUtil:GetLaunchPosition(self.entity, localEntityController:IsFirstPerson())
				local launchData = self:GetLaunchData(self.entity, mouse, self.meta, chargeSec, launchPos)
				self.projectileTrajectoryRenderer:UpdateInfo(launchPos, launchData.velocity, 0, ammoMeta.gravity)
			end
		end))
		self.chargeBin:Add(function()
			mouse:Destroy()
		end)
	end
	function ProjectileLauncherHeldItem:HasRequiredAmmo()
		if not self.entity:IsAlive() or not (TS.instanceof(self.entity, CharacterEntity)) then
			return false
		end
		local inventory = self.entity:GetInventory()
		local _launcherItemMeta = inventory:GetHeldItem()
		if _launcherItemMeta ~= nil then
			_launcherItemMeta = _launcherItemMeta:GetMeta()
		end
		local launcherItemMeta = _launcherItemMeta
		local _nullableProjectileLauncherMeta = launcherItemMeta
		if _nullableProjectileLauncherMeta ~= nil then
			_nullableProjectileLauncherMeta = _nullableProjectileLauncherMeta.ProjectileLauncher
		end
		local nullableProjectileLauncherMeta = _nullableProjectileLauncherMeta
		if nullableProjectileLauncherMeta then
			local launcherMeta = nullableProjectileLauncherMeta
			if inventory:HasItemType(launcherMeta.ammoItemType) then
				return true
			end
		end
		return false
	end
	function ProjectileLauncherHeldItem:OnUseClient(useIndex)
		super.OnUseClient(self, useIndex)
		if not self.entity:IsLocalCharacter() then
			return nil
		end
		self.currentlyCharging = false
		self.projectileTrajectoryRenderer:SetDrawingEnabled(false)
		if CanvasAPI:IsPointerOverUI() then
			return nil
		end
		if not self:HasRequiredAmmo() then
			return nil
		end
		local chargeSec = os.clock() - self.startHoldTimeSec
		--[[
			* All checks passed. Time to FIRE!
		]]
		self.startHoldTimeSec = -1
		local mouse = Mouse.new()
		local launchPos = ProjectileUtil:GetLaunchPosition(self.entity, (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Character/LocalEntityController@LocalEntityController")):IsFirstPerson())
		local launchData = self:GetLaunchData(self.entity, mouse, self.meta, chargeSec, launchPos)
		self.entity:LaunchProjectile(self.meta.ProjectileLauncher.ammoItemType, launchData.velocity)
		local _result = self.entity.anim
		if _result ~= nil then
			_result:PlayItemUse(1)
		end
	end
	function ProjectileLauncherHeldItem:OnCallToActionEnd()
		super.OnCallToActionEnd(self)
		if not self.entity:IsLocalCharacter() then
			return nil
		end
		self.currentlyCharging = false
		self.chargeBin:Clean()
	end
	function ProjectileLauncherHeldItem:GetLaunchData(entity, mouse, launcherItemMeta, chargeSec, launchPos)
		local launcherMeta = launcherItemMeta.ProjectileLauncher
		local ammoItemMeta = GetItemMeta(launcherMeta.ammoItemType)
		local ammoMeta = ammoItemMeta.Ammo
		local aimVector = self:GetAimVector(mouse, launchPos, ammoMeta)
		local launchForceData = ProjectileUtil:GetLaunchForceData(launcherItemMeta, aimVector, chargeSec)
		return {
			direction = launchForceData.direction,
			velocity = launchForceData.initialVelocity,
		}
	end
	function ProjectileLauncherHeldItem:GetAimVector(mouse, launchPosition, ammoMeta)
		-- Note: We could probably get more advanced with this calculation but this constant works pretty well.
		-- Alternatively, we could calculate the "distance" of the path and choose X percent along that distance.
		local aimDistance = 100
		local ray = Camera.main:ScreenPointToRay(mouse:GetLocation())
		local _direction = ray.direction
		local _vector3 = Vector3.new(0, ammoMeta.yAxisAimAdjust, 0)
		local scaledDirection = (_direction + _vector3) * aimDistance
		local targetPoint = ray.origin + scaledDirection
		local _launchPosition = launchPosition
		local adjustedDir = targetPoint - _launchPosition
		return adjustedDir
	end
end
return {
	ProjectileLauncherHeldItem = ProjectileLauncherHeldItem,
}
-- ----------------------------------
-- ----------------------------------
