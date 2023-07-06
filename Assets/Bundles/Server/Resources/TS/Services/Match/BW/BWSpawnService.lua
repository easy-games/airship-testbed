-- Compiled with unity-ts v2.1.0-75
local TS = require("Shared/include/RuntimeLib")
local _flamework_core = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init")
local Reflect = _flamework_core.Reflect
local Flamework = _flamework_core.Flamework
local Service = require("Shared/rbxts_include/node_modules/@easy-games/flamework-core/out/init").Service
local ServerSignals = require("Server/TS/ServerSignals").ServerSignals
local CharacterEntity = require("Shared/TS/Entity/Character/CharacterEntity").CharacterEntity
local EntityPrefabType = require("Shared/TS/Entity/EntityPrefabType").EntityPrefabType
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local ItemType = require("Shared/TS/Item/ItemType").ItemType
local Task = require("Shared/TS/Util/Task").Task
-- * Spawn delay on join in seconds.
local SPAWN_DELAY_ON_JOIN = 1
-- * Spawn platform height offset.
local SPAWN_PLATFORM_HEIGHT_OFFSET = Vector3.new(0, 0, 0)
local BWSpawnService
do
	BWSpawnService = setmetatable({}, {
		__tostring = function()
			return "BWSpawnService"
		end,
	})
	BWSpawnService.__index = BWSpawnService
	function BWSpawnService.new(...)
		local self = setmetatable({}, BWSpawnService)
		return self:constructor(...) or self
	end
	function BWSpawnService:constructor(bwService, playerService, mapService, matchService)
		self.bwService = bwService
		self.playerService = playerService
		self.mapService = mapService
		self.matchService = matchService
	end
	function BWSpawnService:OnStart()
		Task:Spawn(function()
			self.loadedMap = self.mapService:WaitForMapLoaded()
			-- Spawn entity on join.
			ServerSignals.PlayerJoin:connect(function(event)
				Task:Delay(SPAWN_DELAY_ON_JOIN, function()
					return (Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):SpawnEntityForPlayer(event.player, EntityPrefabType.HUMAN)
				end)
			end)
			-- Listen for entity death, respawn if applicable.
			ServerSignals.EntityDeath:Connect(function(event)
				if not self.matchService:IsRunning() then
					return nil
				end
				if TS.instanceof(event.entity, CharacterEntity) and not self.bwService.winnerDeclared then
					Task:Delay(event.respawnTime, function()
						if event.entity.player and not self.bwService:IsPlayerEliminated(event.entity.player) then
							(Flamework.resolveDependency("Bundles/Server/Services/Global/Entity/EntityService@EntityService")):SpawnEntityForPlayer(event.entity.player, EntityPrefabType.HUMAN)
						end
					end)
				end
			end)
			-- Listen for entity spawn and give starter inventory.
			ServerSignals.EntitySpawn:Connect(function(event)
				if TS.instanceof(event.Entity, CharacterEntity) then
					self:giveStarterInventory(event.Entity)
				end
			end)
			-- Listen for match start and teleport players.
			ServerSignals.MatchStart:connect(function()
				local _exp = self.playerService:GetPlayers()
				local _arg0 = function(player)
					self:TeleportPlayerOnMatchStart(player)
				end
				for _k, _v in _exp do
					_arg0(_v, _k - 1, _exp)
				end
			end)
		end)
		ServerSignals.BeforeEntitySpawn:connect(function(event)
			if self.matchService:IsRunning() and event.player then
				local team = event.player:GetTeam()
				if not team then
					return nil
				end
				local teamSpawnPos = self.loadedMap:GetSpawnPositionForTeam(team)
				if not teamSpawnPos then
					return nil
				end
				local _position = teamSpawnPos.Position
				local _vector3 = Vector3.new(0, 0.2, 0)
				event.spawnPosition = _position + _vector3
			end
		end)
	end
	function BWSpawnService:TeleportPlayerOnMatchStart(player)
		-- Teleport to team spawn location.
		local team = player:GetTeam()
		if not team then
			return nil
		end
		local teamSpawnPos = self.loadedMap:GetSpawnPositionForTeam(team)
		if not teamSpawnPos then
			return nil
		end
		local _result = player.Character
		if _result ~= nil then
			_result = _result.gameObject:GetComponent("EntityDriver")
		end
		local humanoid = _result
		if humanoid then
			local _fn = humanoid
			local _position = teamSpawnPos.Position
			local _vector3 = Vector3.new(0, 0.2, 0)
			_fn:Teleport(_position + _vector3)
		end
	end
	function BWSpawnService:giveStarterInventory(entity)
		local inv = entity:GetInventory()
		inv:SetItem(0, ItemStack.new(ItemType.STONE_SWORD, 1))
		inv:SetItem(1, ItemStack.new(ItemType.STONE_PICKAXE, 1))
		-- inv.SetItem(2, new ItemStack(ItemType.WHITE_WOOL, 100));
		inv:SetItem(2, ItemStack.new(ItemType.STONE, 100))
		inv:AddItem(ItemStack.new(ItemType.WOOD_BOW, 1))
		inv:AddItem(ItemStack.new(ItemType.WOOD_ARROW, 100))
		inv:AddItem(ItemStack.new(ItemType.GRASS, 100))
		inv:AddItem(ItemStack.new(ItemType.TELEPEARL, 100))
		-- inv.SetItem(4, new ItemStack(ItemType.WOOD_BOW, 1));
		-- inv.SetItem(5, new ItemStack(ItemType.TELEPEARL, 100));
		-- inv.SetItem(6, new ItemStack(ItemType.FIREBALL, 100));
		-- inv.SetItem(7, new ItemStack(ItemType.WOOD_ARROW, 100));
		-- inv.AddItem(new ItemStack(ItemType.TALL_GRASS, 100));
	end
end
-- (Flamework) BWSpawnService metadata
Reflect.defineMetadata(BWSpawnService, "identifier", "Bundles/Server/Services/Match/BW/BWSpawnService@BWSpawnService")
Reflect.defineMetadata(BWSpawnService, "flamework:parameters", { "Bundles/Server/Services/Match/BW/BWService@BWService", "Bundles/Server/Services/Global/Player/PlayerService@PlayerService", "Bundles/Server/Services/Match/Map/MapService@MapService", "Bundles/Server/Services/Match/MatchService@MatchService" })
Reflect.defineMetadata(BWSpawnService, "flamework:implements", { "$:flamework@OnStart" })
Reflect.decorate(BWSpawnService, "$:flamework@Service", Service, { {} })
return {
	BWSpawnService = BWSpawnService,
}
-- ----------------------------------
-- ----------------------------------
