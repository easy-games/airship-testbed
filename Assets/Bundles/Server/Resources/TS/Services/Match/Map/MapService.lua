-- Compiled with unity-ts v2.1.0-75
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local RandomUtil = require("Shared/TS/Util/RandomUtil").RandomUtil
local Task = require("Shared/TS/Util/Task").Task
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local LoadedMap = require("Server/TS/Services/Match/Map/LoadedMap").LoadedMap
local MapService
do
	MapService = setmetatable({}, {
		__tostring = function()
			return "MapService"
		end,
	})
	MapService.__index = MapService
	function MapService.new(...)
		local self = setmetatable({}, MapService)
		return self:constructor(...) or self
	end
	function MapService:constructor()
		self.mapLoaded = false
	end
	function MapService:OnStart()
		Task:Spawn(function()
			self.queueMeta = (Flamework.resolveDependency("Bundles/Server/Services/Match/MatchService@MatchService")):WaitForQueueReady()
			self.gameMap = RandomUtil:FromArray(self.queueMeta.maps)
			self:BuildMap(self.gameMap)
		end)
	end
	function MapService:BuildMap(map)
		-- Fetch world, load map voxel file and block defines.
		print("Loading world " .. map)
		local world = WorldAPI:GetMainWorld()
		self.voxelBinaryFile = AssetBridge:LoadAsset("Server/Resources/Worlds/" .. (map .. ".asset"))
		local blockDefines = AssetBridge:LoadAsset("Shared/Resources/VoxelWorld/BlockDefines.xml")
		-- Load world.
		-- world.LoadEmptyWorld(blockDefines, "");
		-- const grass = GetItemMeta(ItemType.GRASS).BlockId;
		-- world.WriteVoxelAt(new Vector3(1, 1, 1), grass!);
		world:LoadWorldFromVoxelBinaryFile(self.voxelBinaryFile, blockDefines)
		-- Parse map objects and finish loading map.
		-- TEMP: This is to get around memory pinning issue.
		local mapObjects = {}
		local rawMaps = self.voxelBinaryFile:GetMapObjects()
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < rawMaps.Length) then
					break
				end
				local data = rawMaps:GetValue(i)
				local _mapObjects = mapObjects
				local _arg0 = {
					name = data.name,
					position = data.position,
					rotation = data.rotation,
				}
				table.insert(_mapObjects, _arg0)
			end
		end
		self.loadedMap = LoadedMap.new(map, mapObjects)
		ServerSignals.MapLoad:fire(self.loadedMap)
		self.mapLoaded = true
	end
	function MapService:WaitForMapLoaded()
		if self.loadedMap and (self.mapLoaded and self.voxelBinaryFile) then
			return self.loadedMap
		end
		while not self.loadedMap and (not self.mapLoaded and not self.voxelBinaryFile) do
			Task:Wait(0.1)
		end
		return self.loadedMap
	end
	function MapService:GetLoadedMap()
		return self.loadedMap
	end
	function MapService:GetGameMap()
		return self.gameMap
	end
end
-- (Flamework) MapService metadata
Reflect.defineMetadata(MapService, "identifier", "Bundles/Server/Services/Match/Map/MapService@MapService")
Reflect.defineMetadata(MapService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(MapService, "$:flamework@Service", Service, { {} })
return {
	MapService = MapService,
}
-- ----------------------------------
-- ----------------------------------
