-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local MapBlockService
do
	MapBlockService = setmetatable({}, {
		__tostring = function()
			return "MapBlockService"
		end,
	})
	MapBlockService.__index = MapBlockService
	function MapBlockService.new(...)
		local self = setmetatable({}, MapBlockService)
		return self:constructor(...) or self
	end
	function MapBlockService:constructor()
	end
	function MapBlockService:OnStart()
		-- Start tracking placed blocks AFTER match has started.
		ServerSignals.MatchStart:connect(function()
			--[[
				* Voxels placed after match started belong to players.
				* TODO: We _probably_ want exceptions here. IE: Lucky Blocks?
			]]
			WorldAPI:GetMainWorld().OnVoxelPlaced:Connect(function(pos, _voxel)
				VoxelDataAPI:SetVoxelData(pos, "placedByUser", true)
			end)
		end)
		-- Don't allow users to damage map blocks.
		ServerSignals.BeforeBlockHit:Connect(function(event)
			local wasPlacedByUser = VoxelDataAPI:GetVoxelData(event.BlockPos, "placedByUser")
			if not wasPlacedByUser then
				event:SetCancelled(true)
			end
		end)
	end
end
-- (Flamework) MapBlockService metadata
Reflect.defineMetadata(MapBlockService, "identifier", "Bundles/Server/Services/Match/Map/MapBlockService@MapBlockService")
Reflect.defineMetadata(MapBlockService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(MapBlockService, "$:flamework@Service", Service, { {} })
return {
	MapBlockService = MapBlockService,
}
-- ----------------------------------
-- ----------------------------------
