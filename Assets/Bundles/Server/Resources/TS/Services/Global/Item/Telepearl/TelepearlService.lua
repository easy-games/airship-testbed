-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local TelepearlService
do
	TelepearlService = setmetatable({}, {
		__tostring = function()
			return "TelepearlService"
		end,
	})
	TelepearlService.__index = TelepearlService
	function TelepearlService.new(...)
		local self = setmetatable({}, TelepearlService)
		return self:constructor(...) or self
	end
	function TelepearlService:constructor()
	end
	function TelepearlService:OnStart()
		ServerSignals.ProjectileHit:Connect(function(event)
			print("projectile itemType: " .. event.projectile.itemType)
			if event.projectile.itemType ~= ItemType.TELEPEARL then
				return nil
			end
			-- Verify player threw telepearl.
			print("telepearl.1")
			if not event.projectile.shooter then
				return nil
			end
			print("telepearl.2")
			local _hitPosition = event.hitPosition
			local _arg0 = event.velocity.normalized * 0.01
			local adjustedHitPoint = _hitPosition + _arg0
			local world = WorldAPI:GetMainWorld()
			local hitBlock = world:GetBlockAt(adjustedHitPoint)
			DebugUtil:DrawSphere(event.hitPosition, Quaternion.identity, 0.1, Color.red, 4, 5)
			DebugUtil:DrawSphere(adjustedHitPoint, Quaternion.identity, 0.15, Color.blue, 4, 5)
			-- Verify that we hit a voxel.
			if not hitBlock then
				print("Didn't hit block: " .. tostring(adjustedHitPoint))
				return nil
			end
			print("telepearl.3")
			local topMostBlockPos = adjustedHitPoint
			local foundAir = false
			do
				local i = 0
				local _shouldIncrement = false
				while true do
					if _shouldIncrement then
						i += 1
					else
						_shouldIncrement = true
					end
					if not (i < 30) then
						break
					end
					print("topMostVoxelPoint: " .. tostring(topMostBlockPos))
					local _topMostBlockPos = topMostBlockPos
					local _vector3 = Vector3.new(0, 1, 0)
					local testPos = _topMostBlockPos + _vector3
					local testBlock = world:GetBlockAt(testPos)
					if testBlock:IsAir() then
						foundAir = true
						break
					end
					topMostBlockPos = testPos
				end
			end
			if not foundAir then
				print("Failed to find air for telepearl.")
				return nil
			end
			-- Land on TOP of the top-most block.
			local _topMostBlockPos = topMostBlockPos
			local _vector3 = Vector3.new(0, 1, 0)
			local teleportPos = _topMostBlockPos + _vector3
			-- Teleport player to hit position.
			local humanoid = event.projectile.shooter:GetEntityDriver()
			humanoid:Teleport(teleportPos)
		end)
	end
end
-- (Flamework) TelepearlService metadata
Reflect.defineMetadata(TelepearlService, "identifier", "Bundles/Server/Services/Global/Item/Telepearl/TelepearlService@TelepearlService")
Reflect.defineMetadata(TelepearlService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(TelepearlService, "$:flamework@Service", Service, { {} })
return {
	TelepearlService = TelepearlService,
}
-- ----------------------------------
-- ----------------------------------
