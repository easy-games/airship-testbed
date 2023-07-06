-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ObjectUtils = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local Task = require("Shared/TS/Util/Task").Task
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
-- * Bed block id.
local _result = GetItemMeta(ItemType.BED).block
if _result ~= nil then
	_result = _result.blockId
end
local _condition = _result
if _condition == nil then
	_condition = -1
end
local BED_BLOCK_ID = _condition
local BedService
do
	BedService = setmetatable({}, {
		__tostring = function()
			return "BedService"
		end,
	})
	BedService.__index = BedService
	function BedService.new(...)
		local self = setmetatable({}, BedService)
		return self:constructor(...) or self
	end
	function BedService:constructor(mapService, matchService)
		self.mapService = mapService
		self.matchService = matchService
		self.teamToBed = {}
	end
	function BedService:OnStart()
		-- Listen for bed destroyed.
		ServerSignals.BeforeBlockDestroyed:Connect(function(event)
			if event.blockId == BED_BLOCK_ID then
				local teamId = VoxelDataAPI:GetVoxelData(event.blockPos, "teamId")
				if not (teamId ~= "" and teamId) then
					return nil
				end
				ServerSignals.BedDestroyed:Fire({
					bedTeamId = teamId,
				})
			end
		end)
		-- Spawn beds after map load and match start.
		Task:Spawn(function()
			self.loadedMap = self.mapService:WaitForMapLoaded()
			ServerSignals.MatchStart:connect(function()
				return self:SpawnBeds()
			end)
		end)
	end
	function BedService:SpawnBeds()
		-- Spawn beds.
		local beds = self.loadedMap:GetAllBeds()
		local _exp = ObjectUtils.keys(beds)
		local _arg0 = function(teamId)
			local bed = beds[teamId]
			local bedPos = MathUtil:FloorVec(Vector3.new(bed.Position.x, bed.Position.y, bed.Position.z))
			local bedState = {
				teamId = teamId,
				position = bedPos,
				destroyed = false,
			}
			local _teamToBed = self.teamToBed
			local _teamId = teamId
			_teamToBed[_teamId] = bedState
			WorldAPI:GetMainWorld():PlaceBlock(bedPos, ItemType.BED)
			-- TEMPORARY. Fix `VoxelDataAPI` race condition.
			Task:Delay(1, function()
				VoxelDataAPI:SetVoxelData(bedPos, "teamId", teamId)
			end)
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
	end
	function BedService:IsBedDestroyed(teamId)
		local bedState = self:GetBedStateForTeamId(teamId)
		if not bedState then
			return true
		end
		return bedState.destroyed
	end
	function BedService:GetBedStateForTeamId(teamId)
		local _teamToBed = self.teamToBed
		local _teamId = teamId
		return _teamToBed[_teamId]
	end
end
-- (Flamework) BedService metadata
Reflect.defineMetadata(BedService, "identifier", "Bundles/Server/Services/Match/BedService@BedService")
Reflect.defineMetadata(BedService, "flamework:parameters", { "Bundles/Server/Services/Match/Map/MapService@MapService", "Bundles/Server/Services/Match/MatchService@MatchService" })
Reflect.defineMetadata(BedService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BedService, "$:flamework@Service", Service, { {} })
return {
	BedService = BedService,
}
-- ----------------------------------
-- ----------------------------------
