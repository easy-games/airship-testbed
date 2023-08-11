/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { SyncEvent } from "@easy-games/unity-sync-event";
import { Player } from "./Player/Player";
import { BeforeEntitySpawnServerEvent } from "./Signals/BeforeEntitySpawnServerEvent";
import { PlayerLeaveServerEvent } from "./Signals/PlayerLeaveServerEvent";
export declare type BlockHitSignal = {
    blockId: number;
    blockPos: Vector3;
    readonly player: Player;
};
export declare const ServerSignals: {
    PlayerJoin: any;
    PlayerLeave: SyncEvent<typeof PlayerLeaveServerEvent>;
    EntityDamage: any;
    EntityDeath: any;
    EntityDespawn: any;
    BeforeBlockPlaced: any;
    BlockPlace: any;
    /** Fired **before** a block is hit. This signal is cancellable. */
    BeforeBlockHit: any;
    BlockHit: any;
    /** Fired before a block is destroyed. */
    BeforeBlockDestroyed: any;
    /** Fired when a block is destroyed. */
    BlockDestroyed: any;
    BeforeEntitySpawn: SyncEvent<typeof BeforeEntitySpawnServerEvent>;
    EntitySpawn: any;
    BeforeEntityDropItem: any;
    EntityDropItem: any;
    /** Fired when a `GameObject` is added to a collection on the _server_. */
    GameObjectAddedToCollection: any;
    /** Fired when a tag is added to a `GameObject` on the _client_. */
    CollectionManagerTagAdded: any;
    /** Fired when a **tagged** `GameObject` is being replicated. */
    NetGameObjectReplicating: any;
    /** Fired when a **tagged** `GameObject` is despawning. */
    NetGameObjectDespawning: any;
    PlayerChangeTeam: any;
    /** Fired when a melee weapon is swung. */
    WeaponSwing: any;
    /** Fired when a melee weapon hits. */
    WeaponHit: any;
    /** Fired when a projectile is fired. */
    ProjectileFired: any;
    /** Fired when projectile hits an object. */
    ProjectileHit: any;
    /** Fired when a player successfully purchases a shop item. */
    ShopPurchase: any;
    /** Fired when a player is eliminated. */
    PlayerEliminated: any;
    CustomMoveCommand: any;
    EntityPickupItem: any;
};
