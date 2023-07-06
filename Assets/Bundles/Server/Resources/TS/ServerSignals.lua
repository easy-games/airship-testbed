-- Compiled with unity-ts v2.1.0-75
local SyncEvent = require("Shared/rbxts_include/node_modules/@easy-games/unity-sync-event/out/init").SyncEvent
local BeforeEntitySpawnServerEvent = require("Server/TS/Signals/BeforeEntitySpawnServerEvent").BeforeEntitySpawnServerEvent
local MapLoadEvent = require("Server/TS/Signals/MapLoadEvent").MapLoadEvent
local MatchStartServerEvent = require("Server/TS/Signals/MatchStartServerEvent").MatchStartServerEvent
local PlayerJoinServerEvent = require("Server/TS/Signals/PlayerJoinServerEvent").PlayerJoinServerEvent
local PlayerLeaveServerEvent = require("Server/TS/Signals/PlayerLeaveServerEvent").PlayerLeaveServerEvent
local Signal = require("Shared/TS/Util/Signal").Signal
local ServerSignals = {
	PlayerJoin = SyncEvent.new(PlayerJoinServerEvent),
	PlayerLeave = SyncEvent.new(PlayerLeaveServerEvent),
	MatchStart = SyncEvent.new(MatchStartServerEvent),
	MatchStateChange = Signal.new(),
	MatchEnded = Signal.new(),
	EntityDamage = Signal.new(),
	EntityDeath = Signal.new(),
	EntityDespawn = Signal.new(),
	MapLoad = SyncEvent.new(MapLoadEvent),
	BeforeBlockPlaced = Signal.new(),
	BlockPlace = Signal.new(),
	BeforeBlockHit = Signal.new(),
	BlockHit = Signal.new(),
	BeforeBlockDestroyed = Signal.new(),
	BlockDestroyed = Signal.new(),
	BeforeEntitySpawn = SyncEvent.new(BeforeEntitySpawnServerEvent),
	EntitySpawn = Signal.new(),
	BeforeEntityDropItem = Signal.new(),
	EntityDropItem = Signal.new(),
	GameObjectAddedToCollection = Signal.new(),
	CollectionManagerTagAdded = Signal.new(),
	NetGameObjectReplicating = Signal.new(),
	NetGameObjectDespawning = Signal.new(),
	PlayerChangeTeam = Signal.new(),
	BedDestroyed = Signal.new(),
	TeamUpgradePurchase = Signal.new(),
	WeaponSwing = Signal.new(),
	WeaponHit = Signal.new(),
	ProjectileFired = Signal.new(),
	ProjectileHit = Signal.new(),
	ShopPurchase = Signal.new(),
	PlayerEliminated = Signal.new(),
	CustomMoveCommand = Signal.new(),
	EntityPickupItem = Signal.new(),
	GeneratorItemPickedUp = Signal.new(),
}
return {
	ServerSignals = ServerSignals,
}
-- ----------------------------------
-- ----------------------------------
