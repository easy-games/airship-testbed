-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local BlockHitDamageCalc = require("Shared/TS/Block/BlockHitDamageCalc").BlockHitDamageCalc
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Network = require("Shared/TS/Network").Network
local BeforeBlockPlacedSignal = require("Shared/TS/Signals/BeforeBlockPlacedSignal").BeforeBlockPlacedSignal
local BlockPlaceSignal = require("Shared/TS/Signals/BlockPlaceSignal").BlockPlaceSignal
local VoxelDataAPI = require("Shared/TS/VoxelWorld/VoxelData/VoxelDataAPI").VoxelDataAPI
local WorldAPI = require("Shared/TS/VoxelWorld/WorldAPI").WorldAPI
local BeforeBlockHitSignal = require("Server/TS/Services/Global/Block/Signal/BeforeBlockHitSignal").BeforeBlockHitSignal
local BlockInteractService
do
	BlockInteractService = setmetatable({}, {
		__tostring = function()
			return "BlockInteractService"
		end,
	})
	BlockInteractService.__index = BlockInteractService
	function BlockInteractService.new(...)
		local self = setmetatable({}, BlockInteractService)
		return self:constructor(...) or self
	end
	function BlockInteractService:constructor(invService, entityService, playerService)
		self.invService = invService
		self.entityService = entityService
		self.playerService = playerService
	end
	function BlockInteractService:OnStart()
		ServerSignals.CustomMoveCommand:Connect(function(event)
			if not event:is("PlaceBlock") then
				return nil
			end
			local itemType = event.value.itemType
			local pos = event.value.pos
			local clientId = event.clientId
			local world = WorldAPI:GetMainWorld()
			local itemMeta = GetItemMeta(itemType)
			local rollback = function()
				Network.ServerToClient.RevertBlockPlace.Server:FireClient(clientId, pos)
			end
			local _result = itemMeta.block
			if _result ~= nil then
				_result = _result.blockId
			end
			if not (_result ~= 0 and (_result == _result and _result)) then
				return rollback()
			end
			-- const player = Dependency<PlayerService>().GetPlayerFromClientId(clientId);
			local entity = (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):GetEntityByClientId(clientId)
			if not entity then
				return rollback()
			end
			if not (TS.instanceof(entity, CharacterEntity)) then
				return rollback()
			end
			if not entity:GetInventory():HasEnough(itemType, 1) then
				return rollback()
			end
			local beforeBlockPlaced = ServerSignals.BeforeBlockPlaced:Fire(BeforeBlockPlacedSignal.new(pos, itemType, itemMeta.block.blockId, entity))
			if beforeBlockPlaced:isCancelled() then
				return rollback()
			end
			entity:GetInventory():Decrement(itemType, 1)
			world:PlaceBlockById(pos, itemMeta.block.blockId, {
				placedByEntityId = entity.id,
			})
			ServerSignals.BlockPlace:Fire(BlockPlaceSignal.new(pos, itemType, itemMeta.block.blockId, entity))
			entity:SendItemAnimationToClients(0, 0, clientId)
		end)
		ServerSignals.CustomMoveCommand:Connect(function(event)
			if not event:is("HitBlock") then
				return nil
			end
			local clientId = event.clientId
			local pos = event.value
			local entity = self.entityService:GetEntityByClientId(clientId)
			local rollback = function() end
			if entity and TS.instanceof(entity, CharacterEntity) then
				local itemInHand = entity:GetInventory():GetHeldItem()
				local _itemMeta = itemInHand
				if _itemMeta ~= nil then
					_itemMeta = _itemMeta:GetMeta()
				end
				local itemMeta = _itemMeta
				if not itemInHand then
					return rollback()
				end
				local _result = itemMeta
				if _result ~= nil then
					_result = _result.breakBlock
				end
				if not _result then
					return rollback()
				end
				local world = WorldAPI:GetMainWorld()
				pos = VoxelDataAPI:GetParentVoxelPos(pos) or pos
				local voxel = world:GetRawVoxelDataAt(pos)
				if not (voxel ~= 0 and (voxel == voxel and voxel)) then
					return rollback()
				end
				local player = self.playerService:GetPlayerFromClientId(clientId)
				if not player then
					return rollback()
				end
				local blockId = VoxelWorld:VoxelDataToBlockId(voxel)
				-- Cancellable signal
				local damage = BlockHitDamageCalc(player, pos, itemMeta.breakBlock)
				local beforeSignal = ServerSignals.BeforeBlockHit:Fire(BeforeBlockHitSignal.new(pos, player, damage, itemInHand))
				if beforeSignal:IsCancelled() then
					return rollback()
				end
				local _condition = VoxelDataAPI:GetVoxelData(pos, "health")
				if _condition == nil then
					_condition = WorldAPI.DefaultVoxelHealth
				end
				local health = _condition
				local newHealth = math.max(health - beforeSignal.Damage, 0)
				VoxelDataAPI:SetVoxelData(pos, "health", newHealth)
				-- After signal
				ServerSignals.BlockHit:Fire({
					blockId = blockId,
					player = player,
					blockPos = pos,
				})
				print("Firing BlockHit")
				Network.ServerToClient.BlockHit.Server:FireAllClients(pos, entity.id)
				if newHealth == 0 then
					ServerSignals.BeforeBlockDestroyed:Fire({
						blockId = blockId,
						blockMeta = itemMeta,
						blockPos = pos,
					})
					world:PlaceBlockById(pos, 0, {
						placedByEntityId = entity.id,
					})
					ServerSignals.BlockDestroyed:Fire({
						blockId = blockId,
						blockMeta = itemMeta,
						blockPos = pos,
					})
					Network.ServerToClient.BlockDestroyed.Server:FireAllClients(pos, blockId)
				end
				return nil
			end
			rollback()
		end)
		Network.ClientToServer.HitBlock.Server:OnClientEvent(function(clientId, pos) end)
	end
end
-- (Flamework) BlockInteractService metadata
Reflect.defineMetadata(BlockInteractService, "identifier", "Bundles/Server/Services/Global/Block/BlockInteractService@BlockInteractService")
Reflect.defineMetadata(BlockInteractService, "flamework:parameters", { "Bundles/Server/Services/Global/Inventory/InventoryService@InventoryService", "Bundles/Server/Services/Global/Entity/EntityService@EntityService", "Bundles/Server/Services/Global/Player/PlayerService@PlayerService" })
Reflect.defineMetadata(BlockInteractService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BlockInteractService, "$:flamework@Service", Service, { {} })
return {
	BlockInteractService = BlockInteractService,
}
-- ----------------------------------
-- ----------------------------------
