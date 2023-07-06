-- Compiled with unity-ts v2.1.0-75
local Network = require("Shared/TS/Network").Network
local RunUtil = require("Shared/TS/Util/RunUtil").RunUtil
local VoxelDataAPI
do
	VoxelDataAPI = setmetatable({}, {
		__tostring = function()
			return "VoxelDataAPI"
		end,
	})
	VoxelDataAPI.__index = VoxelDataAPI
	function VoxelDataAPI.new(...)
		local self = setmetatable({}, VoxelDataAPI)
		return self:constructor(...) or self
	end
	function VoxelDataAPI:constructor()
	end
	function VoxelDataAPI:Init()
		if RunCore:IsClient() then
			Network.ServerToClient.SetVoxelData.Client:OnServerEvent(function(voxelPos, key, data)
				self:SetVoxelData(voxelPos, key, data)
			end)
		end
	end
	function VoxelDataAPI:SetVoxelData(voxelPos, key, data)
		local map
		local _voxelDataMap = self.voxelDataMap
		local _voxelPos = voxelPos
		if _voxelDataMap[_voxelPos] ~= nil then
			local _voxelDataMap_1 = self.voxelDataMap
			local _voxelPos_1 = voxelPos
			map = _voxelDataMap_1[_voxelPos_1]
		else
			map = {}
			local _voxelDataMap_1 = self.voxelDataMap
			local _voxelPos_1 = voxelPos
			local _map = map
			_voxelDataMap_1[_voxelPos_1] = _map
		end
		local _map = map
		local _key = key
		local _data = data
		_map[_key] = _data
		if RunUtil:IsServer() then
			Network.ServerToClient.SetVoxelData.Server:FireAllClients(voxelPos, key, data)
		end
	end
	function VoxelDataAPI:ClearVoxelData(voxelPos)
		local _voxelDataMap = self.voxelDataMap
		local _voxelPos = voxelPos
		local _result = _voxelDataMap[_voxelPos]
		if _result ~= nil then
			table.clear(_result)
		end
	end
	function VoxelDataAPI:GetVoxelData(voxelPos, key)
		local _voxelDataMap = self.voxelDataMap
		local _voxelPos = voxelPos
		local _result = _voxelDataMap[_voxelPos]
		if _result ~= nil then
			local _key = key
			_result = _result[_key]
		end
		return _result
	end
	function VoxelDataAPI:GetParentVoxelPos(childPos)
		local _childVoxelRedirectMap = self.childVoxelRedirectMap
		local _childPos = childPos
		return _childVoxelRedirectMap[_childPos]
	end
	function VoxelDataAPI:GetChildrenVoxelPos(parentPos)
		local _parentToChildrenMap = self.parentToChildrenMap
		local _parentPos = parentPos
		local _condition = _parentToChildrenMap[_parentPos]
		if _condition == nil then
			_condition = {}
		end
		return _condition
	end
	function VoxelDataAPI:SetChildOfParent(childPos, parentPos)
		local _childVoxelRedirectMap = self.childVoxelRedirectMap
		local _childPos = childPos
		local _parentPos = parentPos
		_childVoxelRedirectMap[_childPos] = _parentPos
		local _parentToChildrenMap = self.parentToChildrenMap
		local _parentPos_1 = parentPos
		local set = _parentToChildrenMap[_parentPos_1]
		if not set then
			set = {}
			local _parentToChildrenMap_1 = self.parentToChildrenMap
			local _parentPos_2 = parentPos
			local _set = set
			_parentToChildrenMap_1[_parentPos_2] = _set
		end
		local _set = set
		local _childPos_1 = childPos
		_set[_childPos_1] = true
	end
	VoxelDataAPI.voxelDataMap = {}
	VoxelDataAPI.childVoxelRedirectMap = {}
	VoxelDataAPI.parentToChildrenMap = {}
end
return {
	VoxelDataAPI = VoxelDataAPI,
}
-- ----------------------------------
-- ----------------------------------
