-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Network = require("Shared/TS/Network").Network
local DenyRegionController
do
	DenyRegionController = setmetatable({}, {
		__tostring = function()
			return "DenyRegionController"
		end,
	})
	DenyRegionController.__index = DenyRegionController
	function DenyRegionController.new(...)
		local self = setmetatable({}, DenyRegionController)
		return self:constructor(...) or self
	end
	function DenyRegionController:constructor()
		self.processedDenyRegionIds = {}
		self.denyVoxelPositions = {}
	end
	function DenyRegionController:OnStart()
		-- Listen for incoming deny region snapshots.
		Network.ServerToClient.DenyRegionSnapshot.Client:OnServerEvent(function(denyRegions)
			local _denyRegions = denyRegions
			local _arg0 = function(denyRegion)
				return self:CreateDenyRegionFromDto(denyRegion)
			end
			for _k, _v in _denyRegions do
				_arg0(_v, _k - 1, _denyRegions)
			end
		end)
		-- Listen for created deny regions.
		Network.ServerToClient.DenyRegionCreated.Client:OnServerEvent(function(denyRegion)
			self:CreateDenyRegionFromDto(denyRegion)
		end)
		-- Cancel block placed if voxel position is inside of a deny region.
		ClientSignals.BeforeBlockPlaced:ConnectWithPriority(0, function(event)
			if self:InDenyRegion(event.pos) then
				event:setCancelled(true)
			end
		end)
	end
	function DenyRegionController:CreateDenyRegionFromDto(denyRegion)
		-- Do not process deny regions twice.
		local _processedDenyRegionIds = self.processedDenyRegionIds
		local _id = denyRegion.id
		if _processedDenyRegionIds[_id] ~= nil then
			return nil
		end
		local _processedDenyRegionIds_1 = self.processedDenyRegionIds
		local _id_1 = denyRegion.id
		_processedDenyRegionIds_1[_id_1] = true
		-- Recreate region.
		local origin = denyRegion.origin
		local size = denyRegion.size
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
	end
	function DenyRegionController:InDenyRegion(position)
		local _denyVoxelPositions = self.denyVoxelPositions
		local _position = position
		return _denyVoxelPositions[_position] ~= nil
	end
end
-- (Flamework) DenyRegionController metadata
Reflect.defineMetadata(DenyRegionController, "identifier", "Bundles/Client/Controllers/Global/BlockInteractions/DenyRegionController@DenyRegionController")
Reflect.defineMetadata(DenyRegionController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(DenyRegionController, "$:flamework@Controller", Controller, { {
	loadOrder = -1,
} })
return {
	DenyRegionController = DenyRegionController,
}
-- ----------------------------------
-- ----------------------------------
