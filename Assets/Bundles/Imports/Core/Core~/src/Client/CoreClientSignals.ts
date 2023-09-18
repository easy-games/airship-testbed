import { Entity } from "Shared/Entity/Entity";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { ItemType } from "Shared/Item/ItemType";
import { Player } from "Shared/Player/Player";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { ChangeTeamSignal } from "Shared/Team/TeamJoinSignal";
import { Signal } from "Shared/Util/Signal";
import { BeforeBlockHitSignal } from "./Controllers/BlockInteractions/Signal/BeforeBlockHitSignal";
import { ProjectileCollideClientSignal } from "./Controllers/Damage/Projectile/ProjectileCollideClientSignal";
import { ProjectileLaunchedClientSignal } from "./Controllers/Damage/Projectile/ProjectileLaunchedClientSignal";
import { BlockGroupPlaceClientSignal, BlockPlaceClientSignal } from "./Signals/BlockPlaceClientSignal";
import { EntityDamageClientSignal } from "./Signals/EntityDamageClientSignal";
import { EntityDeathClientSignal } from "./Signals/EntityDeathClientSignal";
import { EntitySpawnClientSignal } from "./Signals/EntitySpawnClientEvent";

export const CoreClientSignals = {
	EntitySpawn: new Signal<EntitySpawnClientSignal>(),
	EntityDamage: new Signal<EntityDamageClientSignal>(),
	EntityDeath: new Signal<EntityDeathClientSignal>(),
	EntityDespawn: new Signal<Entity>(),
	PlayerJoin: new Signal<Player>(),
	PlayerLeave: new Signal<Player>(),
	/** Fired before a block is hit. */
	BeforeBlockHit: new Signal<BeforeBlockHitSignal>(),

	AfterBlockHit: new Signal<{ pos: Vector3; blockId: number; entity?: Entity }>(),

	/** Fired before a client-predicted block is placed. */
	BeforeBlockPlaced: new Signal<BeforeBlockPlacedSignal>(),
	/** Fired when a client-predicted block is placed. */
	BlockPlace: new Signal<BlockPlaceClientSignal>(),
	BlockGroupPlace: new Signal<BlockGroupPlaceClientSignal>(),
	PlayerChangeTeam: new Signal<ChangeTeamSignal>(),
	/** Fired when local player swings melee weapon. */
	WeaponSwing: new Signal<{ weapon: ItemType }>(),
	/** Fired when local player's melee weapon hits. */
	WeaponHit: new Signal<{ weapon: ItemType; hitEntity: Entity }>(),
	/** Fired when local player fires a projectile. */
	ProjectileLaunched: new Signal<ProjectileLaunchedClientSignal>(),
	ProjectileCollide: new Signal<ProjectileCollideClientSignal>(),
	/** Fired when a player is eliminated. */
	PlayerEliminated: new Signal<{ player: Player }>(),
	SpectatorTargetChanged: new Signal<{ entity: Entity }>(),
	EntityPickupItem: new Signal<{ entity: Entity; groundItem: GroundItem }>(),
};
