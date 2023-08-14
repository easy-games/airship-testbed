import { SyncEvent } from "@easy-games/unity-sync-event";
import { Entity } from "Shared/Entity/Entity";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import { ShopElement } from "Shared/ItemShop/ItemShopMeta";
import { Player } from "Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { BlockPlaceSignal } from "Shared/Signals/BlockPlaceSignal";
import { ChangeTeamSignal } from "Shared/Team/TeamJoinSignal";
import { Signal } from "Shared/Util/Signal";
import { BeforeBlockHitSignal } from "./Services/Block/Signal/BeforeBlockHitSignal";
import { ProjectileCollideServerSignal } from "./Services/Damage/Projectile/ProjectileCollideServerSignal";
import { BeforeEntityDropItemSignal } from "./Signals/BeforeEntityDropItemSignal";
import { BeforeEntitySpawnServerEvent } from "./Signals/BeforeEntitySpawnServerEvent";
import { EntityDamageServerSignal } from "./Signals/EntityDamageServerSignal";
import { EntityDeathServerSignal } from "./Signals/EntityDeathServerSignal";
import { EntityDropItemSignal } from "./Signals/EntityDropItemSignal";
import { EntitySpawnEvent } from "./Signals/EntitySpawnServerEvent";
import { MoveCommandDataEvent } from "./Signals/MoveCommandDataEvent";
import { PlayerJoinServerEvent } from "./Signals/PlayerJoinServerEvent";
import { PlayerLeaveServerEvent } from "./Signals/PlayerLeaveServerEvent";

export type BlockHitSignal = { blockId: number; blockPos: Vector3; readonly player: Player };

export const ServerSignals = {
	PlayerJoin: new Signal<PlayerJoinServerEvent>(),
	PlayerLeave: new SyncEvent(PlayerLeaveServerEvent),
	EntityDamage: new Signal<EntityDamageServerSignal>(),
	EntityDeath: new Signal<EntityDeathServerSignal>(),
	EntityDespawn: new Signal<Entity>(),
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
