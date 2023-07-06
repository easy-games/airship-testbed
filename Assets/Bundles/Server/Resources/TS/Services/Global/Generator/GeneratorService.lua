-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ObjectUtil = require("Shared/rbxts_include/node_modules/@easy-games/unity-object-utils/init")
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local Network = require("Shared/TS/Network").Network
local Task = require("Shared/TS/Util/Task").Task
local TimeUtil = require("Shared/TS/Util/TimeUtil").TimeUtil
local SetInterval = require("Shared/TS/Util/Timer").SetInterval
-- * Default generator stack size. We _always_ start at 0.
local DEFAULT_GENERATOR_STACK_SIZE = 0
-- * Snapshot send delay after user connects.
local SNAPSHOT_SEND_DELAY = 1
-- * Generator item spawn offset. Items spawn _above_ generators and fall to the ground.
local GENERATOR_ITEM_SPAWN_OFFSET = Vector3.new(0, 2.8, 0)
local GeneratorService
do
	GeneratorService = setmetatable({}, {
		__tostring = function()
			return "GeneratorService"
		end,
	})
	GeneratorService.__index = GeneratorService
	function GeneratorService.new(...)
		local self = setmetatable({}, GeneratorService)
		return self:constructor(...) or self
	end
	function GeneratorService:constructor()
		self.generatorIdCounter = 0
		self.generatorMap = {}
		self.stackMap = {}
	end
	function GeneratorService:OnStart()
		-- Split resources
		ServerSignals.EntityPickupItem:Connect(function(event)
			local groundObjectAttributes = event.groundItemGO:GetComponent("EasyAttributes")
			local generatorId = groundObjectAttributes:GetString("generatorId")
			if not (generatorId ~= "" and generatorId) then
				return nil
			end
			local genState = self:GetGeneratorById(generatorId)
			if not genState then
				return nil
			end
			local pickupPlayer = event.entity.player
			local _condition = pickupPlayer
			if _condition then
				local _result = genState
				if _result ~= nil then
					_result = _result.split
				end
				_condition = _result
			end
			if _condition then
				local splitTeam = pickupPlayer:GetTeam()
				if not splitTeam then
					return nil
				end
				local splitRange = genState.split.range
				local _exp = splitTeam:GetPlayers()
				local _arg0 = function(player)
					local playerEntity = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(player.clientId)
					if not playerEntity then
						return nil
					end
					if not (TS.instanceof(playerEntity, CharacterEntity)) then
						return nil
					end
					local _position = playerEntity.gameObject.transform.position
					local _pos = genState.dto.pos
					local distanceFromGen = (_position - _pos).magnitude
					if player ~= pickupPlayer and distanceFromGen <= splitRange then
						local inv = playerEntity:GetInventory()
						inv:AddItem(ItemStack.new(event.itemStack:GetItemType(), event.itemStack:GetAmount()))
					end
				end
				for _v in _exp do
					_arg0(_v, _v, _exp)
				end
			end
			-- Generator cleanup.
			genState.stackSize = 0
			self.stackMap[generatorId] = nil
		end)
		-- Handle late joiners.
		ServerSignals.PlayerJoin:connect(function(event)
			Task:Delay(SNAPSHOT_SEND_DELAY, function()
				local _fn = Network.ServerToClient.GeneratorSnapshot.Server
				local _exp = event.player.clientId
				local _exp_1 = self:GetAllGenerators()
				local _arg0 = function(state)
					return state.dto
				end
				-- ▼ ReadonlyArray.map ▼
				local _newValue = table.create(#_exp_1)
				for _k, _v in _exp_1 do
					_newValue[_k] = _arg0(_v, _k - 1, _exp_1)
				end
				-- ▲ ReadonlyArray.map ▲
				_fn:FireClient(_exp, _newValue)
			end)
		end)
	end
	function GeneratorService:CreateGenerator(pos, config)
		local generatorId = self:GenerateGeneratorId()
		local state = {
			stackLimit = config.stackLimit,
			stackSize = 0,
			originalSpawnRate = config.spawnRate,
			dto = {
				pos = pos,
				id = generatorId,
				item = config.item,
				spawnRate = config.spawnRate,
				nextSpawnTime = TimeUtil:GetServerTime() + config.spawnRate,
				label = config.label,
			},
		}
		state.ticker = self:TickGenerator(state)
		-- Store generator in map, notify client of generator creation.
		local _generatorMap = self.generatorMap
		local _id = state.dto.id
		_generatorMap[_id] = state
		Network.ServerToClient.GeneratorCreated.Server:FireAllClients(state.dto)
		-- Return id.
		return generatorId
	end
	function GeneratorService:GetGeneratorById(generatorId)
		local _generatorMap = self.generatorMap
		local _generatorId = generatorId
		return _generatorMap[_generatorId]
	end
	function GeneratorService:GenerateGeneratorId()
		local generatorId = "generator_" .. tostring(self.generatorIdCounter)
		self.generatorIdCounter += 1
		return generatorId
	end
	function GeneratorService:TickGenerator(generatorState)
		return SetInterval(generatorState.dto.spawnRate, function()
			-- Always update next spawn time.
			generatorState.dto.nextSpawnTime = TimeUtil:GetServerTime() + generatorState.dto.spawnRate
			-- Only increase stack size if generator has _not_ reached capacity.
			if generatorState.stackSize < generatorState.stackLimit then
				generatorState.stackSize += 1
				local _stackMap = self.stackMap
				local _id = generatorState.dto.id
				local existingStack = _stackMap[_id]
				if existingStack then
					existingStack:SetAmount(generatorState.stackSize)
				else
					local newGeneratorStack = ItemStack.new(generatorState.dto.item, 1)
					local _stackMap_1 = self.stackMap
					local _id_1 = generatorState.dto.id
					_stackMap_1[_id_1] = newGeneratorStack;
					(Flamework.resolveDependency("Bundles/Server/Services/Global/GroundItem/GroundItemService@GroundItemService")):SpawnGroundItem(newGeneratorStack, generatorState.dto.pos + GENERATOR_ITEM_SPAWN_OFFSET, nil, generatorState.dto.id)
				end
			end
		end)
	end
	function GeneratorService:UpdateGeneratorSpawnRateById(generatorId, newSpawnRate)
		local _generatorMap = self.generatorMap
		local _generatorId = generatorId
		local state = _generatorMap[_generatorId]
		if not state then
			return nil
		end
		-- Stop ticker and reconstruct dto with updated state.
		local _result = state.ticker
		if _result ~= nil then
			_result()
		end
		state.dto.spawnRate = newSpawnRate
		state.dto.nextSpawnTime = TimeUtil:GetServerTime() + newSpawnRate
		state.ticker = self:TickGenerator(state)
		-- Inform clients of _all_ server-sided generator spawn rate changes.
		Network.ServerToClient.GeneratorSpawnRateChanged.Server:FireAllClients(state.dto.id, newSpawnRate)
	end
	function GeneratorService:GetAllGenerators()
		return ObjectUtil.values(self.generatorMap)
	end
end
-- (Flamework) GeneratorService metadata
Reflect.defineMetadata(GeneratorService, "identifier", "Bundles/Server/Services/Global/Generator/GeneratorService@GeneratorService")
Reflect.defineMetadata(GeneratorService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(GeneratorService, "$:flamework@Service", Service, { {} })
return {
	GeneratorService = GeneratorService,
}
-- ----------------------------------
-- ----------------------------------
