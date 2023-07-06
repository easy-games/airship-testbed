-- Compiled with unity-ts v2.1.0-75
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local NormalizeV3 = require("Shared/TS/Util/Vector3Util").NormalizeV3
local ProjectileUtil
do
	ProjectileUtil = setmetatable({}, {
		__tostring = function()
			return "ProjectileUtil"
		end,
	})
	ProjectileUtil.__index = ProjectileUtil
	function ProjectileUtil.new(...)
		local self = setmetatable({}, ProjectileUtil)
		return self:constructor(...) or self
	end
	function ProjectileUtil:constructor()
	end
	function ProjectileUtil:GetLaunchPosition(entity, isInFirstPerson)
		local launchPos
		local handObjects = entity:GetAccessoryGameObjects(2)
		for _, handObject in handObjects do
			local shootPosition = handObject.transform:FindChild("ShootPosition")
			if shootPosition then
				launchPos = shootPosition.transform.position
			end
		end
		if not launchPos then
			if isInFirstPerson then
				launchPos = entity:LocalOffsetToWorldPoint(Vector3.new(1, -0.5, 0))
			else
				launchPos = entity:GetMiddlePosition()
			end
		end
		return launchPos
	end
	function ProjectileUtil:GetLaunchForceData(itemMeta, aimVector, chargeSec)
		local chargePercent = MathUtil:InvLerp(0, itemMeta.itemMechanics.maxChargeSeconds, math.min(chargeSec, itemMeta.itemMechanics.maxChargeSeconds))
		local adjustedPower = MathUtil:Lerp(itemMeta.ProjectileLauncher.minVelocityScaler, itemMeta.ProjectileLauncher.maxVelocityScaler, chargePercent)
		local normalizedAimVector = NormalizeV3(aimVector)
		return {
			direction = normalizedAimVector,
			initialVelocity = normalizedAimVector * adjustedPower,
		}
	end
end
return {
	ProjectileUtil = ProjectileUtil,
}
-- ----------------------------------
-- ----------------------------------
