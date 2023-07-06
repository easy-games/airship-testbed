-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Game = require("Shared/TS/Game").Game
local Network = require("Shared/TS/Network").Network
local _Timer = require("Shared/TS/Util/Timer")
local OnLateUpdate = _Timer.OnLateUpdate
local SetInterval = _Timer.SetInterval
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local EffectsManager = require("Shared/TS/Effects/EffectsManager").EffectsManager
local ProgressBarGraphics = require("Shared/TS/UI/ProgressBarGraphics").ProgressBarGraphics
local _ReferenceManagerResources = require("Shared/TS/Util/ReferenceManagerResources")
local BundleGroupNames = _ReferenceManagerResources.BundleGroupNames
local Bundle_Blocks = _ReferenceManagerResources.Bundle_Blocks
local Bundle_Blocks_UI = _ReferenceManagerResources.Bundle_Blocks_UI
local Bundle_Blocks_VFX = _ReferenceManagerResources.Bundle_Blocks_VFX
local Theme = require("Shared/TS/Util/Theme").Theme
local CameraReferences = require("Client/TS/Controllers/Global/Camera/CameraReferences").CameraReferences
local BeforeBlockHitSignal = require("Client/TS/Controllers/Global/BlockInteractions/Signal/BeforeBlockHitSignal").BeforeBlockHitSignal
local BlockHealthController
do
	BlockHealthController = setmetatable({}, {
		__tostring = function()
			return "BlockHealthController"
		end,
	})
	BlockHealthController.__index = BlockHealthController
	function BlockHealthController.new(...)
		local self = setmetatable({}, BlockHealthController)
		return self:constructor(...) or self
	end
	function BlockHealthController:constructor(invController, blockSelectController, entityController)
		self.invController = invController
		self.blockSelectController = blockSelectController
		self.entityController = entityController
		self.blockHealthBars = {}
		self.HEALTHBAR_EXPIRE_TIME = 1.25
	end
	function BlockHealthController:OnStart()
		Network.ServerToClient.BlockHit.Client:OnServerEvent(function(blockPos, entityId)
			if Game.LocalPlayer.Character and entityId == Game.LocalPlayer.Character.id then
				return nil
			end
			local voxel = WorldAPI:GetMainWorld():GetRawVoxelDataAt(blockPos)
			if voxel ~= 0 and (voxel == voxel and voxel) then
				local entity = self.entityController:GetEntityById(entityId)
				local blockId = VoxelWorld:VoxelDataToBlockId(voxel)
				ClientSignals.AfterBlockHit:Fire({
					pos = blockPos,
					blockId = blockId,
					entity = entity,
				})
				self:VisualizeBlockHealth(blockPos)
			end
		end)
		Network.ServerToClient.BlockDestroyed.Client:OnServerEvent(function(blockPos, blockId)
			self:VisualizeBlockBreak(blockPos, blockId)
		end)
		OnLateUpdate:Connect(function(dt)
			local _blockHealthBars = self.blockHealthBars
			local _arg0 = function(healthbarEntry, block)
				healthbarEntry.gameObject.transform.rotation = CameraReferences:Instance().mainCamera.transform.rotation
			end
			for _k, _v in _blockHealthBars do
				_arg0(_v, _k, _blockHealthBars)
			end
		end)
		-- Cleanup health bars after no changes are made
		SetInterval(0.1, function()
			local toRemove = {}
			local _blockHealthBars = self.blockHealthBars
			local _arg0 = function(entry, pos)
				if Time.time >= entry.lastHitTime + self.HEALTHBAR_EXPIRE_TIME then
					local _pos = pos
					local _entry = entry
					toRemove[_pos] = _entry
				end
			end
			for _k, _v in _blockHealthBars do
				_arg0(_v, _k, _blockHealthBars)
			end
			local _arg0_1 = function(entry, pos)
				self:DeleteHealthBar(entry, pos)
			end
			for _k, _v in toRemove do
				_arg0_1(_v, _k, toRemove)
			end
		end)
	end
	function BlockHealthController:OnBeforeBlockHit(voxelPos, block)
		ClientSignals.BeforeBlockHit:Fire(BeforeBlockHitSignal.new(voxelPos, block))
	end
	function BlockHealthController:VisualizeBlockHealth(blockPos)
		-- Get or create health bar
		local _blockHealthBars = self.blockHealthBars
		local _blockPos = blockPos
		local healthBarEntry = _blockHealthBars[_blockPos]
		if not healthBarEntry then
			healthBarEntry = self:AddHealthBar(blockPos)
			if not healthBarEntry then
				return nil
			end
		end
		-- Update the health bars value
		local currentHealth = self:GetBlockHealth(blockPos)
		healthBarEntry.lastHitTime = Time.time
		healthBarEntry.progressBar:SetValue(currentHealth / healthBarEntry.maxHealth)
		if currentHealth > 0 then
			local effect = EffectsManager:SpawnBundleEffect(BundleGroupNames.Blocks, Bundle_Blocks.VFX, Bundle_Blocks_VFX.OnHit, blockPos, Vector3.zero)
			if effect then
				local block = WorldAPI:GetMainWorld():GetBlockAt(blockPos)
				local blockColor = block:GetAverageColor()
				print("block color: " .. tostring(blockColor));
				(effect.transform:GetChild(0):GetComponent("ParticleSystem")).startColor = blockColor
			end
		end
	end
	function BlockHealthController:VisualizeBlockBreak(blockPos, blockId)
		-- Get or create health bar
		local _blockHealthBars = self.blockHealthBars
		local _blockPos = blockPos
		local entry = _blockHealthBars[_blockPos]
		if not entry then
			entry = self:AddHealthBar(blockPos)
		end
		-- Play destruction vfx
		local effect = EffectsManager:SpawnBundleEffect(BundleGroupNames.Blocks, Bundle_Blocks.VFX, Bundle_Blocks_VFX.OnDeath, blockPos, Vector3.zero)
		if effect then
			local blockColor = WorldAPI:GetMainWorld():GetBlockAverageColor(blockId)
			if not blockColor then
				return nil
			end
			(effect.transform:GetChild(0):GetComponent("ParticleSystem")).startColor = blockColor
		end
		-- Make sure the progress bar is at 0
		local _result = entry
		if _result ~= nil then
			_result = _result.progressBar
			if _result ~= nil then
				_result:SetValue(0)
			end
		end
	end
	function BlockHealthController:GetBlockHealth(blockPos)
		local _condition = VoxelDataAPI:GetVoxelData(blockPos, "health")
		if _condition == nil then
			_condition = WorldAPI.DefaultVoxelHealth
		end
		return _condition
	end
	function BlockHealthController:AddHealthBar(blockPos)
		-- Spawn the health bar
		local _fn = EffectsManager
		local _exp = BundleGroupNames.Blocks
		local _exp_1 = Bundle_Blocks.UI
		local _exp_2 = Bundle_Blocks_UI.HealthBar
		local _blockPos = blockPos
		local _vector3 = Vector3.new(0.5, 1.5, 0.5)
		local healthBarGo = _fn:SpawnBundleEffect(_exp, _exp_1, _exp_2, _blockPos + _vector3, Vector3.zero, -1)
		if not healthBarGo then
			error("Missing health bar graphic!")
			return nil
		end
		-- Get the meta for the hit block
		local _itemMeta = WorldAPI:GetMainWorld():GetBlockAt(blockPos)
		if _itemMeta ~= nil then
			_itemMeta = _itemMeta.itemMeta
		end
		local itemMeta = _itemMeta
		-- Create health bar entry
		local _result = itemMeta
		if _result ~= nil then
			_result = _result.block
			if _result ~= nil then
				_result = _result.health
			end
		end
		local _condition = _result
		if _condition == nil then
			_condition = WorldAPI.DefaultVoxelHealth
		end
		local maxHealth = _condition
		local healthBarEntry = {
			gameObject = healthBarGo,
			lastHitTime = Time.time,
			progressBar = ProgressBarGraphics.new(healthBarGo.transform:GetChild(0), {
				initialPercentDelta = self:GetBlockHealth(blockPos) / maxHealth,
				fillColor = Theme.Green,
			}),
			maxHealth = maxHealth,
		}
		local _blockHealthBars = self.blockHealthBars
		local _blockPos_1 = blockPos
		local _healthBarEntry = healthBarEntry
		_blockHealthBars[_blockPos_1] = _healthBarEntry
		return healthBarEntry
	end
	function BlockHealthController:RemoveHealthBar(blockPos)
		local _blockHealthBars = self.blockHealthBars
		local _blockPos = blockPos
		local entry = _blockHealthBars[_blockPos]
		if entry then
			self:DeleteHealthBar(entry, blockPos)
		end
	end
	function BlockHealthController:DeleteHealthBar(entry, blockPos)
		local _blockHealthBars = self.blockHealthBars
		local _blockPos = blockPos
		_blockHealthBars[_blockPos] = nil
		entry.progressBar:OnDelete()
	end
end
-- (Flamework) BlockHealthController metadata
Reflect.defineMetadata(BlockHealthController, "identifier", "Bundles/Client/Controllers/Global/BlockInteractions/BlockHealthController@BlockHealthController")
Reflect.defineMetadata(BlockHealthController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Inventory/InventoryController@InventoryController", "Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController", "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController" })
Reflect.defineMetadata(BlockHealthController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BlockHealthController, "$:flamework@Controller", Controller, { {} })
return {
	BlockHealthController = BlockHealthController,
}
-- ----------------------------------
-- ----------------------------------
