-- Compiled with unity-ts v2.1.0-75
local RemoteEvent = require("Shared/TS/Network/RemoteEvent").RemoteEvent
local RemoteFunction = require("Shared/TS/Network/RemoteFunction").RemoteFunction
local Network = {
	ClientToServer = {
		Ready = RemoteEvent.new(),
		SetHeldSlot = RemoteEvent.new(),
		PlaceBlock = RemoteEvent.new(),
		HitBlock = RemoteEvent.new(),
		LaunchProjectile = RemoteEvent.new(),
		SwordAttack = RemoteEvent.new(),
		DropItemInHand = RemoteEvent.new(),
		PickupGroundItem = RemoteEvent.new(),
		Inventory = {
			SwapSlots = RemoteEvent.new(),
			QuickMoveSlot = RemoteEvent.new(),
			CheckOutOfSync = RemoteEvent.new(),
		},
		SendChatMessage = RemoteEvent.new(),
		PickupGenerator = RemoteEvent.new(),
		TeamUpgrade = {
			UpgradeRequest = RemoteFunction.new(),
		},
		Shop = {
			PurchaseRequest = RemoteFunction.new(),
		},
		SetHeldItemState = RemoteEvent.new(),
		TEST_LATENCY = RemoteFunction.new(),
	},
	ServerToClient = {
		UpdateInventory = RemoteEvent.new(),
		SetInventorySlot = RemoteEvent.new(),
		RevertBlockPlace = RemoteEvent.new(),
		UpdateInventorySlot = RemoteEvent.new(),
		SetHeldInventorySlot = RemoteEvent.new(),
		SpawnEntities = RemoteEvent.new(),
		DespawnEntity = RemoteEvent.new(),
		BlockHit = RemoteEvent.new(),
		BlockDestroyed = RemoteEvent.new(),
		ProjectileSpawn = RemoteEvent.new(),
		EntityDamage = RemoteEvent.new(),
		ProjectileHit = RemoteEvent.new(),
		Entity = {
			SetHealth = RemoteEvent.new(),
		},
		EntityDeath = RemoteEvent.new(),
		AddGroundItem = RemoteEvent.new(),
		CharacterModelChanged = RemoteEvent.new(),
		ChatMessage = RemoteEvent.new(),
		SetAccessory = RemoteEvent.new(),
		RemoveAccessory = RemoteEvent.new(),
		AddPlayer = RemoteEvent.new(),
		RemovePlayer = RemoteEvent.new(),
		AllPlayers = RemoteEvent.new(),
		PlayEntityItemAnimation = RemoteEvent.new(),
		GeneratorCreated = RemoteEvent.new(),
		GeneratorLooted = RemoteEvent.new(),
		GeneratorSpawnRateChanged = RemoteEvent.new(),
		GeneratorSnapshot = RemoteEvent.new(),
		NetGameObjectReplicating = RemoteEvent.new(),
		CollectionManagerState = RemoteEvent.new(),
		AddTeams = RemoteEvent.new(),
		AddPlayerToTeam = RemoteEvent.new(),
		RemovePlayerFromTeam = RemoteEvent.new(),
		RemoveTeams = RemoteEvent.new(),
		MatchStarted = RemoteEvent.new(),
		MatchStateChange = RemoteEvent.new(),
		MatchEnded = RemoteEvent.new(),
		TeamUpgrade = {
			UpgradeSnapshot = RemoteEvent.new(),
			UpgradeProcessed = RemoteEvent.new(),
		},
		SetVoxelData = RemoteEvent.new(),
		PlayerEliminated = RemoteEvent.new(),
		MapLoaded = RemoteEvent.new(),
		DenyRegionCreated = RemoteEvent.new(),
		DenyRegionSnapshot = RemoteEvent.new(),
		HeldItemStateChanged = RemoteEvent.new(),
		BlockPlace = RemoteEvent.new(),
		EntityPickedUpGroundItem = RemoteEvent.new(),
		GeneratorItemSpawn = RemoteEvent.new(),
		DebugProjectileHit = RemoteEvent.new(),
	},
}
local countClientToServer = 0
local countServerToClient = 0
for _element, _element_1 in pairs(Network.ClientToServer) do
	local _ = { _element, _element_1 }
	countClientToServer += 1
end
for _element, _element_1 in pairs(Network.ServerToClient) do
	local _ = { _element, _element_1 }
	countServerToClient += 1
end
print("NETWORK_COUNT: ClientToServer: " .. (tostring(countClientToServer) .. (" | ServerToClient: " .. tostring(countServerToClient))))
return {
	Network = Network,
}
-- ----------------------------------
-- ----------------------------------
