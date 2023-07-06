-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local Signal = require("Shared/TS/Util/Signal").Signal
local SetTimeout = require("Shared/TS/Util/Timer").SetTimeout
local ProjectileSharedImpl = require("Shared/TS/Projectile/ProjectileSharedImpl").ProjectileSharedImpl
local Projectile
do
	Projectile = setmetatable({}, {
		__tostring = function()
			return "Projectile"
		end,
	})
	Projectile.__index = Projectile
	function Projectile.new(...)
		local self = setmetatable({}, Projectile)
		return self:constructor(...) or self
	end
	function Projectile:constructor(easyProjectile, itemType, shooter)
		self.easyProjectile = easyProjectile
		self.destroyed = false
		self.OnDestroy = Signal.new()
		self.OnCollide = Signal.new()
		self.gameObject = easyProjectile.gameObject
		self.itemType = itemType
		self.shooter = shooter
		self.OnDestroy:Connect(function()
			self.destroyed = true
		end)
		easyProjectile:onCollide(function(collision, velocity)
			local contact = collision.contacts:GetValue(0)
			local hitPoint = contact.point
			local normal = contact.normal
			local collider = contact.otherCollider
			local ignored = ProjectileSharedImpl:ShouldIgnoreCollision(self, hitPoint, normal, collider)
			if ignored then
				return nil
			end
			self.OnCollide:Fire(hitPoint, collider)
			if RunUtil:IsServer() then
				(Flamework.resolveDependency("Bundles/Server/Services/Global/Damage/Projectile/ProjectileService@ProjectileService")):HandleCollision(self, collider, hitPoint, normal, velocity)
			else
				(Flamework.resolveDependency("Bundles/Client/Controllers/Global/Damage/Projectile/ProjectileController@ProjectileController")):HandleCollision(self, collider, hitPoint, normal, velocity)
			end
		end)
		local dw = self.gameObject:GetComponent("DestroyWatcher")
		dw:OnDestroyedEvent(function()
			self.OnDestroy:Fire()
		end)
		SetTimeout(12, function()
			if not self.destroyed then
				self:Destroy()
			end
		end)
	end
	function Projectile:Destroy()
		if self.destroyed then
			return nil
		end
		self.destroyed = true
		Object:Destroy(self.gameObject)
	end
end
return {
	Projectile = Projectile,
}
-- ----------------------------------
-- ----------------------------------
