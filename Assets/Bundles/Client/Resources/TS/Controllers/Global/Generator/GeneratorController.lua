-- Compiled with unity-ts v2.1.0-75
local Reflect = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Reflect
local Controller = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Controller
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local GameObjectBridge = require("Shared/TS/GameObjectBridge").GameObjectBridge
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Network = require("Shared/TS/Network").Network
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
-- * Generator item spawn offset. Items spawn _above_ generators and fall to the ground.
local GENERATOR_ITEM_SPAWN_OFFSET = Vector3.new(0, 2.25, 0)
-- * Generator label offset. Labels are _above_ the item spawn location.
local GENERATOR_LABEL_OFFSET = Vector3.new(0, 3, 0)
local GeneratorController
do
	GeneratorController = setmetatable({}, {
		__tostring = function()
			return "GeneratorController"
		end,
	})
	GeneratorController.__index = GeneratorController
	function GeneratorController.new(...)
		local self = setmetatable({}, GeneratorController)
		return self:constructor(...) or self
	end
	function GeneratorController:constructor()
		self.generatorMap = {}
		self.spawnResetGenerators = {}
		self.stackedGenerators = {}
		self.generatorTextLabelMap = {}
		-- Set up generator item collision rules.
		Physics:IgnoreLayerCollision(3, 12)
		Physics:IgnoreLayerCollision(12, 12)
		-- NOTE: This is temp. Prefab will be dynamically loaded per generator.
		self.generatorItemPrefab = AssetBridge:LoadAsset("Shared/Resources/Prefabs/GeneratorItemPlaceholder.prefab")
		-- NOTE: Placeholder label.
		self.generatorLabelPrefab = AssetBridge:LoadAsset("Client/Resources/Prefabs/GeneratorLabel.prefab")
	end
	function GeneratorController:OnStart()
		-- Listen for generator snapshot. Should only be received on late joins.
		Network.ServerToClient.GeneratorSnapshot.Client:OnServerEvent(function(generatorStateDtos)
			local _generatorStateDtos = generatorStateDtos
			local _arg0 = function(dto)
				-- Skip generator if it already exists on client.
				local _generatorMap = self.generatorMap
				local _id = dto.id
				if _generatorMap[_id] ~= nil then
					return nil
				end
				-- Otherwise, create.
				local timeUntilNextSpawn = dto.nextSpawnTime - TimeUtil:GetServerTime()
				if timeUntilNextSpawn > 0 then
					dto.spawnRate = timeUntilNextSpawn
					local _spawnResetGenerators = self.spawnResetGenerators
					local _id_1 = dto.id
					_spawnResetGenerators[_id_1] = true
				end
				local _generatorMap_1 = self.generatorMap
				local _id_1 = dto.id
				local _dto = dto
				_generatorMap_1[_id_1] = _dto
				if dto.label then
					self:CreateGeneratorLabel(dto)
				end
			end
			for _k, _v in _generatorStateDtos do
				_arg0(_v, _k - 1, _generatorStateDtos)
			end
		end)
		-- Listen for generator creation.
		Network.ServerToClient.GeneratorCreated.Client:OnServerEvent(function(dto)
			-- Adjust initial spawn time to sync with server.
			local timeUntilNextSpawn = dto.nextSpawnTime - TimeUtil:GetServerTime()
			if timeUntilNextSpawn > 0 then
				dto.spawnRate = timeUntilNextSpawn
				local _spawnResetGenerators = self.spawnResetGenerators
				local _id = dto.id
				_spawnResetGenerators[_id] = true
			end
			local _generatorMap = self.generatorMap
			local _id = dto.id
			local _dto = dto
			_generatorMap[_id] = _dto
			-- Set up generator label if applicable.
			if dto.label then
				self:CreateGeneratorLabel(dto)
			end
		end)
		-- Listen for generator looted.
		Network.ServerToClient.GeneratorLooted.Client:OnServerEvent(function(generatorId)
			local _generatorMap = self.generatorMap
			local _generatorId = generatorId
			local dto = _generatorMap[_generatorId]
			if not dto then
				return nil
			end
			-- Update generator label if applicable.
			if dto.label then
				self:UpdateGeneratorTextLabel(dto.id)
			end
			-- Delete generator root GameObject.
			local _stackedGenerators = self.stackedGenerators
			local _id = dto.id
			local rootGO = _stackedGenerators[_id]
			if rootGO then
				local _stackedGenerators_1 = self.stackedGenerators
				local _id_1 = dto.id
				_stackedGenerators_1[_id_1] = nil
				GameObjectBridge:Destroy(rootGO)
			end
		end)
	end
	function GeneratorController:CreateGeneratorLabel(dto)
		local labelPosition = dto.pos + GENERATOR_LABEL_OFFSET
		local generatorLabel = GameObjectBridge:InstantiateAt(self.generatorLabelPrefab, labelPosition, Quaternion.identity)
		-- Set initial label text.
		local generatorTextTransform = generatorLabel.transform:FindChild("GeneratorText")
		local generatorTextComponent = generatorTextTransform:GetComponent("TextMeshProUGUI")
		local itemMeta = GetItemMeta(dto.item)
		generatorTextComponent.text = itemMeta.displayName .. " Generator"
		local _generatorTextLabelMap = self.generatorTextLabelMap
		local _id = dto.id
		_generatorTextLabelMap[_id] = generatorTextComponent
	end
	function GeneratorController:UpdateGeneratorTextLabel(generatorId)
		local _generatorMap = self.generatorMap
		local _generatorId = generatorId
		local dto = _generatorMap[_generatorId]
		if not dto then
			return nil
		end
		local _generatorTextLabelMap = self.generatorTextLabelMap
		local _generatorId_1 = generatorId
		local generatorTextComponent = _generatorTextLabelMap[_generatorId_1]
		if not generatorTextComponent then
			return nil
		end
		local itemMeta = GetItemMeta(dto.item)
		generatorTextComponent.text = itemMeta.displayName .. " Generator"
	end
	function GeneratorController:GetAllGenerators()
		return ObjectUtil.values(self.generatorMap)
	end
end
-- (Flamework) GeneratorController metadata
Reflect.defineMetadata(GeneratorController, "identifier", "Bundles/Client/Controllers/Global/Generator/GeneratorController@GeneratorController")
Reflect.defineMetadata(GeneratorController, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(GeneratorController, "$:flamework@Controller", Controller, { {} })
return {
	GeneratorController = GeneratorController,
}
-- ----------------------------------
-- ----------------------------------
