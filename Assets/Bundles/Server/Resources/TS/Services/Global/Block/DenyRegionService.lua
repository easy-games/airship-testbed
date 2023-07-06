-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local Network = require("Shared/TS/Network").Network
local Task = require("Shared/TS/Util/Task").Task
-- * Deny region snapshot send delay.
local SNAPSHOT_DELAY = 0.5
local DenyRegionService
do
	DenyRegionService = setmetatable({}, {
		__tostring = function()
			return "DenyRegionService"
		end,
	})
	DenyRegionService.__index = DenyRegionService
	function DenyRegionService.new(...)
		local self = setmetatable({}, DenyRegionService)
		return self:constructor(...) or self
	end
	function DenyRegionService:constructor()
		self.denyRegionIdCounter = 0
		self.trackedDenyRegions = {}
		self.denyVoxelPositions = {}
	end
	function DenyRegionService:OnStart()
		-- Cancel block placed if voxel position is inside of a deny region.
		ServerSignals.BeforeBlockPlaced:ConnectWithPriority(0, function(event)
			if self:InDenyRegion(event.pos) then
				event:setCancelled(true)
			end
		end)
		-- Send deny region snapshot to late joiners.
		ServerSignals.PlayerJoin:connect(function(event)
			Task:Delay(SNAPSHOT_DELAY, function()
				Network.ServerToClient.DenyRegionSnapshot.Server:FireClient(event.player.clientId, self.trackedDenyRegions)
			end)
		end)
	end
	function DenyRegionService:CreateDenyRegion(origin, size)
		local _object = {
			origin = origin,
			size = size,
		}
		local _left = "id"
		local _original = self.denyRegionIdCounter
		self.denyRegionIdCounter += 1
		_object[_left] = tostring(_original)
		local newTrackedDenyRegion = _object
		table.insert(self.trackedDenyRegions, newTrackedDenyRegion)
		do
			local x = origin.x - math.floor(size.x / 2)
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					x += 1
				else
					_shouldIncrement = true
				end
				if not (x <= origin.x + math.ceil(size.x / 2)) then
					break
				end
				do
					local y = origin.y
					local _shouldIncrement_1 = false
					while true do
						if _shouldIncrement_1 then
							y += 1
						else
							_shouldIncrement_1 = true
						end
						if not (y <= origin.y + size.y) then
							break
						end
						do
							local z = origin.z - math.floor(size.z / 2)
							local _shouldIncrement_2 = false
							while true do
								if _shouldIncrement_2 then
									z += 1
								else
									_shouldIncrement_2 = true
								end
								if not (z <= origin.z + math.ceil(size.z / 2)) then
									break
								end
								local denyPosition = Vector3.new(x, y, z)
								self.denyVoxelPositions[denyPosition] = true
							end
						end
					end
				end
			end
		end
		Network.ServerToClient.DenyRegionCreated.Server:FireAllClients(newTrackedDenyRegion)
	end
	function DenyRegionService:InDenyRegion(position)
		local _denyVoxelPositions = self.denyVoxelPositions
		local _position = position
		return _denyVoxelPositions[_position] ~= nil
	end
end
-- (Flamework) DenyRegionService metadata
Reflect.defineMetadata(DenyRegionService, "identifier", "Bundles/Server/Services/Global/Block/DenyRegionService@DenyRegionService")
Reflect.defineMetadata(DenyRegionService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(DenyRegionService, "$:flamework@Service", Service, { {} })
return {
	DenyRegionService = DenyRegionService,
}
-- ----------------------------------
-- ----------------------------------
