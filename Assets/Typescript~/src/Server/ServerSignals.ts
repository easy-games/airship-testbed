import { SyncEvent } from "@easy-games/unity-sync-event";
import { Entity } from "./Entity/Entity";
import { ItemStack } from "./Inventory/ItemStack";
import { ItemMeta } from "./Item/ItemMeta";
import { ItemType } from "./Item/ItemType";
import { MatchState } from "./Match/MatchState";
import { Player } from "./Player/Player";
import { BeforeBlockHitSignal } from "./Services/Global/Block/Signal/BeforeBlockHitSignal";
import { ProjectileCollideServerSignal } from "./Services/Global/Damage/Projectile/ProjectileCollideServerSignal";
import { ShopItem } from "./Shop/ShopMeta";
import { BeforeBlockPlacedSignal } from "./Signals/BeforeBlockPlacedSignal";
import { BeforeEntityDropItemSignal } from "./Signals/BeforeEntityDropItemSignal";
import { BeforeEntitySpawnServerEvent } from "./Signals/BeforeEntitySpawnServerEvent";
import { BlockPlaceSignal } from "./Signals/BlockPlaceSignal";
import { EntityDamageServerSignal } from "./Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "./Signals/EntityDeathServerSignal";
import { EntityDropItemSignal } from "./Signals/EntityDropItemSignal";
import { EntitySpawnEvent } from "./Signals/EntitySpawnServerEvent";
import { MapLoadEvent } from "./Signals/MapLoadEvent";
import { MatchStartServerEvent } from "./Signals/MatchStartServerEvent";
import { MoveCommandDataEvent } from "./Signals/MoveCommandDataEvent";
import { PlayerJoinServerEvent } from "./Signals/PlayerJoinServerEvent";
import { PlayerLeaveServerEvent } from "./Signals/PlayerLeaveServerEvent";
import { Team } from "./Team/Team";
import { ChangeTeamSignal } from "./Team/TeamJoinSignal";
import { TeamUpgradeType } from "./TeamUpgrades/TeamUpgradeType";
import { CollectionTag } from "./Util/CollectionTag";
import { Signal } from "./Util/Signal";

export type BlockHitSignal = { blockId: number; blockPos: Vector3; readonly player: Player };

export const ServerSignals = {
	PlayerJoin: new SyncEvent(PlayerJoinServerEvent),
	PlayerLeave: new SyncEvent(PlayerLeaveServerEvent),
	/** Fired when match enters `MatchState.RUNNING`. */
	MatchStart: new SyncEvent(MatchStartServerEvent),
	/** Fired when match state changes. */
	MatchStateChange: new Signal<{ newState: MatchState; oldState: MatchState }>(),
	/** Fired when match enters `MatchState.POST`. */
	MatchEnded: new Signal<{ winningTeam?: Team }>(),
	EntityDamage: new Signal<EntityDamageServerSignal>(),
	EntityDeath: new Signal<EntityDeathServerSignal>(),
	EntityDespawn: new Signal<Entity>(),
	MapLoad: new SyncEvent(MapLoadEvent),
	BeforeBlockPlaced: new Signal<BeforeBlockPlacedSignal>(),
	BlockPlace: new Signal<BlockPlaceSignal>(),
	/** Fired **before** a block is hit. This signal is cancellable. */
	BeforeBlockHit: new Signal<BeforeBlockHitSignal>(),
	BlockHit: new Signal<BlockHitSignal>(),
	/** Fired before a block is destroyed. */
	BeforeBlockDestroyed: new Signal<{ blockMeta: ItemMeta; blockPos: Vector3; blockId: number }>(),
	/** Fired when a block is destroyed. */
	BlockDestroyed: new Signal<{ blockMeta: ItemMeta; blockPos: Vector3; blockId: number }>(),
	BeforeEntitySpawn: new SyncEvent(BeforeEntitySpawnServerEvent),
	EntitySpawn: new Signal<EntitySpawnEvent>(),
	BeforeEntityDropItem: new Signal<BeforeEntityDropItemSignal>(),
	EntityDropItem: new Signal<EntityDropItemSignal>(),
	/** Fired when a `GameObject` is added to a collection on the _server_. */
	GameObjectAddedToCollection: new Signal<{ go: GameObject; tag: CollectionTag }>(),
	/** Fired when a tag is added to a `GameObject` on the _client_. */
	CollectionManagerTagAdded: new Signal<{ go: GameObject; tag: CollectionTag }>(),
	/** Fired when a **tagged** `GameObject` is being replicated. */
	NetGameObjectReplicating: new Signal<{ nob: number; tag: CollectionTag }>(),
	/** Fired when a **tagged** `GameObject` is despawning. */
	NetGameObjectDespawning: new Signal<{ nob: number; tag: CollectionTag }>(),
	PlayerChangeTeam: new Signal<ChangeTeamSignal>(),
	/** Fired when a bed is destroyed. */
	BedDestroyed: new Signal<{ bedTeamId: string }>(),
	/** Fired when a team upgrade is successfully purchased. */
	TeamUpgradePurchase: new Signal<{ team: Team; upgradeType: TeamUpgradeType; tier: number }>(),
	/** Fired when a melee weapon is swung. */
	WeaponSwing: new Signal<{ weapon: ItemType; swingEntity: Entity }>(),
	/** Fired when a melee weapon hits. */
	WeaponHit: new Signal<{ weapon: ItemType; swingEntity: Entity; hitEntity: Entity; damage: number }>(),
	/** Fired when a projectile is fired. */
	ProjectileFired: new Signal<{ shooter: Entity; launcherItemType: ItemType; ammoItemType: ItemType }>(),
	/** Fired when projectile hits an object. */
	ProjectileHit: new Signal<ProjectileCollideServerSignal>(),
	/** Fired when a player successfully purchases a shop item. */
	ShopPurchase: new Signal<{ player: Player; shopItem: ShopItem }>(),
	/** Fired when a player is eliminated. */
	PlayerEliminated: new Signal<{ player: Player }>(),
	CustomMoveCommand: new Signal<MoveCommandDataEvent>(),
	EntityPickupItem: new Signal<{ entity: Entity; itemStack: ItemStack; groundItemGO: GameObject }>(),
	/** Fired when a generator item is picked up. */
	GeneratorItemPickedUp: new Signal<{ pickupEntity: Entity; generatorId: string }>(),
};
