/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { SyncEvent } from "@easy-games/unity-sync-event";
import { Entity } from "../Shared/Entity/Entity";
import { GroundItem } from "../Shared/GroundItem/GroundItem";
import { ItemMeta } from "../Shared/Item/ItemMeta";
import { ItemType } from "../Shared/Item/ItemType";
import { ShopElement } from "../Shared/ItemShop/ItemShopMeta";
import { Player } from "../Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "../Shared/Signals/BeforeBlockPlacedSignal";
import { BlockPlaceSignal } from "../Shared/Signals/BlockPlaceSignal";
import { ChangeTeamSignal } from "../Shared/Team/TeamJoinSignal";
import { Signal } from "../Shared/Util/Signal";
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
export type BlockHitSignal = {
    blockId: number;
    blockPos: Vector3;
    readonly player: Player;
};
export declare const ServerSignals: {
    PlayerJoin: Signal<PlayerJoinServerEvent>;
    PlayerLeave: SyncEvent<typeof PlayerLeaveServerEvent>;
    EntityDamage: Signal<EntityDamageServerSignal>;
    EntityDeath: Signal<EntityDeathServerSignal>;
    EntityDespawn: Signal<Entity>;
    BeforeBlockPlaced: Signal<BeforeBlockPlacedSignal>;
    BlockPlace: Signal<BlockPlaceSignal>;
    /** Fired **before** a block is hit. This signal is cancellable. */
    BeforeBlockHit: Signal<BeforeBlockHitSignal>;
    BlockHit: Signal<BlockHitSignal>;
    /** Fired before a block is destroyed. */
    BeforeBlockDestroyed: Signal<{
        blockMeta: ItemMeta;
        blockPos: Vector3;
        blockId: number;
        entity?: Entity | undefined;
    }>;
    /** Fired when a block is destroyed. */
    BlockDestroyed: Signal<{
        blockMeta: ItemMeta;
        blockPos: Vector3;
        blockId: number;
    }>;
    BeforeEntitySpawn: SyncEvent<typeof BeforeEntitySpawnServerEvent>;
    EntitySpawn: Signal<EntitySpawnEvent>;
    BeforeEntityDropItem: Signal<BeforeEntityDropItemSignal>;
    EntityDropItem: Signal<EntityDropItemSignal>;
    /** Fired when a `GameObject` is added to a collection on the _server_. */
    GameObjectAddedToCollection: Signal<{
        go: GameObject;
        tag: string;
    }>;
    /** Fired when a tag is added to a `GameObject` on the _client_. */
    CollectionManagerTagAdded: Signal<{
        go: GameObject;
        tag: string;
    }>;
    /** Fired when a **tagged** `GameObject` is being replicated. */
    NetGameObjectReplicating: Signal<{
        nob: number;
        tag: string;
    }>;
    /** Fired when a **tagged** `GameObject` is despawning. */
    NetGameObjectDespawning: Signal<{
        nob: number;
        tag: string;
    }>;
    PlayerChangeTeam: Signal<ChangeTeamSignal>;
    /** Fired when a melee weapon is swung. */
    WeaponSwing: Signal<{
        weapon: ItemType;
        swingEntity: Entity;
    }>;
    /** Fired when a melee weapon hits. */
    WeaponHit: Signal<{
        weapon: ItemType;
        swingEntity: Entity;
        hitEntity: Entity;
        damage: number;
    }>;
    /** Fired when a projectile is fired. */
    ProjectileFired: Signal<{
        shooter: Entity;
        launcherItemType: ItemType;
        ammoItemType: ItemType;
    }>;
    /** Fired when projectile hits an object. */
    ProjectileHit: Signal<ProjectileCollideServerSignal>;
    /** Fired when a player successfully purchases a shop item. */
    ShopPurchase: Signal<{
        player: Player;
        shopItem: ShopElement;
    }>;
    /** Fired when a player is eliminated. */
    PlayerEliminated: Signal<{
        player: Player;
    }>;
    CustomMoveCommand: Signal<MoveCommandDataEvent<unknown, unknown>>;
    EntityPickupItem: Signal<{
        entity: Entity;
        groundItem: GroundItem;
    }>;
};
