-- Compiled with unity-ts v2.1.0-75
local Object = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local StringUtils = require("Shared/TS/Util/StringUtil")
local MapPosition = require("Server/TS/Services/Match/Map/MapPosition").MapPosition
-- * Map alias type.
-- * Map alias type.
local LoadedMap
do
	LoadedMap = setmetatable({}, {
		__tostring = function()
			return "LoadedMap"
		end,
	})
	LoadedMap.__index = LoadedMap
	function LoadedMap.new(...)
		local self = setmetatable({}, LoadedMap)
		return self:constructor(...) or self
	end
	function LoadedMap:constructor(gameMap, mapObjects)
		self.mapObjects = {
			teamMapObjects = {},
			miscMapObjects = {},
		}
		self.loadedMap = gameMap
		self:ParseMapObjects(mapObjects)
	end
	function LoadedMap:ParseMapObjects(mapObjects)
		do
			local i = 0
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i < #mapObjects) then
					break
				end
				local val = mapObjects[i + 1]
				-- If map object name is underscore delimited, first part is team id.
				local parts = string.split(val.name, "_")
				local isTeamObject = #parts > 1
				if isTeamObject then
					local teamId = parts[1]
					local objectId = parts[2]
					if not (teamId ~= "" and teamId) or not (objectId ~= "" and objectId) then
						continue
					end
					local teamBucket = self.mapObjects.teamMapObjects[teamId]
					if not teamBucket then
						self.mapObjects.teamMapObjects[teamId] = {}
					end
					self.mapObjects.teamMapObjects[teamId][objectId] = MapPosition.new(val.position, val.rotation)
				end
				-- Otherwise, we're working with generic map objects, pool generators in buckets.
				if StringUtils.includes(val.name, "EmeraldGenerator") then
					local generators = self.mapObjects.miscMapObjects.EmeraldGenerators
					local mapPosition = MapPosition.new(val.position, val.rotation)
					if generators then
						table.insert(generators, mapPosition)
					else
						self.mapObjects.miscMapObjects.EmeraldGenerators = { mapPosition }
					end
				elseif StringUtils.includes(val.name, "DiamondGenerator") then
					local generators = self.mapObjects.miscMapObjects.DiamondGenerators
					local mapPosition = MapPosition.new(val.position, val.rotation)
					if generators then
						table.insert(generators, mapPosition)
					else
						self.mapObjects.miscMapObjects.DiamondGenerators = { mapPosition }
					end
				else
					self.mapObjects.miscMapObjects[val.name] = MapPosition.new(val.position, val.rotation)
				end
			end
		end
	end
	function LoadedMap:GetTeamMapObjectsById(objectId)
		local values = {}
		local _exp = Object.keys(self.mapObjects.teamMapObjects)
		local _arg0 = function(teamId)
			local teamObjects = self.mapObjects.teamMapObjects[teamId]
			values[teamId] = teamObjects[objectId]
		end
		for _k, _v in _exp do
			_arg0(_v, _k - 1, _exp)
		end
		return values
	end
	function LoadedMap:GetLoadedGameMap()
		return self.loadedMap
	end
	function LoadedMap:GetMapCenter()
		return self.mapObjects.miscMapObjects.Center
	end
	function LoadedMap:GetMapSpawnPlatform()
		return self.mapObjects.miscMapObjects.SpawnPlatform
	end
	function LoadedMap:GetAllTeamMapObjects()
		return self.mapObjects.teamMapObjects
	end
	function LoadedMap:GetTeamMapObjects(teamId)
		return self.mapObjects.teamMapObjects[teamId]
	end
	function LoadedMap:GetMiscMapObjects()
		return self.mapObjects.miscMapObjects
	end
	function LoadedMap:GetTeamGenerators()
		return self:GetTeamMapObjectsById("Generator")
	end
	function LoadedMap:GetMapDiamondGenerators()
		return self.mapObjects.miscMapObjects.DiamondGenerators
	end
	function LoadedMap:GetMapEmeraldGenerators()
		return self.mapObjects.miscMapObjects.EmeraldGenerators
	end
	function LoadedMap:GetAllBeds()
		return self:GetTeamMapObjectsById("Bed")
	end
	function LoadedMap:GetAllShopkeepers()
		return self:GetTeamMapObjectsById("Shop")
	end
	function LoadedMap:GetAllTeamUpgrades()
		return self:GetTeamMapObjectsById("Upgrades")
	end
	function LoadedMap:GetSpawnPositionForTeam(team)
		return self.mapObjects.teamMapObjects[team.id].Spawn
	end
end
return {
	LoadedMap = LoadedMap,
}
-- ----------------------------------
-- ----------------------------------
