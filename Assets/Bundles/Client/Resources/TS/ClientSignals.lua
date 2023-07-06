-- Compiled with unity-ts v2.1.0-75
local Signal = require("Shared/TS/Util/Signal").Signal
local ClientSignals = {
	EntitySpawn = Signal.new(),
	EntityDamage = Signal.new(),
	EntityDeath = Signal.new(),
	EntityDespawn = Signal.new(),
	PlayerJoin = Signal.new(),
	PlayerLeave = Signal.new(),
	BeforeBlockHit = Signal.new(),
	AfterBlockHit = Signal.new(),
	BeforeBlockPlaced = Signal.new(),
	BlockPlace = Signal.new(),
	CollectionManagerTagAdded = Signal.new(),
	GameObjectAddedToCollection = Signal.new(),
	PlayerChangeTeam = Signal.new(),
	MatchStart = Signal.new(),
	MatchStateChange = Signal.new(),
	WeaponSwing = Signal.new(),
	WeaponHit = Signal.new(),
	ProjectileLaunched = Signal.new(),
	ProjectileCollide = Signal.new(),
	ProximityPromptCreated = Signal.new(),
	PlayerEliminated = Signal.new(),
	SpectatorTargetChanged = Signal.new(),
	EntityPickupItem = Signal.new(),
}
return {
	ClientSignals = ClientSignals,
}
-- ----------------------------------
-- ----------------------------------
