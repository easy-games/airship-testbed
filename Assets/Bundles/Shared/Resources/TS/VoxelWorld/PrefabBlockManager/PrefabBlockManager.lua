-- Compiled with unity-ts v2.1.0-75
local Flamework = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Flamework
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local _ItemDefinitions = require("Shared/TS/Item/ItemDefinitions")
local GetItemMeta = _ItemDefinitions.GetItemMeta
local GetItemTypeFromBlockId = _ItemDefinitions.GetItemTypeFromBlockId
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local Network = require("Shared/TS/Network").Network
local Theme = require("Shared/TS/Util/Theme").Theme
local PrefabBlockManager
do
	PrefabBlockManager = setmetatable({}, {
		__tostring = function()
			return "PrefabBlockManager"
		end,
	})
	PrefabBlockManager.__index = PrefabBlockManager
	function PrefabBlockManager.new(...)
		local self = setmetatable({}, PrefabBlockManager)
		return self:constructor(...) or self
	end
	function PrefabBlockManager:constructor()
		self.objectMap = {}
		local world = WorldAPI:GetMainWorld()
		world.OnVoxelPlaced:Connect(function(pos, voxel)
			local blockId = VoxelWorld:VoxelDataToBlockId(voxel)
			local itemType = GetItemTypeFromBlockId(blockId)
			self:OnBlockDestroy(pos)
			if itemType then
				self:OnBlockPlace(pos, itemType)
			end
		end)
		-- Listen to updates to voxel meta data
		Network.ServerToClient.SetVoxelData.Client:OnServerEvent(function(voxelPos, key, data)
			local _objectMap = self.objectMap
			local _voxelPos = voxelPos
			local go = _objectMap[_voxelPos]
			if go then
				if key == "teamId" then
					local _result = (Flamework.resolveDependency("Bundles/Client/Controllers/Global/Team/TeamController@TeamController")):GetTeam(data)
					if _result ~= nil then
						_result = _result.color
					end
					local _condition = _result
					if _condition == nil then
						_condition = Theme.White
					end
					local teamColor = _condition
					local rens = go:GetComponentsInChildren()
					do
						local i = 0
						local _shouldIncrement = false
						while true do
							if _shouldIncrement then
								i += 1
							else
								_shouldIncrement = true
							end
							if not (i < rens.Length) then
								break
							end
							local ren = rens:GetValue(i)
							if ren.gameObject.tag == "TeamColor" then
								local ren = rens:GetValue(i)
								local mats = ren.materials
								do
									local j = 0
									local _shouldIncrement_1 = false
									while true do
										if _shouldIncrement_1 then
											j += 1
										else
											_shouldIncrement_1 = true
										end
										if not (j < mats.Length) then
											break
										end
										local mat = mats:GetValue(j)
										mat.color = Color.new(mat.color.r * teamColor.r, mat.color.g * teamColor.g, mat.color.b * teamColor.b)
									end
								end
							end
						end
					end
				end
			end
		end)
	end
	function PrefabBlockManager:Get()
		if self.instance == nil then
			self.instance = PrefabBlockManager.new()
		end
		return self.instance
	end
	function PrefabBlockManager:OnBlockPlace(pos, itemType)
		local itemMeta = GetItemMeta(itemType)
		local _result = itemMeta.block
		if _result ~= nil then
			_result = _result.prefab
		end
		if _result then
			local prefab = AssetBridge:LoadAsset("Shared/Resources/VoxelWorld/BlockPrefabs/" .. itemMeta.block.prefab.path)
			local prefabGO = GameObjectBridge:InstantiateAt(prefab, pos, Quaternion.identity)
			local _objectMap = self.objectMap
			local _pos = pos
			_objectMap[_pos] = prefabGO
			if itemMeta.block.prefab.childBlocks then
				local world = WorldAPI:GetMainWorld()
				for _, vec in itemMeta.block.prefab.childBlocks do
					local worldSpace = pos + vec
					VoxelDataAPI:SetChildOfParent(worldSpace, pos)
					world:PlaceBlockById(worldSpace, WorldAPI.ChildVoxelId)
				end
			end
		end
		local _result_1 = itemMeta.block
		if _result_1 ~= nil then
			_result_1 = _result_1.health
		end
		local _condition = _result_1 ~= nil
		if _condition then
			_condition = RunUtil:IsServer()
		end
		if _condition then
			VoxelDataAPI:SetVoxelData(pos, "health", itemMeta.block.health)
		end
	end
	function PrefabBlockManager:OnBlockDestroy(pos)
		local _objectMap = self.objectMap
		local _pos = pos
		local obj = _objectMap[_pos]
		if obj then
			local animatingOut = false
			local ref = obj:GetComponent("GameObjectReferences")
			if ref then
				local anim = ref:GetValue("Animation", "OnDeath")
				if anim then
					animatingOut = true
					anim:Play()
					GameObjectBridge:Destroy(obj, 5)
				end
			end
			if not animatingOut then
				GameObjectBridge:Destroy(obj)
			end
		end
		local world = WorldAPI:GetMainWorld()
		local childPositions = VoxelDataAPI:GetChildrenVoxelPos(pos)
		for childPos in childPositions do
			world:PlaceBlockById(childPos, 0)
		end
	end
end
return {
	PrefabBlockManager = PrefabBlockManager,
}
-- ----------------------------------
-- ----------------------------------
