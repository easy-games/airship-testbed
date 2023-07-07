-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local Game = require("Shared/TS/Game").Game
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Network = require("Shared/TS/Network").Network
local Signal = require("Shared/TS/Util/Signal").Signal
local Block = require("Shared/TS/VoxelWorld/Block").Block
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local World
do
	World = setmetatable({}, {
		__tostring = function()
			return "World"
		end,
	})
	World.__index = World
	function World.new(...)
		local self = setmetatable({}, World)
		return self:constructor(...) or self
	end
	function World:constructor(voxelWorld)
		self.voxelWorld = voxelWorld
		self.OnVoxelPlaced = Signal.new()
		voxelWorld:OnVoxelPlaced(function(voxel, x, y, z)
			local vec = Vector3.new(x, y, z)
			VoxelDataAPI:ClearVoxelData(vec)
			voxel = VoxelWorld:VoxelDataToBlockId(voxel)
			self.OnVoxelPlaced:Fire(vec, voxel)
		end)
	end
	function World:GetRawVoxelDataAt(pos)
		return self.voxelWorld:ReadVoxelAt(pos)
	end
	function World:GetBlockAt(pos)
		return Block.new(self.voxelWorld:ReadVoxelAt(pos), self)
	end
	function World:GetBlockBelowMeta(pos)
		local _fn = self
		local _pos = pos
		local _vector3 = Vector3.new(0, -0.1, 0)
		local _result = _fn:GetBlockAt(_pos + _vector3)
		if _result ~= nil then
			_result = _result.itemMeta
			if _result ~= nil then
				_result = _result.block
			end
		end
		return _result
	end
	function World:PlaceBlock(pos, itemType, config)
		local itemMeta = GetItemMeta(itemType)
		if not itemMeta.block then
			return nil
		end
		local blockId = itemMeta.block.blockId
		self:PlaceBlockById(pos, blockId, config)
	end
	function World:PlaceBlockById(pos, blockId, config)
		local _fn = self.voxelWorld
		local _exp = pos
		local _exp_1 = blockId
		local _result = config
		if _result ~= nil then
			_result = _result.priority
		end
		local _condition = _result
		if _condition == nil then
			_condition = true
		end
		_fn:WriteVoxelAt(_exp, _exp_1, _condition)
		if RunCore:IsServer() then
			local _fn_1 = Network.ServerToClient.BlockPlace.Server
			local _exp_2 = pos
			local _exp_3 = blockId
			local _result_1 = config
			if _result_1 ~= nil then
				_result_1 = _result_1.placedByEntityId
			end
			_fn_1:FireAllClients(_exp_2, _exp_3, _result_1)
		else
			local _result_1 = config
			if _result_1 ~= nil then
				_result_1 = _result_1.placedByEntityId
			end
			local _result_2 = Game.LocalPlayer.Character
			if _result_2 ~= nil then
				_result_2 = _result_2.id
			end
			if _result_1 == _result_2 then
				-- Client predicted block place event
				local clientSignals = TS.Promise.new(function(resolve)
					resolve(require("Client/TS/ClientSignals"))
				end):expect().ClientSignals
				local BlockPlaceClientSignal = TS.Promise.new(function(resolve)
					resolve(require("Client/TS/Signals/BlockPlaceClientSignal"))
				end):expect().BlockPlaceClientSignal
				local block = Block.new(blockId, self)
				clientSignals.BlockPlace:Fire(BlockPlaceClientSignal.new(pos, block, Game.LocalPlayer.Character))
			end
		end
	end
	function World:LoadWorldFromVoxelBinaryFile(binaryFile, blockDefines)
		self.voxelWorld:LoadWorldFromVoxelBinaryFile(binaryFile, blockDefines)
	end
	function World:LoadEmptyWorld(blockDefines, cubeMapPath)
		self.voxelWorld:LoadEmptyWorld(blockDefines, cubeMapPath)
	end
	function World:RaycastVoxel(pos, direction, maxDistance)
		return self.voxelWorld:RaycastVoxel(pos, direction, maxDistance)
	end
	function World:GetBlockDefinition(blockId)
		return self.voxelWorld.blocks:GetBlockDefinitionFromIndex(blockId)
	end
	function World:GetBlockAverageColor(blockId)
		local _result = self:GetBlockDefinition(blockId)
		if _result ~= nil then
			_result = _result.averageColor:GetValue(0)
		end
		return _result
	end
	World.SKYBOX = "Shared/Resources/Skybox/BrightSky/bright_sky_2.png"
end
return {
	World = World,
}
-- ----------------------------------
-- ----------------------------------
