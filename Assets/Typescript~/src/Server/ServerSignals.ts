import { SyncEvent } from "@easy-games/unity-sync-event";
import { BeforeBlockHitSignal } from "Imports/Core/Client/Controllers/BlockInteractions/Signal/BeforeBlockHitSignal";
import { ProjectileCollideServerSignal } from "Imports/Core/Server/Services/Damage/Projectile/ProjectileCollideServerSignal";
import { BeforeEntityDropItemSignal } from "Imports/Core/Server/Signals/BeforeEntityDropItemSignal";
import { BeforeEntitySpawnServerEvent } from "Imports/Core/Server/Signals/BeforeEntitySpawnServerEvent";
import { EntityDamageServerSignal } from "Imports/Core/Server/Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "Imports/Core/Server/Signals/EntityDeathServerSignal";
import { EntityDropItemSignal } from "Imports/Core/Server/Signals/EntityDropItemSignal";
import { EntitySpawnEvent } from "Imports/Core/Server/Signals/EntitySpawnServerEvent";
import { MoveCommandDataEvent } from "Imports/Core/Server/Signals/MoveCommandDataEvent";
import { Entity } from "Imports/Core/Shared/Entity/Entity";
import { GroundItem } from "Imports/Core/Shared/GroundItem/GroundItem";
import { ItemMeta } from "Imports/Core/Shared/Item/ItemMeta";
import { ItemType } from "Imports/Core/Shared/Item/ItemType";
import { ShopElement } from "Imports/Core/Shared/ItemShop/ItemShopMeta";
import { Player } from "Imports/Core/Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Imports/Core/Shared/Signals/BeforeBlockPlacedSignal";
import { BlockPlaceSignal } from "Imports/Core/Shared/Signals/BlockPlaceSignal";
import { Team } from "Imports/Core/Shared/Team/Team";
import { ChangeTeamSignal } from "Imports/Core/Shared/Team/TeamJoinSignal";
import { Signal } from "Imports/Core/Shared/Util/Signal";
import { MatchState } from "./Match/MatchState";
import { MapLoadEvent } from "./Signals/MapLoadEvent";
import { MatchStartServerEvent } from "./Signals/MatchStartServerEvent";
import { PlayerJoinServerEvent } from "./Signals/PlayerJoinServerEvent";
import { PlayerLeaveServerEvent } from "./Signals/PlayerLeaveServerEvent";
import { TeamUpgradeType } from "./TeamUpgrade/TeamUpgradeType";

export type BlockHitSignal = { blockId: number; blockPos: Vector3; readonly player: Player };

export const ServerSignals = {
	PlayerJoin: new Signal<PlayerJoinServerEvent>(),
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
	BeforeBlockDestroyed: new Signal<{ blockMeta: ItemMeta; blockPos: Vector3; blockId: number; entity?: Entity }>(),
	/** Fired when a block is destroyed. */
	BlockDestroyed: new Signal<{ blockMeta: ItemMeta; blockPos: Vector3; blockId: number }>(),
	BeforeEntitySpawn: new SyncEvent(BeforeEntitySpawnServerEvent),
	EntitySpawn: new Signal<EntitySpawnEvent>(),
	BeforeEntityDropItem: new Signal<BeforeEntityDropItemSignal>(),
	EntityDropItem: new Signal<EntityDropItemSignal>(),
	/** Fired when a `GameObject` is added to a collection on the _server_. */
	GameObjectAddedToCollection: new Signal<{ go: GameObject; tag: string }>(),
	/** Fired when a tag is added to a `GameObject` on the _client_. */
	CollectionManagerTagAdded: new Signal<{ go: GameObject; tag: string }>(),
	/** Fired when a **tagged** `GameObject` is being replicated. */
	NetGameObjectReplicating: new Signal<{ nob: number; tag: string }>(),
	/** Fired when a **tagged** `GameObject` is despawning. */
	NetGameObjectDespawning: new Signal<{ nob: number; tag: string }>(),
	PlayerChangeTeam: new Signal<ChangeTeamSignal>(),
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
	ShopPurchase: new Signal<{ player: Player; shopItem: ShopElement }>(),
	/** Fired when a player is eliminated. */
	PlayerEliminated: new Signal<{ player: Player }>(),
	CustomMoveCommand: new Signal<MoveCommandDataEvent>(),
	EntityPickupItem: new Signal<{ entity: Entity; groundItem: GroundItem }>(),
};
