-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ClientSignals = require("Client/TS/ClientSignals").ClientSignals
local Game = require("Shared/TS/Game").Game
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local MathUtil = require("Shared/TS/Util/MathUtil").MathUtil
local OnUpdate = require("Shared/TS/Util/Timer").OnUpdate
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local CameraReferences = require("Client/TS/Controllers/Global/Camera/CameraReferences").CameraReferences
local BlockSelectController
do
	BlockSelectController = setmetatable({}, {
		__tostring = function()
			return "BlockSelectController"
		end,
	})
	BlockSelectController.__index = BlockSelectController
	function BlockSelectController.new(...)
		local self = setmetatable({}, BlockSelectController)
		return self:constructor(...) or self
	end
	function BlockSelectController:constructor(entityController)
		self.entityController = entityController
		self.IsVoidPlacement = false
		self.enabledCount = 0
		self.lastVoidPlaceTime = 0
	end
	function BlockSelectController:OnStart()
		local highlightPrefab = AssetBridge:LoadAsset("Client/Resources/Assets/BlockSelect/BlockSelectHighlight.prefab")
		if not (highlightPrefab ~= 0 and (highlightPrefab == highlightPrefab and (highlightPrefab ~= "" and highlightPrefab))) then
			print("Failed to find highlight prefab.")
			return nil
		end
		self.highlightGO = GameObjectBridge:Instantiate(highlightPrefab)
		self.highlightGO.layer = 2
		local voidPlanePrefab = AssetBridge:LoadAsset("Client/Resources/Prefabs/VoidPlane.prefab")
		self.voidPlane = GameObjectBridge:Instantiate(voidPlanePrefab)
		self.voidPlane.name = "VoidPlane"
		self.voidPlane.transform.localScale = Vector3.new(50, 0.99, 50)
		self.voidPlane.layer = 7
		-- If our local player dies then this should be disabled
		ClientSignals.EntityDeath:Connect(function(event)
			if event.entity:IsLocalCharacter() then
				self:DisableAll()
			end
		end)
		OnUpdate:Connect(function(dt)
			if self.enabledCount <= 0 then
				return nil
			end
			self:CalcSelectedBlock()
			if self.IsVoidPlacement then
				if self.PlaceBlockPosition and self.highlightGO then
					local _placeBlockPosition = self.PlaceBlockPosition
					local _vector3 = Vector3.new(0.5, 0.5, 0.5)
					self.highlightGO.transform.position = _placeBlockPosition + _vector3
					self.highlightGO:SetActive(true)
					return nil
				end
			end
			if self.HighlightBlockPosition and self.highlightGO then
				local _highlightBlockPosition = self.HighlightBlockPosition
				local _vector3 = Vector3.new(0.5, 0.5, 0.5)
				self.highlightGO.transform.position = _highlightBlockPosition + _vector3
				self.highlightGO:SetActive(true)
				return nil
			end
			local _result = self.highlightGO
			if _result ~= nil then
				_result:SetActive(false)
			end
		end)
	end
	function BlockSelectController:CalcSelectedBlock()
		local player = Game.LocalPlayer
		local _result = player
		if _result ~= nil then
			_result = _result.Character
		end
		if not _result then
			self.SelectedBlockPosition = nil
			self.PlaceBlockPosition = nil
			return nil
		end
		local characterPos = player.Character.gameObject.transform.position
		if os.clock() - self.lastVoidPlaceTime < 0.3 then
			local voidSuccess = self:TryVoidSelect(characterPos)
			if voidSuccess then
				return nil
			end
		end
		local mouseSuccess = self:TryMouseSelect(characterPos)
		if mouseSuccess then
			return nil
		end
		local voidSuccess = self:TryVoidSelect(characterPos)
		if voidSuccess then
			return nil
		end
		-- couldn't find a block placement
		self:ResetVariables()
	end
	function BlockSelectController:TryMouseSelect(characterPos)
		local result = CameraReferences:Instance():RaycastVoxelFromCamera(20)
		if result.Hit then
			local _hitPosition = result.HitPosition
			local _characterPos = characterPos
			if (_hitPosition - _characterPos).magnitude <= 8 then
				local _fn = MathUtil
				local _hitPosition_1 = result.HitPosition
				local _arg0 = result.HitNormal * 0.1
				self.SelectedBlockPosition = _fn:FloorVec(_hitPosition_1 - _arg0)
				local _fn_1 = MathUtil
				local _hitPosition_2 = result.HitPosition
				local _arg0_1 = result.HitNormal * 0.1
				self.HighlightBlockPosition = _fn_1:FloorVec(_hitPosition_2 - _arg0_1)
				local parentBlockPos = VoxelDataAPI:GetParentVoxelPos(self.HighlightBlockPosition)
				if parentBlockPos then
					self.SelectedBlockPosition = parentBlockPos
				end
				local _fn_2 = MathUtil
				local _hitPosition_3 = result.HitPosition
				local _arg0_2 = result.HitNormal * 0.1
				self.PlaceBlockPosition = _fn_2:FloorVec(_hitPosition_3 + _arg0_2)
				self.IsVoidPlacement = false
				return true
			end
		end
		return false
	end
	function BlockSelectController:TryVoidSelect(characterPos)
		local blockBeneathPos
		local _characterPos = characterPos
		local _vector3 = Vector3.new(0, 0.2, 0)
		local characterPosSnapped = _characterPos + _vector3
		do
			local i = 1
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					i += 1
				else
					_shouldIncrement = true
				end
				if not (i <= 3) then
					break
				end
				local _characterPosSnapped = characterPosSnapped
				local _vector3_1 = Vector3.new(0, i, 0)
				local pos = _characterPosSnapped - _vector3_1
				local voxel = WorldAPI:GetMainWorld():GetRawVoxelDataAt(pos)
				if voxel ~= 0 and (voxel == voxel and voxel) then
					blockBeneathPos = pos
					break
				end
			end
		end
		if blockBeneathPos then
			if self.voidPlane then
				self.voidPlane.transform.position = blockBeneathPos
			end
			local voidPlaneOnlyMask = 128
			local voidHit, voidPoint, voidNormal, voidCollider = CameraReferences:Instance():RaycastPhysicsFromCamera(40, voidPlaneOnlyMask)
			local _condition = voidHit
			if _condition then
				local _exp = voidCollider.transform
				local _result = self.voidPlane
				if _result ~= nil then
					_result = _result.transform
				end
				_condition = _exp == _result
			end
			if _condition then
				local destPos = Vector3.new(voidPoint.x, blockBeneathPos.y, voidPoint.z)
				local blockPos = blockBeneathPos
				local emptyBlockPos
				do
					local i = 0
					local _shouldIncrement = false
					while true do
						if _shouldIncrement then
							i += 1
						else
							_shouldIncrement = true
						end
						if not (i < 10) then
							break
						end
						local _destPos = destPos
						local _blockPos = blockPos
						local direction = (_destPos - _blockPos).normalized * 0.8
						local _blockPos_1 = blockPos
						local _direction = direction
						blockPos = _blockPos_1 + _direction
						local rounded = Vector3.new(math.floor(blockPos.x), blockBeneathPos.y, math.floor(blockPos.z))
						local checkVoxel = WorldAPI:GetMainWorld():GetRawVoxelDataAt(rounded)
						if checkVoxel == 0 then
							emptyBlockPos = rounded
							break
						end
					end
				end
				if emptyBlockPos ~= nil then
					self.SelectedBlockPosition = nil
					self.PlaceBlockPosition = Vector3.new(emptyBlockPos.x, math.round(emptyBlockPos.y), emptyBlockPos.z)
					self.HighlightBlockPosition = self.PlaceBlockPosition
					self.IsVoidPlacement = true
					return true
				end
			end
		end
		return false
	end
	function BlockSelectController:ResetVariables()
		self.SelectedBlockPosition = nil
		self.HighlightBlockPosition = nil
		self.PlaceBlockPosition = nil
		self.IsVoidPlacement = false
	end
	function BlockSelectController:Enable()
		self.enabledCount += 1
	end
	function BlockSelectController:DisableAll()
		self.enabledCount = 1
		self:Disable()
	end
	function BlockSelectController:Disable()
		self.enabledCount = math.max(0, self.enabledCount - 1)
		if self.enabledCount <= 0 and self.highlightGO then
			local _result = self.highlightGO
			if _result ~= nil then
				_result:SetActive(false)
			end
		end
	end
	function BlockSelectController:PlacedVoidBridgeBlock()
		self.lastVoidPlaceTime = os.clock()
	end
end
-- (Flamework) BlockSelectController metadata
Reflect.defineMetadata(BlockSelectController, "identifier", "Bundles/Client/Controllers/Global/BlockInteractions/BlockSelectController@BlockSelectController")
Reflect.defineMetadata(BlockSelectController, "flamework:parameters", { "Bundles/Client/Controllers/Global/Entity/EntityController@EntityController" })
Reflect.defineMetadata(BlockSelectController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BlockSelectController, "$:flamework@Controller", Controller, { {} })
return {
	BlockSelectController = BlockSelectController,
}
-- ----------------------------------
-- ----------------------------------
